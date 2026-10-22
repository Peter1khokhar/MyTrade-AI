import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import { GoogleGenAI } from '@google/genai';
import connectDB from '@/lib/db/connect';
import Signal from '@/lib/db/models/Signal';
import Trade from '@/lib/db/models/Trade';
import { getSingleTick, getOHLC, getOHLCWithVolume } from '@/lib/market/biquote';
import { analyzeAllIndicators, type OHLCBar } from '@/lib/indicators/technical';
import { analyzeMarketStructure } from '@/lib/indicators/structure';
import { getKillzoneInfo, shouldGenerateSignal } from '@/lib/indicators/killzone';
import { buildICTSMCPrompt } from '@/lib/ai/prompts/ict-smc';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const generateSchema = z.object({
  pair: z.string().min(3),
  timeframe: z.enum(['15m', '30m', '1h', '4h', '1d']),
});

// ═══════════════════════════════════════════════════════════
// 🔄 FETCH BAR DATA WITH VOLUME (Hybrid: Biquote + Yahoo)
// ═══════════════════════════════════════════════════════════
async function fetchBarsWithVolume(
  pair: string,
  timeframe: string,
  limit: number = 100
): Promise<OHLCBar[]> {
  // Try Yahoo Finance first for volume data
  try {
    const yahooSymbol = pair.includes('USD') 
      ? `${pair.slice(0, 3)}${pair.slice(3)}=X` 
      : pair;
    const yahooBars = await getOHLCWithVolume(yahooSymbol, timeframe, limit);
    if (yahooBars && yahooBars.length > 0) {
      console.log(`   📊 Yahoo data: ${yahooBars.length} bars with volume`);
      return yahooBars;
    }
  } catch (err) {
    console.log(`   ⚠️ Yahoo failed, using Biquote (no volume)`);
  }

  // Fallback: Biquote (no volume, but price accurate)
  const bqBars = await getOHLC(pair, timeframe, limit);
  return bqBars.map((b: any) => ({
    time: b.time,
    open: b.open,
    high: b.high,
    low: b.low,
    close: b.close,
    volume: b.volume || 0,
  }));
}

