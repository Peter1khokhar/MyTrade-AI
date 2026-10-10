import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { requireAdmin } from '@/lib/auth/admin-check';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import Payment from '@/lib/db/models/Payment';
import Subscription from '@/lib/db/models/Subscription';
import Signal from '@/lib/db/models/Signal';
import { calculateExpiry, PLANS, PlanId } from '@/lib/payment/razorpay';
import mongoose from 'mongoose';

// ═══════════════════════════════════════════════════════════
// 👤 GET - Get single user details
// ═══════════════════════════════════════════════════════════

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;

    const user = await User.findById(id)
      .select('-password -emailVerificationCode -passwordResetCode')
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User नहीं मिला' },
        { status: 404 }
      );
    }

    // Get payments
    const payments = await Payment.find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Get subscriptions
    const subscriptions = await Subscription.find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get signal stats
    const signalStats = await Signal.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' },
        },
      },
    ]);

    // Get favourite pair
    const favPair = await Signal.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: '$pair', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    return NextResponse.json({
      success: true,
      user,
      payments,
      subscriptions,
      stats: {
        totalSignals: signalStats[0]?.total || 0,
        avgConfidence: Math.round(signalStats[0]?.avgConfidence || 0),
        favouritePair: favPair[0]?._id || 'N/A',
      },
    });

  } catch (error) {
    console.error('❌ Admin user detail error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch user',
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// 🎯 PATCH - Update user (make special, change plan, etc.)
// ═══════════════════════════════════════════════════════════

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const session = await auth();
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const { action, planId, specialNote, durationDays } = body;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User नहीं मिला' },
        { status: 404 }
      );
    }

    // ───────────────────────────────────────────────
    // Action: Make Special User
    // ───────────────────────────────────────────────
    if (action === 'make-special') {
      user.isSpecial = true;
      user.specialNote = specialNote || 'Special user';
      user.plan = 'special';
      
      // Give 365 days access
      user.planExpiry = calculateExpiry(365);

      await user.save();

      // Create subscription record
      await Subscription.create({
        userId: user._id,
        plan: 'special',
        status: 'active',
        startDate: new Date(),
        endDate: user.planExpiry,
        amount: 0,
        currency: 'INR',
        source: 'manual',
        addedBy: session?.user?.id,
        specialNote: specialNote || 'Special user',
      });

      return NextResponse.json({
        success: true,
        message: `✅ ${user.name} को Special User बना दिया`,
      });
    }

    // ───────────────────────────────────────────────
    // Action: Remove Special
    // ───────────────────────────────────────────────
    if (action === 'remove-special') {
      user.isSpecial = false;
      user.specialNote = undefined;
      user.plan = 'free';
      user.planExpiry = undefined;

      await user.save();

      return NextResponse.json({
        success: true,
        message: `✅ ${user.name} से Special status हटा दिया`,
      });
    }

    // ───────────────────────────────────────────────
    // Action: Manual Upgrade (Free Pro)
    // ───────────────────────────────────────────────
    if (action === 'manual-upgrade') {
      const plan = PLANS[planId as PlanId];
      if (!plan) {
        return NextResponse.json(
          { success: false, message: 'Invalid plan' },
          { status: 400 }
        );
      }

      const days = durationDays || plan.durationDays;
      const startDate = new Date();
      const endDate = calculateExpiry(days, startDate);

      user.plan = planId as 'weekly' | 'monthly';
      user.planExpiry = endDate;

      await user.save();

      await Subscription.create({
        userId: user._id,
        plan: planId,
        status: 'active',
        startDate,
        endDate,
        amount: 0,
        currency: 'INR',
        source: 'manual',
        addedBy: session?.user?.id,
        specialNote: 'Manual upgrade by admin',
      });

      return NextResponse.json({
        success: true,
        message: `✅ ${user.name} को ${plan.name} मिला (${days} days)`,
      });
    }

    // ───────────────────────────────────────────────
    // Action: Block/Unblock (via isSpecial note)
    // ───────────────────────────────────────────────
    if (action === 'block') {
      user.plan = 'free';
      user.planExpiry = undefined;
      user.specialNote = 'BLOCKED';
      await user.save();

      return NextResponse.json({
        success: true,
        message: `✅ ${user.name} blocked`,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Admin user update error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update user',
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// 🗑️ DELETE - Delete user
// ═══════════════════════════════════════════════════════════

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User नहीं मिला' },
        { status: 404 }
      );
    }

    // Delete related data
    await Promise.all([
      Payment.deleteMany({ userId: id }),
      Subscription.deleteMany({ userId: id }),
      Signal.deleteMany({ userId: id }),
    ]);

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `✅ ${user.name} deleted`,
    });

  } catch (error) {
    console.error('❌ Admin user delete error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete user',
      },
      { status: 500 }
    );
  }
}