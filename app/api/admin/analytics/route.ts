import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-check';
import connectDB from '@/lib/db/connect';
import Signal from '@/lib/db/models/Signal';
import Trade from '@/lib/db/models/Trade';
import User from '@/lib/db/models/User';

// ═══════════════════════════════════════════════════════════
// 📊 GET - Analytics Data
// ═══════════════════════════════════════════════════════════

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // ───────────────────────────────────────────────
    // 🔥 Top Traded Pairs (This Month)
    // ───────────────────────────────────────────────
    const topPairs = await Signal.aggregate([
      { $match: { createdAt: { $gte: monthStart } } },
      {
        $group: {
          _id: '$pair',
          totalSignals: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          avgConfidence: { $avg: '$confidence' },
        },
      },
      {
        $project: {
          pair: '$_id',
          totalSignals: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          avgConfidence: { $round: ['$avgConfidence', 1] },
        },
      },
      { $sort: { totalSignals: -1 } },
      { $limit: 10 },
    ]);

    // ───────────────────────────────────────────────
    // 🏆 Top Performing Pairs (by win rate)
    // ───────────────────────────────────────────────
    const topPerformingPairs = await Trade.aggregate([
      { $match: { status: 'CLOSED', exitTime: { $gte: monthStart } } },
      {
        $group: {
          _id: '$pair',
          totalTrades: { $sum: 1 },
          wins: {
            $sum: {
              $cond: [{ $in: ['$exitReason', ['TP1_HIT', 'TP2_HIT', 'TP3_HIT']] }, 1, 0],
            },
          },
          avgPips: { $avg: '$pipsResult' },
        },
      },
      {
        $project: {
          pair: '$_id',
          totalTrades: 1,
          wins: 1,
          winRate: {
            $round: [{ $multiply: [{ $divide: ['$wins', '$totalTrades'] }, 100] }, 1],
          },
          avgPips: { $round: ['$avgPips', 1] },
        },
      },
      { $match: { totalTrades: { $gte: 3 } } },
      { $sort: { winRate: -1 } },
      { $limit: 5 },
    ]);

    // ───────────────────────────────────────────────
    // 📈 Signal Distribution by Type
    // ───────────────────────────────────────────────
    const signalDistribution = await Signal.aggregate([
      { $match: { createdAt: { $gte: monthStart } } },
      {
        $group: {
          _id: '$signal',
          count: { $sum: 1 },
        },
      },
    ]);

    // ───────────────────────────────────────────────
    // 🎯 Timeframe Distribution
    // ───────────────────────────────────────────────
    const timeframeDistribution = await Signal.aggregate([
      { $match: { createdAt: { $gte: monthStart } } },
      {
        $group: {
          _id: '$timeframe',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // ───────────────────────────────────────────────
    // 👥 Active Users (Last 7 days)
    // ───────────────────────────────────────────────
    const activeUsers = await Signal.distinct('userId', {
      createdAt: { $gte: weekAgo },
    });

    // ───────────────────────────────────────────────
    // 📊 Daily Signals (Last 7 days)
    // ───────────────────────────────────────────────
    const dailySignals = await Signal.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // ───────────────────────────────────────────────
    // 📋 Response
    // ───────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      analytics: {
        topPairs,
        topPerformingPairs,
        signalDistribution,
        timeframeDistribution,
        activeUsersCount: activeUsers.length,
        dailySignals: dailySignals.map((d) => ({
          date: `${d._id.year}-${String(d._id.month).padStart(2, '0')}-${String(d._id.day).padStart(2, '0')}`,
          count: d.count,
        })),
      },
    });

  } catch (error) {
    console.error('❌ Admin analytics error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch analytics',
      },
      { status: 500 }
    );
  }
}