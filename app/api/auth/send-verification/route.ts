import { NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { generateOTP, hashOTP } from '@/lib/auth/otp';
import { resend, EMAIL_FROM } from '@/lib/email/resend';
import { generateOTPEmailHTML } from '@/lib/email/templates/otp-email';

const schema = z.object({
  email: z.string().email('Invalid email'),
});

const OTP_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Valid email भेजो' },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+emailVerificationCode +emailVerificationExpiry +lastVerificationSentAt');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { success: false, message: 'Email already verified' },
        { status: 400 }
      );
    }

    // ⏱️ Resend cooldown check
    if (user.lastVerificationSentAt) {
      const secondsSinceLastSent = Math.floor(
        (Date.now() - new Date(user.lastVerificationSentAt).getTime()) / 1000
      );
      
      if (secondsSinceLastSent < RESEND_COOLDOWN_SECONDS) {
        const waitTime = RESEND_COOLDOWN_SECONDS - secondsSinceLastSent;
        return NextResponse.json(
          {
            success: false,
            message: `Please wait ${waitTime} seconds before requesting new code`,
            waitTime,
          },
          { status: 429 }
        );
      }
    }

    // 🔢 Generate OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    // 💾 Save to DB
    user.emailVerificationCode = hashedOTP;
    user.emailVerificationExpiry = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );
    user.lastVerificationSentAt = new Date();
    user.emailVerificationAttempts = 0;

    await user.save();

    console.log(`📧 Sending OTP to ${email}: ${otp}`);

    // 📤 Send email
    const { error: emailError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Verify your TradeSage AI account',
      html: generateOTPEmailHTML({
        name: user.name,
        otp,
        expiresInMinutes: OTP_EXPIRY_MINUTES,
      }),
    });

    if (emailError) {
      console.error('❌ Email send failed:', emailError);
      return NextResponse.json(
        { success: false, message: 'Email भेजने में error' },
        { status: 500 }
      );
    }

    console.log(`✅ OTP email sent to ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Verification code भेज दिया',
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
      email: email.toLowerCase(),
    });

  } catch (error) {
    console.error('❌ Send verification error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send code',
      },
      { status: 500 }
    );
  }
}