import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-check';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';

// ═══════════════════════════════════════════════════════════
// ⭐ GET - Special Users List
// ═══════════════════════════════════════════════════════════

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const specialUsers = await User.find({ isSpecial: true })
      .select('-password -emailVerificationCode -passwordResetCode')
      .sort({ updatedAt: -1 })
      .lean();

    // Stats
    const totalSpecial = specialUsers.length;
    const byNote = specialUsers.reduce((acc: any, u) => {
      const note = u.specialNote || 'No note';
      acc[note] = (acc[note] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      specialUsers,
      stats: {
        total: totalSpecial,
        byNote,
      },
    });

  } catch (error) {
    console.error('❌ Special users fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch',
      },
      { status: 500 }
    );
  }
}