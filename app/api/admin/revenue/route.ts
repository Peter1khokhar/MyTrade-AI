import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-check';
import connectDB from '@/lib/db/connect';
import Payment from '@/lib/db/models/Payment';
import User from '@/lib/db/models/User';

// ═══════════════════════════════════════════════════════════
// 💰 GET - Revenue Analytics
// ═══════════════════════════════════════════════════════════

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30'; // days
    const days = parseInt(range);

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // ───────────────────────────────────────────────
    // 💵 Total Revenue (All Time)
    // ───────────────────────────────────────────────
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    // ───────────────────────────────────────────────
    // 📅 Revenue by Day
    // ───────────────────────────────────────────────
    const revenueByDay = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // ───────────────────────────────────────────────
    // 💎 Revenue by Plan Type
    // ───────────────────────────────────────────────
    const revenueByPlan = await Payment.aggregate([
      { $match: { status: 'success' } },
      {
        $group: {
          _id: '$planType',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // ───────────────────────────────────────────────
    // 🏆 Top Paying Users
    // ───────────────────────────────────────────────
    const topPayingUsers = await Payment.aggregate([
      { $match: { status: 'success' } },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$amount' },
          payments: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          image: '$user.image',
          totalSpent: 1,
          payments: 1,
        },
      },
    ]);

    // ───────────────────────────────────────────────
    // 📊 Revenue Comparison (This vs Last Month)
    // ───────────────────────────────────────────────
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [thisMonth, lastMonth] = await Promise.all([
      Payment.aggregate([
        {
          $match: {
            status: 'success',
            createdAt: { $gte: thisMonthStart },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        {
          $match: {
            status: 'success',
            createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ]);

    const thisMonthTotal = thisMonth[0]?.total || 0;
    const lastMonthTotal = lastMonth[0]?.total || 0;
    const growth = lastMonthTotal > 0
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
      : 0;

    // ───────────────────────────────────────────────
    // 📊 Subscription stats
    // ───────────────────────────────────────────────
    const [
      activeProUsers,
      expiredProUsers,
      specialUsers,
    ] = await Promise.all([
      User.countDocuments({
        plan: { $in: ['weekly', 'monthly'] },
        planExpiry: { $gt: now },
      }),
      User.countDocuments({
        plan: { $in: ['weekly', 'monthly'] },
        planExpiry: { $lte: now },
      }),
      User.countDocuments({ isSpecial: true }),
    ]);

    // ───────────────────────────────────────────────
    // 📋 Response
    // ───────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      revenue: {
        total: totalRevenue[0]?.total || 0,
        totalPayments: totalRevenue[0]?.count || 0,
        thisMonth: thisMonthTotal,
        lastMonth: lastMonthTotal,
        growth: parseFloat(growth.toFixed(1)),
      },
      revenueByDay: revenueByDay.map((d) => ({
        date: `${d._id.year}-${String(d._id.month).padStart(2, '0')}-${String(d._id.day).padStart(2, '0')}`,
        revenue: d.revenue,
        count: d.count,
      })),
      revenueByPlan,
      topPayingUsers,
      subscriptionStats: {
        activeProUsers,
        expiredProUsers,
        specialUsers,
      },
    });

  } catch (error) {
    console.error('❌ Revenue analytics error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch revenue',
      },
      { status: 500 }
    );
  }
}