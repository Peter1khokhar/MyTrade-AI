import { NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { generateOTP, hashOTP } from '@/lib/auth/otp';
import { resend, EMAIL_FROM } from '@/lib/email/resend';
import { generatePasswordResetEmailHTML } from '@/lib/email/templates/password-reset-email';

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
      .select('+passwordResetCode +passwordResetExpiry +lastPasswordResetSentAt');

    // ⚠️ Security: Don't reveal if email exists
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'अगर ये email registered है तो reset code भेजा जाएगा',
        email: email.toLowerCase(),
      });
    }

    // Cooldown check
    if (user.lastPasswordResetSentAt) {
      const secondsSinceLastSent = Math.floor(
        (Date.now() - new Date(user.lastPasswordResetSentAt).getTime()) / 1000
      );

      if (secondsSinceLastSent < RESEND_COOLDOWN_SECONDS) {
        const waitTime = RESEND_COOLDOWN_SECONDS - secondsSinceLastSent;
        return NextResponse.json(
          {
            success: false,
            message: `Please wait ${waitTime} seconds`,
            waitTime,
          },
          { status: 429 }
        );
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    user.passwordResetCode = hashedOTP;
    user.passwordResetExpiry = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );
    user.lastPasswordResetSentAt = new Date();
    user.passwordResetAttempts = 0;
    user.passwordResetVerified = false;

    await user.save();

    console.log(`📧 Password reset OTP for ${email}: ${otp}`);

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Reset your TradeSage AI password',
      html: generatePasswordResetEmailHTML({
        name: user.name,
        otp,
        expiresInMinutes: OTP_EXPIRY_MINUTES,
      }),
    });

    if (emailError) {
      console.error('❌ Email send failed:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Reset code भेज दिया',
      email: email.toLowerCase(),
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send reset code' },
      { status: 500 }
    );
  }
}