import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/connect';
import Trade from '@/lib/db/models/Trade';
import Signal from '@/lib/db/models/Signal';

// ═══════════════════════════════════════════════════════════
// GET - Fetch user's trades (with filters)
// ═══════════════════════════════════════════════════════════
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
    const status = searchParams.get('status'); // ACTIVE | CLOSED | all
    const pair = searchParams.get('pair');
    const limit = parseInt(searchParams.get('limit') || '100');

    const query: any = { userId: session.user.id };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    if (pair) {
      query.pair = pair.toUpperCase();
    }

    const trades = await Trade.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const stats = {
      total: await Trade.countDocuments({ userId: session.user.id }),
      active: await Trade.countDocuments({ userId: session.user.id, status: 'ACTIVE' }),
      closed: await Trade.countDocuments({ userId: session.user.id, status: 'CLOSED' }),
      wins: await Trade.countDocuments({ 
        userId: session.user.id, 
        status: 'CLOSED',
        exitReason: { $in: ['TP1_HIT', 'TP2_HIT', 'TP3_HIT'] }
      }),
      losses: await Trade.countDocuments({ 
        userId: session.user.id, 
        status: 'CLOSED',
        exitReason: 'SL_HIT'
      }),
    };

    return NextResponse.json({
      success: true,
      trades,
      stats,
    });
  } catch (error) {
    console.error('❌ Fetch trades error:', error);
    return NextResponse.json(
      { success: false, message: 'Trades fetch नहीं हुए' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// POST - Create a new trade (from signal or manual)
// ═══════════════════════════════════════════════════════════
const createTradeSchema = z.object({
  signalId: z.string().optional(),
  pair: z.string().min(3),
  direction: z.enum(['BUY', 'SELL']),
  timeframe: z.string(),
  entryPrice: z.number().positive(),
  tp1: z.number().positive(),
  tp2: z.number().positive(),
  tp3: z.number().positive(),
  sl: z.number().positive(),
  confidence: z.number().min(0).max(100).optional(),
  strategy: z.string().optional(),
  reason: z.string().optional(),
  maxHours: z.number().min(1).max(72).optional().default(4),
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
    const validation = createTradeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;
    await connectDB();

    // Calculate max exit time
    const maxExitTime = new Date();
    maxExitTime.setHours(maxExitTime.getHours() + (data.maxHours || 4));

    // Create trade
    const trade = await Trade.create({
      userId: session.user.id,
      signalId: data.signalId,
      pair: data.pair.toUpperCase(),
      direction: data.direction,
      timeframe: data.timeframe,
      entryPrice: data.entryPrice,
      entryTime: new Date(),
      tp1: data.tp1,
      tp2: data.tp2,
      tp3: data.tp3,
      sl: data.sl,
      mfe: 0,
      mae: 0,
      maxExitTime,
      status: 'ACTIVE',
      confidence: data.confidence,
      strategy: data.strategy,
      reason: data.reason,
    });

    console.log(`✅ Trade created: ${trade.pair} ${trade.direction} @ ${trade.entryPrice}`);

    return NextResponse.json({
      success: true,
      message: '🎯 Trade active हो गई! अब monitor हो रही है।',
      trade,
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Create trade error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Trade create नहीं हुई',
      },
      { status: 500 }
    );
  }
}