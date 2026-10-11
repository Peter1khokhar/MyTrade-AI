import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import Notification from '@/lib/db/models/Notification';
import { getSingleTick, getOHLC } from '@/lib/market/biquote';
import { analyzeICTSetup } from '@/lib/ai/market-scanner';

// ═══════════════════════════════════════════════════════════
// 🔐 Verify Cron Secret
// ═══════════════════════════════════════════════════════════

function verifyCronSecret(req: Request): boolean {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('❌ CRON_SECRET not set');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

// ═══════════════════════════════════════════════════════════
// 🎯 POST - Scan Markets (Called by cron-job.org)
// ═══════════════════════════════════════════════════════════

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    // 1. Verify authentication
    if (!verifyCronSecret(req)) {
      console.log('❌ Unauthorized scan attempt');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 Market Scanner Started: ${new Date().toISOString()}`);
    console.log(`${'='.repeat(60)}`);

    await connectDB();

    // 2. Get all users with active plans (only Pro users)
    const users = await User.find({
      plan: { $in: ['weekly', 'monthly', 'special', 'free_trial'] },
      $or: [
        { planExpiry: { $gt: new Date() } },
        { plan: 'special' },
      ],
      watchlist: { $exists: true, $ne: [] },
    }).select('_id name email watchlist plan');

    console.log(`👥 Users to scan for: ${users.length}`);

    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active users to scan for',
        usersScanned: 0,
      });
    }

    // 3. Collect all unique pairs from all users
    const allPairs = new Set<string>();
    users.forEach((user) => {
      user.watchlist.forEach((pair: string) => allPairs.add(pair));
    });

    console.log(`📊 Unique pairs to analyze: ${Array.from(allPairs).join(', ')}`);

    // 4. Analyze each pair (only once per pair)
    const pairAnalysis = new Map();

    for (const pair of allPairs) {
      try {
        console.log(`\n🎯 Analyzing ${pair}...`);

        // Fetch multi-timeframe data
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

        // Run ICT analysis
        const analysis = await analyzeICTSetup({
          pair,
          currentPrice: tick.price,
          h4Data,
          h1Data,
          m15Data,
        });

        console.log(`   📈 Signal: ${analysis.signal} (${analysis.confidence}%)`);
        console.log(`   🎯 Confluence: ${analysis.confluenceScore}`);

        if (analysis.signal !== 'HOLD' && analysis.confidence >= 70) {
          pairAnalysis.set(pair, analysis);
          console.log(`   ✅ Valid signal for ${pair}!`);
        } else {
          console.log(`   ⏭️ Skipped (insufficient confluence)`);
        }

      } catch (error) {
        console.error(`❌ Error analyzing ${pair}:`, error);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Found ${pairAnalysis.size} valid signals`);
    console.log(`${'='.repeat(60)}`);

    // 5. Create notifications for users whose pairs have signals
    let notificationsCreated = 0;

    for (const user of users) {
      for (const pair of user.watchlist) {
        const analysis = pairAnalysis.get(pair);
        if (!analysis) continue;

        // Check if similar notification exists in last hour
        const existingNotification = await Notification.findOne({
          userId: user._id,
          pair,
          createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
        });

        if (existingNotification) {
          console.log(`   ⏭️ Recent notification exists for ${user.email} - ${pair}`);
          continue;
        }

        // Create notification
        await Notification.create({
          userId: user._id,
          type: 'signal',
          title: `🎯 ${analysis.signal} Signal: ${pair}`,
          message: `${analysis.signal} setup detected on ${pair} with ${analysis.confidence}% confidence. Entry: ${analysis.entryPrice}, SL: ${analysis.stopLoss}, TP: ${analysis.takeProfit}`,
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
        console.log(`   📬 Notification for ${user.email} - ${pair}`);
      }
    }

    const duration = Date.now() - startTime;

    console.log(`\n🎉 Scan complete in ${duration}ms`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Pairs analyzed: ${allPairs.size}`);
    console.log(`   Valid signals: ${pairAnalysis.size}`);
    console.log(`   Notifications: ${notificationsCreated}`);
    console.log(`${'='.repeat(60)}\n`);

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
      {
        success: false,
        message: error instanceof Error ? error.message : 'Scan failed',
      },
      { status: 500 }
    );
  }
}

// Also allow GET for easy testing
export async function GET(req: Request) {
  return POST(req);
}