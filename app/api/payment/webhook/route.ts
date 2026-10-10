import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db/connect';
import Payment from '@/lib/db/models/Payment';
import Subscription from '@/lib/db/models/Subscription';
import User from '@/lib/db/models/User';
import { calculateExpiry, PLANS, PlanId } from '@/lib/payment/razorpay';

// ═══════════════════════════════════════════════════════════
// 🔐 Webhook Signature Verification
// ═══════════════════════════════════════════════════════════

function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// 🔔 POST - Razorpay Webhook Handler
// ═══════════════════════════════════════════════════════════

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, message: 'No signature' },
        { status: 400 }
      );
    }

    // ⚠️ Webhook secret अलग होता है - Razorpay Dashboard में set करेंगे
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    
    // Verify webhook
    const isValid = verifyWebhookSignature(body, signature, webhookSecret);
    
    if (!isValid) {
      console.log('❌ Invalid webhook signature');
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    console.log(`\n🔔 Webhook received: ${event.event}`);

    await connectDB();

    // Handle different events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;

      case 'order.paid':
        console.log(`✅ Order paid: ${event.payload.order.entity.id}`);
        break;

      default:
        console.log(`ℹ️ Unhandled event: ${event.event}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { success: false, message: 'Webhook failed' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// 💰 Handle Payment Captured
// ═══════════════════════════════════════════════════════════

async function handlePaymentCaptured(paymentData: any) {
  try {
    const orderId = paymentData.order_id;
    const paymentId = paymentData.id;

    console.log(`💰 Payment captured: ${paymentId} for order ${orderId}`);

    const payment = await Payment.findOne({ razorpayOrderId: orderId });
    
    if (!payment) {
      console.log(`⚠️ Payment record not found for order: ${orderId}`);
      return;
    }

    if (payment.status === 'success') {
      console.log(`✅ Payment already processed`);
      return;
    }

    // Update payment
    payment.status = 'success';
    payment.razorpayPaymentId = paymentId;
    await payment.save();

    // Get plan
    const plan = PLANS[payment.planType as PlanId];
    if (!plan) return;

    // Create subscription
    const startDate = new Date();
    const endDate = calculateExpiry(plan.durationDays, startDate);

    const subscription = await Subscription.create({
      userId: payment.userId,
      plan: payment.planType,
      status: 'active',
      startDate,
      endDate,
      amount: payment.amount,
      currency: 'INR',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      source: 'razorpay',
    });

    // Update user
    await User.findByIdAndUpdate(payment.userId, {
      plan: payment.planType,
      planExpiry: endDate,
      $inc: { totalSpent: payment.amount },
      lastActiveAt: new Date(),
    });

    payment.subscriptionId = subscription._id;
    await payment.save();

    console.log(`🎉 Subscription activated via webhook`);

  } catch (error) {
    console.error('❌ Handle payment captured error:', error);
  }
}

// ═══════════════════════════════════════════════════════════
// ❌ Handle Payment Failed
// ═══════════════════════════════════════════════════════════

async function handlePaymentFailed(paymentData: any) {
  try {
    const orderId = paymentData.order_id;
    const reason = paymentData.error_description || 'Payment failed';

    console.log(`❌ Payment failed for order ${orderId}: ${reason}`);

    await Payment.findOneAndUpdate(
      { razorpayOrderId: orderId },
      {
        status: 'failed',
        failureReason: reason,
        razorpayPaymentId: paymentData.id,
      }
    );

  } catch (error) {
    console.error('❌ Handle payment failed error:', error);
  }
}