import { NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { hashOTP } from '@/lib/auth/otp';

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
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
      .select('+passwordResetCode +passwordResetExpiry +passwordResetVerified');

    if (!user || !user.passwordResetCode) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired code' },
        { status: 400 }
      );
    }

    // Attempts check
    if (user.passwordResetAttempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many failed attempts. Request new code.',
          tooManyAttempts: true,
        },
        { status: 429 }
      );
    }

    // Expiry check
    if (
      !user.passwordResetExpiry ||
      new Date() > user.passwordResetExpiry
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

    // Verify
    const hashedInput = hashOTP(code);
    const isValid = hashedInput === user.passwordResetCode;

    console.log('🔍 Debug - Password Reset:');
    console.log('   Input code:', code);
    console.log('   Hashed input:', hashedInput.substring(0, 16) + '...');
    console.log('   Stored hash:', user.passwordResetCode?.substring(0, 16) + '...');
    console.log('   Match:', isValid);
    console.log('   Expiry:', user.passwordResetExpiry);
    console.log('   Attempts:', user.passwordResetAttempts);

    if (!isValid) {
      user.passwordResetAttempts += 1;
      await user.save();

      const remaining = MAX_ATTEMPTS - user.passwordResetAttempts;

      return NextResponse.json(
        {
          success: false,
          message: `Invalid code. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`,
          remainingAttempts: remaining,
        },
        { status: 400 }
      );
    }

    // ✅ Code verified - mark as verified (not yet reset password)
    user.passwordResetVerified = true;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Code verified! अब नया password set करो',
      verified: true,
    });

  } catch (error) {
    console.error('❌ Verify reset code error:', error);
    return NextResponse.json(
      { success: false, message: 'Verification failed' },
      { status: 500 }
    );
  }
}