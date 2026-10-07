import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/connect';
import Trade from '@/lib/db/models/Trade';

// ═══════════════════════════════════════════════════════════
// GET - Fetch single trade
// ═══════════════════════════════════════════════════════════
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login ज़रूरी है' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();

    const trade = await Trade.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!trade) {
      return NextResponse.json(
        { success: false, message: 'Trade नहीं मिली' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, trade });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error fetching trade' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE - Delete trade
// ═══════════════════════════════════════════════════════════
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login ज़रूरी है' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();

    const trade = await Trade.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!trade) {
      return NextResponse.json(
        { success: false, message: 'Trade नहीं मिली' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Trade deleted',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Delete error' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// PATCH - Manually close trade
// ═══════════════════════════════════════════════════════════
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login ज़रूरी है' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { exitPrice, exitReason = 'MANUAL' } = body;

    await connectDB();

    const trade = await Trade.findOne({
      _id: id,
      userId: session.user.id,
      status: 'ACTIVE',
    });

    if (!trade) {
      return NextResponse.json(
        { success: false, message: 'Active trade नहीं मिली' },
        { status: 404 }
      );
    }

    // Calculate pips result
    const pipMultiplier = trade.pair.includes('JPY') ? 0.01 : 0.0001;
    const priceDiff = trade.direction === 'BUY'
      ? exitPrice - trade.entryPrice
      : trade.entryPrice - exitPrice;
    
    trade.exitPrice = exitPrice;
    trade.exitTime = new Date();
    trade.exitReason = exitReason;
    trade.pipsResult = parseFloat((priceDiff / pipMultiplier).toFixed(1));
    trade.status = 'CLOSED';

    await trade.save();

    return NextResponse.json({
      success: true,
      message: '✅ Trade close हो गई',
      trade,
    });
  } catch (error) {
    console.error('❌ Close trade error:', error);
    return NextResponse.json(
      { success: false, message: 'Close error' },
      { status: 500 }
    );
  }
}