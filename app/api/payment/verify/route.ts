import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import Payment from '@/lib/db/models/Payment';
import Subscription from '@/lib/db/models/Subscription';
import { 
  verifyPaymentSignature, 
  calculateExpiry, 
  PLANS,
  PlanId 
} from '@/lib/payment/razorpay';

// ═══════════════════════════════════════════════════════════
// 🎯 Validation Schema
// ═══════════════════════════════════════════════════════════

const schema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  planId: z.enum(['weekly', 'monthly']),
});

// ═══════════════════════════════════════════════════════════
// ✅ POST - Verify Payment Signature
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
        { success: false, message: 'Invalid payment data' },
        { status: 400 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = validation.data;

    console.log(`\n✅ Verifying payment for ${session.user.id}`);
    console.log(`   Order: ${razorpay_order_id}`);
    console.log(`   Payment: ${razorpay_payment_id}`);

    // 3. Verify signature
    const isValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      console.log(`❌ Invalid signature!`);
      
      // Update payment as failed
      await connectDB();
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          status: 'failed',
          failureReason: 'Invalid signature',
          razorpayPaymentId: razorpay_payment_id,
        }
      );

      return NextResponse.json(
        { success: false, message: 'Payment verification failed' },
        { status: 400 }
      );
    }

    console.log(`✅ Signature verified!`);

    // 4. Connect DB
    await connectDB();

    // 5. Find payment record
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: session.user.id,
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'Payment record नहीं मिला' },
        { status: 404 }
      );
    }

    if (payment.status === 'success') {
      return NextResponse.json({
        success: true,
        message: 'Payment already verified',
        alreadyVerified: true,
      });
    }

    // 6. Get plan details
    const plan = PLANS[planId as PlanId];
    if (!plan) {
      return NextResponse.json(
        { success: false, message: 'Plan नहीं मिला' },
        { status: 400 }
      );
    }

    // 7. Update payment as success
    payment.status = 'success';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    console.log(`💾 Payment marked as success`);

    // 8. Create subscription
    const startDate = new Date();
    const endDate = calculateExpiry(plan.durationDays, startDate);

    const subscription = await Subscription.create({
      userId: session.user.id,
      plan: planId as 'weekly' | 'monthly',
      status: 'active',
      startDate,
      endDate,
      amount: plan.amount,
      currency: 'INR',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      source: 'razorpay',
    });

    console.log(`🎉 Subscription created: ${subscription._id}`);

    // 9. Update user
    await User.findByIdAndUpdate(session.user.id, {
      plan: planId as 'weekly' | 'monthly',
      planExpiry: endDate,
      $inc: { totalSpent: plan.amount },
      lastActiveAt: new Date(),
    });

    console.log(`✅ User upgraded: ${planId} until ${endDate.toISOString()}`);

    // 10. Link subscription to payment
    payment.subscriptionId = subscription._id;
    await payment.save();

    // 11. Return success
    return NextResponse.json({
      success: true,
      message: `🎉 ${plan.name} activated!`,
      subscription: {
        id: subscription._id,
        plan: plan.name,
        startDate,
        endDate,
        amount: plan.amount,
      },
    });

  } catch (error) {
    console.error('❌ Verify payment error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Verification failed',
      },
      { status: 500 }
    );
  }
}