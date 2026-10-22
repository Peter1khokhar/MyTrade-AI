import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import Notification from '@/lib/db/models/Notification';
import { getSingleTick, getOHLC } from '@/lib/market/biquote';
import { analyzeICTSetup } from '@/lib/ai/market-scanner';
import { sendTelegramMessage, formatSignalMessage } from '@/lib/telegram/send';

// ═══════════════════════════════════════════════════════════
// 🔐 Verify Cron Secret
// ═══════════════════════════════════════════════════════════
function verifyCronSecret(req: Request): boolean {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('❌ CRON_SECRET not set in env');
    return false;
  }
  return authHeader === `Bearer ${cronSecret}`;
}

// ═══════════════════════════════════════════════════════════
// 🎯 POST - Scan Markets
// ═══════════════════════════════════════════════════════════
export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    // 1. Verify Auth
    if (!verifyCronSecret(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 Market Scanner Started: ${new Date().toISOString()}`);
    console.log(`${'='.repeat(60)}`);

    // 2. Killzone filter (Optional - Testing ke liye comment out kar sakte ho)
    const now = new Date();
    const istHour = parseInt(
      now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false })
    );
    const isLondonKillzone = istHour >= 12 && istHour <= 15;
    const isNYKillzone = istHour >= 17 && istHour <= 20;

    // ⚠️ Testing ke liye abhi isko bypass kar rahe hain. 
    // Production mein isko uncomment kar dena.
    /*
    if (!isLondonKillzone && !isNYKillzone) {
      console.log(`⏰ Outside killzone (IST ${istHour}:00) - skipping scan`);
      return NextResponse.json({ success: true, message: 'Outside killzone' });
    }
    */

    await connectDB();

    // 3. Get users
    const users = await User.find({
      watchlist: { $exists: true, $ne: [] },
    }).select('_id name email watchlist telegramChatId telegramConnected');

    console.log(`👥 Users to scan for: ${users.length}`);

    if (users.length === 0) {
      return NextResponse.json({ success: true, message: 'No active users', usersScanned: 0 });
    }

    // 4. Collect unique pairs
    const allPairs = new Set<string>();
    users.forEach((user) => {
      user.watchlist.forEach((pair: string) => allPairs.add(pair));
    });

    console.log(`📊 Unique pairs: ${Array.from(allPairs).join(', ')}`);

    // 5. Analyze pairs
    const pairAnalysis = new Map();

    for (const pair of allPairs) {
      try {
        console.log(`\n🎯 Analyzing ${pair}...`);

        // Fetch data
        const [tick, h4Data, h1Data, m15Data] = await Promise.all([
          getSingleTick(pair),
          getOHLC(pair, '4h', 50),
          getOHLC(pair, '1h', 100),
          getOHLC(pair, '15m', 100),
        ]);

        if (!tick || !h4Data || !h1Data || !m15Data) {
          console.log(`   ⚠️ Data missing for ${pair}`);
          continue;
        }

        // ✅ FIX: Properly structured params
        const analysis = await analyzeICTSetup({
          pair: pair,
          currentPrice: tick?.price || 0,
          h4Data: h4Data,
          h1Data: h1Data,
          m15Data: m15Data,
        });

        console.log(`   📈 Signal: ${analysis.signal} (${analysis.confidence}%)`);
        console.log(`   🎯 Confluence: ${analysis.confluenceScore}`);

        if (analysis.signal !== 'HOLD' && analysis.confidence >= 70) {
          pairAnalysis.set(pair, analysis);
          console.log(`   ✅ Valid signal!`);
        } else {
          console.log(`   ⏭️ Skipped (low confidence)`);
        }

      } catch (error) {
        console.error(`❌ Error analyzing ${pair}:`, error);
      }
    }

    // 6. Create notifications
    let notificationsCreated = 0;

    for (const user of users) {
      for (const pair of user.watchlist) {
        const analysis = pairAnalysis.get(pair);
        if (!analysis) continue;

        // Save Notification
        await Notification.create({
          userId: user._id,
          type: 'signal',
          title: `🎯 ${analysis.signal} Signal: ${pair}`,
          message: `${analysis.signal} setup detected with ${analysis.confidence}% confidence.`,
          pair: pair,
          signal: analysis.signal,
          confidence: analysis.confidence,
          entryPrice: analysis.entryPrice,
          stopLoss: analysis.stopLoss,
          takeProfit: analysis.takeProfit,
          timeframe: analysis.timeframe,
          strategy: analysis.strategy,
          reason: analysis.reason,
          confluenceScore: analysis.confluenceScore,
        });

        notificationsCreated++;

        // Send Telegram
        if (user.telegramConnected && user.telegramChatId) {
          try {
            const message = formatSignalMessage({
              pair, signal: analysis.signal, confidence: analysis.confidence,
              entryPrice: analysis.entryPrice, stopLoss: analysis.stopLoss,
              takeProfit: analysis.takeProfit, timeframe: analysis.timeframe,
              strategy: analysis.strategy, reason: analysis.reason,
              confluenceScore: analysis.confluenceScore,
            });
            await sendTelegramMessage(user.telegramChatId, message);
            console.log(`   📱 Telegram sent to ${user.email}`);
          } catch (err) {
            console.error(`   ❌ Telegram failed:`, err);
          }
        }
      }
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: 'Scan complete',
      stats: {
        usersScanned: users.length,
        pairsAnalyzed: allPairs.size,
        validSignals: pairAnalysis.size,
        notificationsCreated,
        durationMs: duration,
      },
    });

  } catch (error) {
    console.error('❌ Scanner error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Scan failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return POST(req);
}