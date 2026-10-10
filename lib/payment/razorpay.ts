import Razorpay from 'razorpay';
import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════
// 💰 Razorpay Client (Lazy Initialization)
// ═══════════════════════════════════════════════════════════

let razorpayClient: Razorpay | null = null;

function getRazorpayClient(): Razorpay {
  if (!razorpayClient) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.warn('⚠️ Razorpay keys not set - payments will not work');
    }

    razorpayClient = new Razorpay({
      key_id: keyId || 'placeholder_key_id',
      key_secret: keySecret || 'placeholder_key_secret',
    });
  }

  return razorpayClient;
}

// Export getter for lazy use
export const razorpay = {
  orders: {
    create: (options: any) => getRazorpayClient().orders.create(options),
  },
};

// ═══════════════════════════════════════════════════════════
// 📋 Plan Configuration
// ═══════════════════════════════════════════════════════════

export const PLANS = {
  weekly: {
    id: 'weekly',
    name: 'Weekly Pro',
    amount: 140,
    durationDays: 7,
    description: '7 days of unlimited signals',
  },
  monthly: {
    id: 'monthly',
    name: 'Monthly Pro',
    amount: 499,
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
// 🎯 Create Razorpay Order
// ═══════════════════════════════════════════════════════════

export async function createRazorpayOrder({
  amount,
  currency = 'INR',
  receipt,
  notes,
}: {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  try {
    const client = getRazorpayClient();
    const order = await client.orders.create({
      amount: Math.round(amount * 100),
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
// 🔐 Verify Payment Signature
// ═══════════════════════════════════════════════════════════

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
// 📅 Calculate Expiry Date
// ═══════════════════════════════════════════════════════════

export function calculateExpiry(durationDays: number, from?: Date): Date {
  const start = from || new Date();
  const expiry = new Date(start);
  expiry.setDate(expiry.getDate() + durationDays);
  return expiry;
}