// ═══════════════════════════════════════════════════════════
// 🚀 MAIN HANDLER
// ═══════════════════════════════════════════════════════════
export async function POST(req: Request) {
  try {
    // ── Auth ──
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login ज़रूरी है' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = generateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { pair, timeframe } = validation.data;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎯 SIGNAL GENERATION: ${pair} @ ${timeframe}`);
    console.log(`${'='.repeat(60)}`);

    await connectDB();

    // ── Killzone Check ──
    const killzone = getKillzoneInfo();
    console.log(`🕐 Session: ${killzone.currentSession} (${killzone.quality})`);

    // ── Fetch market data ──
    console.log('📊 Fetching market data...');
    const tick = await getSingleTick(pair);
    if (!tick) {
      return NextResponse.json(
        { success: false, message: 'Market data उपलब्ध नहीं है' },
        { status: 404 }
      );
    }

    const [barsH4, barsH1, barsM15] = await Promise.all([
      fetchBarsWithVolume(pair, '4h', 100),
      fetchBarsWithVolume(pair, '1h', 100),
      fetchBarsWithVolume(pair, '15m', 100),
    ]);

    if (!barsM15 || barsM15.length < 50) {
      return NextResponse.json(
        { success: false, message: 'Insufficient data for analysis' },
        { status: 404 }
      );
    }

    // ── Compute indicators + structure ──
    console.log('🔬 Computing indicators...');
    const indH4 = analyzeAllIndicators(barsH4);
    const indH1 = analyzeAllIndicators(barsH1);
    const indM15 = analyzeAllIndicators(barsM15);

    console.log('🏗️ Detecting market structure...');
    const structH4 = analyzeMarketStructure(barsH4);
    const structH1 = analyzeMarketStructure(barsH1);
    const structM15 = analyzeMarketStructure(barsM15);

    // ── Learning context ──
    const { getLearningContext } = await import('@/lib/ai/get-learning-context');
    const learningContext = await getLearningContext(session.user.id);
    console.log(`📚 Learning context: ${learningContext ? 'YES' : 'NO'}`);

    // ── Build enhanced prompt ──
    const prompt = buildICTSMCPrompt({
      pair,
      timeframe,
      currentPrice: tick.price,
      previousClose: tick.price - tick.change,
      h4: {
        rsi: indH4.rsi,
        sma20: indH4.sma20,
        sma50: indH4.sma50,
        ema20: indH4.ema20,
        ema50: indH4.ema50,
        vwap: indH4.vwap,
        atr: indH4.atr,
        volumeSpike: indH4.volumeSpike,
        trend: indH4.trend,
        structure: structH4,
      },
      h1: {
        rsi: indH1.rsi,
        sma20: indH1.sma20,
        sma50: indH1.sma50,
        ema20: indH1.ema20,
        ema50: indH1.ema50,
        vwap: indH1.vwap,
        atr: indH1.atr,
        volumeSpike: indH1.volumeSpike,
        trend: indH1.trend,
        structure: structH1,
      },
      m15: {
        rsi: indM15.rsi,
        sma20: indM15.sma20,
        sma50: indM15.sma50,
        ema20: indM15.ema20,
        ema50: indM15.ema50,
        vwap: indM15.vwap,
        atr: indM15.atr,
        obv: indM15.obv,
        volumeSpike: indM15.volumeSpike,
        trend: indM15.trend,
        structure: structM15,
        range: indM15.range,
      },
      killzone,
      learningContext,
    });

    // ── Call Gemini ──
    console.log('🤖 Calling Gemini AI...');
    let response;
    let lastError;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: (process.env.GEMINI_MODEL as string) || 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3, // Lower temp = more consistent
          },
        });
        console.log(`   ✅ Success on attempt ${attempt}`);
        break;
      } catch (error: any) {
        lastError = error;
        console.log(`   ⚠️ Attempt ${attempt} failed: ${error.message}`);
        if (attempt < 3 && (error.message?.includes('503') || error.message?.includes('UNAVAILABLE'))) {
          const waitTime = attempt * 3000;
          await new Promise((r) => setTimeout(r, waitTime));
          continue;
        }
        throw error;
      }
    }

    if (!response) throw lastError || new Error('AI failed');

    const aiText = response.text || '';
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI ने valid JSON नहीं दिया');

    const aiSignal = JSON.parse(jsonMatch[0]);
    console.log(`📝 Signal: ${aiSignal.signal} (${aiSignal.confidence}% / Quality: ${aiSignal.qualityScore}/10)`);

    // ── Quality gate ──
    if (aiSignal.signal === 'HOLD' || aiSignal.qualityLabel === 'REJECT') {
      console.log(`⛔ Rejected signal — Quality: ${aiSignal.qualityScore}/10`);
      return NextResponse.json({
        success: true,
        signal: null,
        message: aiSignal.reason || 'No high-quality setup found',
        qualityScore: aiSignal.qualityScore,
        warnings: aiSignal.warnings || [],
      });
    }

    // ── Save signal ──
    const savedSignal = await Signal.create({
      userId: session.user.id,
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
      riskReward: aiSignal.riskReward,
      strategy: aiSignal.strategy,
      bestTimeToEnter: aiSignal.bestTimeToEnter,
      largeMove: aiSignal.largeMove || { possible: false, pips: 0, reason: '' },
      confluenceBreakdown: aiSignal.confluenceBreakdown,
      warnings: aiSignal.warnings,
      marketData: {
        currentPrice: tick.price,
        session: killzone.currentSession,
        killzoneQuality: killzone.quality,
        h4Bias: structH4.bias,
        h1Bias: structH1.bias,
        m15Bias: structM15.bias,
      },
    });

    console.log(`💾 Signal saved: ${savedSignal._id}`);

    // ── Auto-create Trade ──
    let createdTrade = null;
    if (aiSignal.signal === 'BUY' || aiSignal.signal === 'SELL') {
      try {
        const maxHours =
          timeframe === '15m' ? 1 :
          timeframe === '30m' ? 2 :
          timeframe === '1h' ? 4 :
          timeframe === '4h' ? 12 : 24;
        const maxExitTime = new Date();
        maxExitTime.setHours(maxExitTime.getHours() + maxHours);

        createdTrade = await Trade.create({
          userId: session.user.id,
          signalId: savedSignal._id,
          pair,
          direction: aiSignal.signal,
          timeframe,
          entryPrice: aiSignal.entryPrice,
          entryTime: new Date(),
          tp1: aiSignal.takeProfit1,
          tp2: aiSignal.takeProfit2 || aiSignal.takeProfit1,
          tp3: aiSignal.takeProfit3 || aiSignal.takeProfit2 || aiSignal.takeProfit1,
          sl: aiSignal.stopLoss,
          mfe: 0,
          mae: 0,
          maxExitTime,
          status: 'ACTIVE',
          confidence: aiSignal.confidence,
          strategy: aiSignal.strategy,
          reason: aiSignal.reason,
        });
        console.log(`🎯 Trade auto-created: ${createdTrade._id}`);
      } catch (tradeError) {
        console.error('⚠️ Trade auto-create failed:', tradeError);
      }
    }

    return NextResponse.json({
      success: true,
      signal: savedSignal,
      trade: createdTrade,
      autoTracked: !!createdTrade,
    });

  } catch (error) {
    console.error('❌ Signal generation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Signal generate नहीं हुआ',
      },
      { status: 500 }
    );
  }
}