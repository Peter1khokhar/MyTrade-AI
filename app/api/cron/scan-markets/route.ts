import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import Signal from '@/lib/db/models/Signal';
import Notification from '@/lib/db/models/Notification';
import { getSingleTick, getOHLC, getOHLCWithVolume } from '@/lib/market/biquote';
import { analyzeAllIndicators, type OHLCBar } from '@/lib/indicators/technical';
import { analyzeMarketStructure } from '@/lib/indicators/structure';
import { getKillzoneInfo, shouldGenerateSignal } from '@/lib/indicators/killzone';
import { buildICTSMCPrompt } from '@/lib/ai/prompts/ict-smc';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// ═══════════════════════════════════════════════════════════
// 📨 TELEGRAM SENDER HELPER
// ═══════════════════════════════════════════════════════════
async function sendTelegramMessage(chatId: string, message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) {
    console.log(`[TELEGRAM] Missing token or chatId. Token: ${!!token}, ChatId: ${!!chatId}`);
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
    
    if (!res.ok) {
      const err = await res.json();
      console.error('[TELEGRAM] API Error:', err);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[TELEGRAM] Fetch error:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// 🔄 FETCH BARS WITH VOLUME
// ═══════════════════════════════════════════════════════════
async function fetchBarsWithVolume(pair: string, timeframe: string, limit: number = 100): Promise<OHLCBar[]> {
  try {
    const yahooSymbol = pair.includes('USD') ? `${pair.slice(0, 3)}${pair.slice(3)}=X` : pair;
    const yahooBars = await getOHLCWithVolume(yahooSymbol, timeframe, limit);
    if (yahooBars && yahooBars.length > 0) return yahooBars;
  } catch (err) {
    // Fallback to Biquote below
  }
  
  const bqBars = await getOHLC(pair, timeframe, limit);
  return bqBars.map((b: any) => ({
    time: b.time, open: b.open, high: b.high, low: b.low, close: b.close, volume: b.volume || 0,
  }));
}

// ═══════════════════════════════════════════════════════════
// 🚀 MAIN CRON HANDLER
// ═══════════════════════════════════════════════════════════
export async function GET(req: Request) {
  try {
    // 1. Security Check
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // 2. Killzone Check (Strict Mode) — Agar dead zone hai to exit
    const killzone = getKillzoneInfo();
    const zoneCheck = shouldGenerateSignal(true); 
    
    if (!zoneCheck.allowed) {
      console.log(`[CRON] ⏸️ Skipping scan. ${zoneCheck.reason}`);
      return NextResponse.json({ 
        success: true, 
        message: 'Outside killzone — no scanning', 
        session: killzone.currentSession 
      });
    }

    console.log(`[CRON] 🟢 Scanning started. Session: ${killzone.currentSession}`);

    // 3. Get active users
    const users = await User.find({ isActive: true });
    
    let totalScanned = 0;
    let signalsGenerated = 0;

    for (const user of users) {
      // 4. Get user's watchlist (User model ke andar se array utha rahe hain)
      const userPairs = user.watchlist || [];
      
      // Array of strings ko objects mein convert karo taaki loop kaam kare
      const watchlist = userPairs.map((pair: string) => ({
        pair: pair,
        timeframe: '15m', // Default timeframe
        isActive: true
      }));
      
      for (const item of watchlist) {
        totalScanned++;
        const { pair, timeframe } = item;

        try {
          // 5. Fetch Market Data
          const tick = await getSingleTick(pair);
          if (!tick) continue;

          const [barsH4, barsH1, barsM15] = await Promise.all([
            fetchBarsWithVolume(pair, '4h', 100),
            fetchBarsWithVolume(pair, '1h', 100),
            fetchBarsWithVolume(pair, '15m', 100),
          ]);

          if (!barsM15 || barsM15.length < 50) continue;

          // 6. Calculate Indicators & Structure
          const indH4 = analyzeAllIndicators(barsH4);
          const indH1 = analyzeAllIndicators(barsH1);
          const indM15 = analyzeAllIndicators(barsM15);

          const structH4 = analyzeMarketStructure(barsH4);
          const structH1 = analyzeMarketStructure(barsH1);
          const structM15 = analyzeMarketStructure(barsM15);

          // 7. Build Prompt & Call AI
          const prompt = buildICTSMCPrompt({
            pair, 
            timeframe,
            currentPrice: tick.price,
            previousClose: tick.price - tick.change,
            h4: { 
              ...indH4, 
              trend: indH4.trend,
              volumeSpike: indH4.volumeSpike,
              structure: structH4 
            },
            h1: { 
              ...indH1, 
              trend: indH1.trend,
              volumeSpike: indH1.volumeSpike,
              structure: structH1 
            },
            m15: { 
              ...indM15, 
              trend: indM15.trend,
              volumeSpike: indM15.volumeSpike,
              structure: structM15 
            },
            killzone,
          });

          const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', temperature: 0.2 },
          });

          const aiText = response.text || '';
          const jsonMatch = aiText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) continue;

          const aiSignal = JSON.parse(jsonMatch[0]);

          // 8. STRICT QUALITY GATE: Only proceed if signal is BUY/SELL AND quality >= 7
          if (
            (aiSignal.signal === 'BUY' || aiSignal.signal === 'SELL') &&
            aiSignal.qualityScore >= 7
          ) {
            
            // 👇 NEW: Signal Deduplication (Spam Protection)
            // Check karo ki pichle 1 ghante me same signal bheja gaya hai kya?
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const existingSignal = await Signal.findOne({
              userId: user._id,
              pair: pair,
              signal: aiSignal.signal,
              createdAt: { $gte: oneHourAgo }
            });

            if (existingSignal) {
              console.log(`[CRON] ⏭️ Skipping duplicate signal for ${pair} ${aiSignal.signal} (sent recently)`);
              continue; // Skip and move to next pair
            }

            signalsGenerated++;
            console.log(`[CRON] 🎯 High-quality signal: ${pair} ${aiSignal.signal} (Quality: ${aiSignal.qualityScore})`);

            // 9. Save Signal in DB
            const savedSignal = await Signal.create({
              userId: user._id,
              pair, 
              timeframe,
              signal: aiSignal.signal,
              confidence: aiSignal.confidence,
              qualityScore: aiSignal.qualityScore,
              entryPrice: aiSignal.entryPrice,
              stopLoss: aiSignal.stopLoss,
              takeProfit1: aiSignal.takeProfit1,
              takeProfit2: aiSignal.takeProfit2,
              takeProfit3: aiSignal.takeProfit3,
              reason: aiSignal.reason,
              strategy: aiSignal.strategy,
              bestTimeToEnter: aiSignal.bestTimeToEnter,
              marketData: {
                currentPrice: tick.price,
                session: killzone.currentSession,
                h4Bias: structH4.bias,
                h1Bias: structH1.bias,
                m15Bias: structM15.bias,
              },
            });

            // 10. Create In-App Notification (FIXED FOR MODEL)
            await Notification.create({
              userId: user._id,
              type: 'signal',
              title: `${aiSignal.signal} Signal: ${pair}`,
              message: `AI detected a ${aiSignal.signal} setup on ${pair} with ${aiSignal.confidence}% confidence.`,
              isRead: false,
              
              // Model ke hisaab se top-level pe fields
              pair: pair,
              signal: aiSignal.signal,
              confidence: aiSignal.confidence,
              entryPrice: aiSignal.entryPrice,
              stopLoss: aiSignal.stopLoss,
              takeProfit: aiSignal.takeProfit1,
              timeframe: timeframe,
              strategy: aiSignal.strategy,
              reason: aiSignal.reason,
              confluenceScore: `${aiSignal.qualityScore}/10 confluence`,
            });

            // 11. Send Telegram Alert
            console.log(`[TELEGRAM] Checking user ${user.email}. ChatId: ${user.telegramChatId || 'MISSING'}`);
            
            if (user.telegramChatId) {
              const tgMessage = `
🚨 <b>MYTRADE AI SIGNAL</b> 🚨
<b>Pair:</b> ${pair}
<b>Direction:</b> ${aiSignal.signal === 'BUY' ? '🟢 BUY' : '🔴 SELL'}
<b>Timeframe:</b> ${timeframe}
<b>Quality Score:</b> ${aiSignal.qualityScore}/10 ⭐

<b>Entry:</b> ${aiSignal.entryPrice}
<b>Stop Loss:</b> ${aiSignal.stopLoss}
<b>Take Profit 1:</b> ${aiSignal.takeProfit1}
<b>Take Profit 2:</b> ${aiSignal.takeProfit2}

<b>Reason:</b> ${aiSignal.reason}

<i>Session: ${killzone.currentSession}</i>
              `.trim();

              const sent = await sendTelegramMessage(user.telegramChatId, tgMessage);
              console.log(`[TELEGRAM] Message sent status for ${user.email}: ${sent}`);
            } else {
              console.log(`[TELEGRAM] ⚠️ No telegramChatId found for ${user.email}. Skipping Telegram.`);
            }
          }

        } catch (error) {
          console.error(`[CRON] Error scanning ${pair}:`, error);
        }

        // Add small delay to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log(`[CRON] ✅ Scan complete. Scanned: ${totalScanned}, Signals: ${signalsGenerated}`);

    return NextResponse.json({
      success: true,
      message: 'Scan completed',
      session: killzone.currentSession,
      totalScanned,
      signalsGenerated,
    });

  } catch (error) {
    console.error('[CRON] Fatal error:', error);
    return NextResponse.json({ success: false, error: 'Scan failed' }, { status: 500 });
  }
}