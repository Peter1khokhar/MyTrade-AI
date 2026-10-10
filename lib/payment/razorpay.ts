import Razorpay from 'razorpay';

// ═══════════════════════════════════════════════════════════
// 💰 Razorpay Client
// ═══════════════════════════════════════════════════════════

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('⚠️ Razorpay keys not set - payments will not work');
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// ═══════════════════════════════════════════════════════════
// 📋 Plan Configuration
// ═══════════════════════════════════════════════════════════

export const PLANS = {
  weekly: {
    id: 'weekly',
    name: 'Weekly Pro',
    amount: 140,        // INR
    durationDays: 7,
    description: '7 days of unlimited signals',
  },
  monthly: {
    id: 'monthly',
    name: 'Monthly Pro',
    amount: 499,        // INR
    durationDays: 30,
    description: '30 days of unlimited signals',
  },
  free_trial: {
    id: 'free_trial',
    name: 'Free Trial',
    amount: 0,
    durationDays: 2,
    description: '2 days free trial',
  },
} as const;

export type PlanId = keyof typeof PLANS;

// ═══════════════════════════════════════════════════════════
// 🎯 Helper: Create Razorpay Order
// ═══════════════════════════════════════════════════════════

export async function createRazorpayOrder({
  amount,
  currency = 'INR',
  receipt,
  notes,
}: {
  amount: number;      // INR (will convert to paise)
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),  // Convert to paise
      currency,
      receipt,
      notes: notes || {},
    });

    return order;
  } catch (error) {
    console.error('❌ Razorpay order creation failed:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// 🔐 Helper: Verify Payment Signature
// ═══════════════════════════════════════════════════════════

import crypto from 'crypto';

export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  try {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('❌ Signature verification failed:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// 📅 Helper: Calculate Expiry Date
// ═══════════════════════════════════════════════════════════

export function calculateExpiry(durationDays: number, from?: Date): Date {
  const start = from || new Date();
  const expiry = new Date(start);
  expiry.setDate(expiry.getDate() + durationDays);
  return expiry;
}