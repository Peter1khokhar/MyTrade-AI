import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { getBotLink } from '@/lib/telegram/send';

// ═══════════════════════════════════════════════════════════
// 🔗 GET - Get Telegram Connect Link
// ═══════════════════════════════════════════════════════════

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login zaroori hai' },
        { status: 401 }
      );
    }

    const connectLink = getBotLink(`user_${session.user.id}`);

    return NextResponse.json({
      success: true,
      connectLink,
      botUsername: process.env.TELEGRAM_BOT_USERNAME,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// ❌ DELETE - Disconnect Telegram
// ═══════════════════════════════════════════════════════════

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login zaroori hai' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    user.telegramChatId = undefined;
    user.telegramUsername = undefined;
    user.telegramConnected = false;
    await user.save();

    console.log(`✅ Telegram disconnected for ${user.email}`);

    return NextResponse.json({
      success: true,
      message: '📱 Telegram disconnected',
    });

  } catch (error) {
    console.error('❌ Disconnect error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}