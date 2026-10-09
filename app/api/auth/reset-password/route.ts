import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';

const schema = z.object({
  email: z.string().email(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, newPassword } = validation.data;
    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+passwordResetVerified');

    // ⚠️ Security: Only allow if code was verified
    if (!user || !user.passwordResetVerified) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please verify your reset code first',
        },
        { status: 400 }
      );
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;

    // Clear reset fields
    user.passwordResetCode = undefined;
    user.passwordResetExpiry = undefined;
    user.passwordResetAttempts = 0;
    user.passwordResetVerified = false;
    user.lastPasswordResetSentAt = undefined;

    await user.save();

    console.log(`✅ Password reset for ${email}`);

    return NextResponse.json({
      success: true,
      message: '🎉 Password reset successfully! Login करो',
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    return NextResponse.json(
      { success: false, message: 'Password reset failed' },
      { status: 500 }
    );
  }
}