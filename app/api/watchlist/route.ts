import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { getMultipleTicks } from '@/lib/market/biquote';

// GET - Fetch user's watchlist with live prices
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

    const user = await User.findById(session.user.id).select('watchlist');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User नहीं मिला' },
        { status: 404 }
      );
    }

    // Fetch live prices for watchlist pairs
    let ticks: any[] = [];
    if (user.watchlist && user.watchlist.length > 0) {
      ticks = await getMultipleTicks(user.watchlist);
    }

    return NextResponse.json({
      success: true,
      watchlist: user.watchlist || [],
      data: ticks,
    });

  } catch (error) {
    console.error('❌ Fetch watchlist error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Watchlist fetch नहीं हुई',
      },
      { status: 500 }
    );
  }
}

// POST - Add pair to watchlist
const addSchema = z.object({
  pair: z.string().min(3).max(10),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login ज़रूरी है' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = addSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'सही pair डालो' },
        { status: 400 }
      );
    }

    const pair = validation.data.pair.toUpperCase();
    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User नहीं मिला' },
        { status: 404 }
      );
    }

    // Check if already exists
    if (user.watchlist.includes(pair)) {
      return NextResponse.json(
        { success: false, message: 'ये pair पहले से watchlist में है' },
        { status: 409 }
      );
    }

    // Limit to 20 pairs
    if (user.watchlist.length >= 20) {
      return NextResponse.json(
        { success: false, message: 'Watchlist full है (max 20 pairs)' },
        { status: 400 }
      );
    }

    user.watchlist.push(pair);
    await user.save();

    return NextResponse.json({
      success: true,
      message: `${pair} watchlist में add हो गया`,
      watchlist: user.watchlist,
    });

  } catch (error) {
    console.error('❌ Add to watchlist error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Add नहीं हुआ',
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove pair from watchlist
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
    const pair = searchParams.get('pair')?.toUpperCase();

    if (!pair) {
      return NextResponse.json(
        { success: false, message: 'Pair ज़रूरी है' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User नहीं मिला' },
        { status: 404 }
      );
    }

    user.watchlist = user.watchlist.filter((p) => p !== pair);
    await user.save();

    return NextResponse.json({
      success: true,
      message: `${pair} watchlist से remove हो गया`,
      watchlist: user.watchlist,
    });

  } catch (error) {
    console.error('❌ Remove from watchlist error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Remove नहीं हुआ',
      },
      { status: 500 }
    );
  }
}