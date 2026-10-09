import { NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { hashOTP } from '@/lib/auth/otp';

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Code must be 6 digits'),
});

const MAX_ATTEMPTS = 5;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid data' },
        { status: 400 }
      );
    }

    const { email, code } = validation.data;
    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+emailVerificationCode +emailVerificationExpiry');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email already verified',
        alreadyVerified: true,
      });
    }

    // 🚫 Attempts check
    if (user.emailVerificationAttempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many failed attempts. Request new code.',
          tooManyAttempts: true,
        },
        { status: 429 }
      );
    }

    // ⏱️ Expiry check
    if (
      !user.emailVerificationExpiry ||
      new Date() > user.emailVerificationExpiry
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Code expired. Request new code.',
          expired: true,
        },
        { status: 410 }
      );
    }

    // ✅ Verify code
    const hashedInput = hashOTP(code);
    const isValid = hashedInput === user.emailVerificationCode;

    if (!isValid) {
      user.emailVerificationAttempts += 1;
      await user.save();

      const remaining = MAX_ATTEMPTS - user.emailVerificationAttempts;

      return NextResponse.json(
        {
          success: false,
          message: `Invalid code. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`,
          remainingAttempts: remaining,
        },
        { status: 400 }
      );
    }

    // 🎉 Success
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpiry = undefined;
    user.emailVerificationAttempts = 0;
    await user.save();

    console.log(`✅ Email verified: ${email}`);

    return NextResponse.json({
      success: true,
      message: '🎉 Email verified successfully!',
      verified: true,
    });

  } catch (error) {
    console.error('❌ Verify email error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Verification failed',
      },
      { status: 500 }
    );
  }
}