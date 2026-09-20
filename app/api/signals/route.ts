import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/connect';
import Signal from '@/lib/db/models/Signal';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login ज़रूरी है' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const pair = searchParams.get('pair');
    const signalType = searchParams.get('signal');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    const query: any = { userId: session.user.id };
    if (pair) query.pair = pair.toUpperCase();
    if (signalType) query.signal = signalType.toUpperCase();

    const signals = await Signal.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const total = await Signal.countDocuments({ userId: session.user.id });

    return NextResponse.json({
      success: true,
      signals,
      total,
    });

  } catch (error) {
    console.error('❌ Fetch signals error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Signals fetch नहीं हुए',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login ज़रूरी है' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Signal ID ज़रूरी है' },
        { status: 400 }
      );
    }

    await connectDB();

    const signal = await Signal.findOneAndDelete({
      _id: id,
      userId: session.user.id, // Only own signals
    });

    if (!signal) {
      return NextResponse.json(
        { success: false, message: 'Signal नहीं मिला' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Delete signal error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Delete नहीं हुआ',
      },
      { status: 500 }
    );
  }
}