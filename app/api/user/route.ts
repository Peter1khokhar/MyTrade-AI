import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';

// GET - Fetch current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login ज़रूरी है' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).select('-password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User नहीं मिला' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        plan: user.plan,
        watchlist: user.watchlist,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Fetch user error:', error);
    return NextResponse.json(
      { success: false, message: 'User fetch नहीं हुआ' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
const updateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login ज़रूरी है' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, currentPassword, newPassword } = validation.data;
    await connectDB();

    const user = await User.findById(session.user.id).select('+password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User नहीं मिला' },
        { status: 404 }
      );
    }

    // Update name
    if (name) {
      user.name = name;
    }

    // Update password (if provided)
    if (currentPassword && newPassword) {
        if (!user.password) {
    return NextResponse.json(
      { success: false, message: 'Password change not available for Google accounts' },
      { status: 400 }
    );
  }
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Current password गलत है' },
          { status: 400 }
        );
      }
      user.password = await bcrypt.hash(newPassword, 12);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: '✅ Profile update हो गई',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        plan: user.plan,
      },
    });
  } catch (error) {
    console.error('❌ Update user error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Update नहीं हुआ',
      },
      { status: 500 }
    );
  }
}