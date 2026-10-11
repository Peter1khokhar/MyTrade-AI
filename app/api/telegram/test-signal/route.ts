import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { sendTelegramMessage, formatSignalMessage } from '@/lib/telegram/send';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.telegramConnected || !user.telegramChatId) {
      return NextResponse.json(
        { success: false, message: 'Telegram not connected' },
        { status: 400 }
      );
    }

    // Test signal data
    const testSignal = {
      pair: 'XAUUSD',
      signal: 'BUY' as const,
      confidence: 78,
      entryPrice: 4196.50,
      stopLoss: 4185.00,
      takeProfit: 4220.00,
      timeframe: '15m',
      strategy: 'ICT Unicorn',
      reason: 'Order Block + FVG + Liquidity Sweep confluence detected',
      confluenceScore: '3/4',
    };

    const message = formatSignalMessage(testSignal);
    const result = await sendTelegramMessage(user.telegramChatId, message);

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? '✅ Test signal sent to Telegram!' 
        : '❌ Failed to send',
      error: result.error,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}