import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-check';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import Payment from '@/lib/db/models/Payment';
import Subscription from '@/lib/db/models/Subscription';
import Signal from '@/lib/db/models/Signal';

// ═══════════════════════════════════════════════════════════
// 📊 GET - Admin Dashboard Stats
// ═══════════════════════════════════════════════════════════

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // ───────────────────────────────────────────────
    // 👥 User Stats
    // ───────────────────────────────────────────────
    const [
      totalUsers,
      proUsers,
      specialUsers,
      freeTrialUsers,
      newUsersToday,
      newUsersThisWeek,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ plan: { $in: ['weekly', 'monthly'] }, planExpiry: { $gt: now } }),
      User.countDocuments({ isSpecial: true }),
      User.countDocuments({ plan: 'free_trial' }),
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
    ]);

    // ───────────────────────────────────────────────
    // 💰 Revenue Stats
    // ───────────────────────────────────────────────
    const [
      revenueThisMonth,
      revenueToday,
      totalRevenue,
      successfulPayments,
      pendingPayments,
      failedPayments,
    ] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'success', createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'success', createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.countDocuments({ status: 'success' }),
      Payment.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'failed' }),
    ]);

    // ───────────────────────────────────────────────
    // 📈 Signal Stats
    // ───────────────────────────────────────────────
    const [
      totalSignals,
      signalsToday,
      signalsThisMonth,
    ] = await Promise.all([
      Signal.countDocuments(),
      Signal.countDocuments({ createdAt: { $gte: todayStart } }),
      Signal.countDocuments({ createdAt: { $gte: monthStart } }),
    ]);

    // ───────────────────────────────────────────────
    // 📊 Weekly Revenue Chart (Last 7 days)
    // ───────────────────────────────────────────────
    const revenueByDay = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: weekAgo },
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
    // 📊 Daily user signups (Last 7 days)
    // ───────────────────────────────────────────────
    const usersByDay = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: weekAgo },
        },
      },
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
      stats: {
        users: {
          total: totalUsers,
          pro: proUsers,
          special: specialUsers,
          freeTrial: freeTrialUsers,
          newToday: newUsersToday,
          newThisWeek: newUsersThisWeek,
        },
        revenue: {
          thisMonth: revenueThisMonth[0]?.total || 0,
          today: revenueToday[0]?.total || 0,
          total: totalRevenue[0]?.total || 0,
          payments: {
            success: successfulPayments,
            pending: pendingPayments,
            failed: failedPayments,
          },
        },
        signals: {
          total: totalSignals,
          today: signalsToday,
          thisMonth: signalsThisMonth,
        },
        charts: {
          revenueByDay: revenueByDay.map((d) => ({
            date: `${d._id.year}-${String(d._id.month).padStart(2, '0')}-${String(d._id.day).padStart(2, '0')}`,
            revenue: d.revenue,
            count: d.count,
          })),
          usersByDay: usersByDay.map((d) => ({
            date: `${d._id.year}-${String(d._id.month).padStart(2, '0')}-${String(d._id.day).padStart(2, '0')}`,
            count: d.count,
          })),
        },
      },
    });

  } catch (error) {
    console.error('❌ Admin stats error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch stats',
      },
      { status: 500 }
    );
  }
}