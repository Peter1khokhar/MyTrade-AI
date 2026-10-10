import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import Subscription from '@/lib/db/models/Subscription';

// ═══════════════════════════════════════════════════════════
// 📦 GET - Current User Subscription
// ═══════════════════════════════════════════════════════════

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login ज़रूरी है' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).select(
      'plan planExpiry isSpecial specialNote totalSpent'
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User नहीं मिला' },
        { status: 404 }
      );
    }

    // Get active subscription
    const subscription = await Subscription.findOne({
      userId: session.user.id,
      status: 'active',
    }).sort({ createdAt: -1 });

    // Calculate days remaining
    let daysRemaining = 0;
    if (user.planExpiry) {
      const now = new Date();
      const diff = user.planExpiry.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    return NextResponse.json({
      success: true,
      subscription: {
        plan: user.plan,
        planExpiry: user.planExpiry,
        daysRemaining,
        isSpecial: user.isSpecial,
        specialNote: user.specialNote,
        totalSpent: user.totalSpent,
        activeSubscription: subscription ? {
          id: subscription._id,
          plan: subscription.plan,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
        } : null,
      },
    });

  } catch (error) {
    console.error('❌ Subscription fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}