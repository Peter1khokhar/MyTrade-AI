import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/connect';
import Notification from '@/lib/db/models/Notification';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    await connectDB();

    const notification = await Notification.create({
      userId: session.user.id,
      type: 'signal',
      title: 'BUY Signal: XAUUSD',
      message: 'Strong BUY setup detected on XAUUSD with 78% confidence. Entry: 4196.50, SL: 4185.00, TP: 4220.00',
      pair: 'XAUUSD',
      signal: 'BUY',
      confidence: 78,
      entryPrice: 4196.50,
      stopLoss: 4185.00,
      takeProfit: 4220.00,
      timeframe: '15m',
      strategy: 'ICT Unicorn',
      reason: 'Order Block + FVG + Liquidity Sweep confluence detected',
      confluenceScore: '3/4',
    });

    return NextResponse.json({
      success: true,
      message: 'Test notification created',
      notification,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}