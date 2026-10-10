import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-check';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import Payment from '@/lib/db/models/Payment';

// ═══════════════════════════════════════════════════════════
// 📊 GET - List all users with filters
// ═══════════════════════════════════════════════════════════

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const plan = searchParams.get('plan') || 'all';
    const status = searchParams.get('status') || 'all';
    const sort = searchParams.get('sort') || 'recent';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (plan !== 'all') {
      query.plan = plan;
    }

    if (status === 'special') {
      query.isSpecial = true;
    } else if (status === 'pro') {
      query.plan = { $in: ['weekly', 'monthly'] };
      query.planExpiry = { $gt: new Date() };
    } else if (status === 'expired') {
      query.planExpiry = { $lt: new Date() };
      query.plan = { $ne: 'free' };
    } else if (status === 'free') {
      query.plan = 'free';
    }

    // Sort options
    let sortOption: any = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'spent') sortOption = { totalSpent: -1 };

    // Fetch users
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -emailVerificationCode -passwordResetCode')
        .sort(sortOption)
        .limit(limit)
        .skip(skip)
        .lean(),
      User.countDocuments(query),
    ]);

    // Get latest payment for each user
    const usersWithPayments = await Promise.all(
      users.map(async (user) => {
        const lastPayment = await Payment.findOne({
          userId: user._id,
          status: 'success',
        })
          .sort({ createdAt: -1 })
          .select('amount createdAt planType')
          .lean();

        return {
          ...user,
          lastPayment,
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: usersWithPayments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('❌ Admin users fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}