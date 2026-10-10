import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import Payment from '@/lib/db/models/Payment';
import { createRazorpayOrder, PLANS, PlanId } from '@/lib/payment/razorpay';

// ═══════════════════════════════════════════════════════════
// 🎯 Validation Schema
// ═══════════════════════════════════════════════════════════

const schema = z.object({
  planId: z.enum(['weekly', 'monthly']),
});

// ═══════════════════════════════════════════════════════════
// 💰 POST - Create Razorpay Order
// ═══════════════════════════════════════════════════════════

export async function POST(req: Request) {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login ज़रूरी है' },
        { status: 401 }
      );
    }

    // 2. Validate input
    const body = await req.json();
    const validation = schema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid plan' },
        { status: 400 }
      );
    }

    const { planId } = validation.data;
    const plan = PLANS[planId as PlanId];

    if (!plan) {
      return NextResponse.json(
        { success: false, message: 'Plan नहीं मिला' },
        { status: 400 }
      );
    }

    // 3. Connect DB
    await connectDB();

    // 4. Check user
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User नहीं मिला' },
        { status: 404 }
      );
    }

    // 5. Generate receipt ID
    const receipt = `rcpt_${Date.now()}_${session.user.id.toString().slice(-6)}`;

    console.log(`\n💰 Creating order for ${user.email}`);
    console.log(`   Plan: ${plan.name} (₹${plan.amount})`);

    // 6. Create Razorpay order
    const order = await createRazorpayOrder({
      amount: plan.amount,
      currency: 'INR',
      receipt,
      notes: {
        userId: session.user.id.toString(),
        planId,
        userName: user.name,
        userEmail: user.email,
      },
    });

    console.log(`✅ Razorpay order created: ${order.id}`);

    // 7. Save payment record (pending)
    const payment = await Payment.create({
      userId: session.user.id,
      amount: plan.amount,
      currency: 'INR',
      razorpayOrderId: order.id,
      status: 'pending',
      planType: planId as 'weekly' | 'monthly',
      notes: `Order for ${plan.name}`,
    });

    console.log(`💾 Payment record saved: ${payment._id}`);

    // 8. Return order details to frontend
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      plan: {
        id: plan.id,
        name: plan.name,
        amount: plan.amount,
        durationDays: plan.durationDays,
      },
      keyId: process.env.RAZORPAY_KEY_ID,  // ⚠️ Frontend को key देना ज़रूरी
      user: {
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('❌ Create order error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Order create नहीं हुआ',
      },
      { status: 500 }
    );
  }
}