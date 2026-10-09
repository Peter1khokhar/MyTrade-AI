import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { generateOTP, hashOTP } from '@/lib/auth/otp';
import { resend, EMAIL_FROM } from '@/lib/email/resend';
import { generateOTPEmailHTML } from '@/lib/email/templates/otp-email';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const OTP_EXPIRY_MINUTES = 10;

export async function POST(req: Request) {
  try {
    console.log('📝 Register request received');

    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return NextResponse.json(
          { success: false, message: 'This email is already registered' },
          { status: 409 }
        );
      }
      // Existing unverified user - allow re-register (will overwrite)
      console.log('⚠️ Unverified user exists, updating...');
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 🔢 Generate OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    // 💾 Create or update user
    let user;
    if (existingUser) {
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.emailVerificationCode = hashedOTP;
      existingUser.emailVerificationExpiry = new Date(
        Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
      );
      existingUser.lastVerificationSentAt = new Date();
      existingUser.emailVerificationAttempts = 0;
      await existingUser.save();
      user = existingUser;
    } else {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        plan: 'free',
        watchlist: ['EURUSD', 'GBPUSD', 'XAUTUSD'],
        isEmailVerified: false,
        emailVerificationCode: hashedOTP,
        emailVerificationExpiry: new Date(
          Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
        ),
        lastVerificationSentAt: new Date(),
        emailVerificationAttempts: 0,
      });
    }

    console.log(`✅ User created: ${user.email}, OTP: ${otp}`);

    // 📧 Send verification email
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
      // User is created, but email failed - still return success with warning
      return NextResponse.json({
        success: true,
        message: 'Account created. Email sending failed - use resend.',
        requiresVerification: true,
        email: email.toLowerCase(),
        emailWarning: true,
      });
    }

    console.log(`📧 Verification email sent to ${email}`);

    return NextResponse.json(
      {
        success: true,
        message: '🎉 Account created! Check your email for verification code.',
        requiresVerification: true,
        email: email.toLowerCase(),
        expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ Register error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      },
      { status: 500 }
    );
  }
}