import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/connect';
import Trade from '@/lib/db/models/Trade';
import mongoose from 'mongoose';

// ═══════════════════════════════════════════════════════════
// POST - Create 15 test trades
// ═══════════════════════════════════════════════════════════
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login ज़रूरी है' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    console.log('🧪 Creating test trades for user:', session.user.id);
    
    const testTrades = [];
    const pairs = ['EURUSD', 'GBPUSD', 'XAUUSD', 'USDJPY', 'AUDUSD', 'NZDUSD'];
    const strategies = ['ICT Unicorn', 'Order Block', 'FVG', 'Liquidity Sweep', 'Breaker Block'];
    const timeframes = ['15m', '30m', '1h'];
    
    for (let i = 0; i < 15; i++) {
      const pair = pairs[i % pairs.length];
      const direction = i % 2 === 0 ? 'BUY' : 'SELL';
      const timeframe = timeframes[i % timeframes.length];
      const strategy = strategies[i % strategies.length];
      
      const isWin = i % 3 !== 0;
      
      const basePrice = 
        pair.includes('JPY') ? 150 + i * 0.5 :
        pair.includes('XAU') ? 4100 + i * 10 :
        1.1000 + i * 0.005;
      
      const pipMultiplier = pair.includes('JPY') ? 0.01 : 
                            pair.includes('XAU') ? 1 :
                            0.0001;
      
      const directionMultiplier = direction === 'BUY' ? 1 : -1;
      
      const tp1 = basePrice + (directionMultiplier * 15 * pipMultiplier);
      const tp2 = basePrice + (directionMultiplier * 30 * pipMultiplier);
      const tp3 = basePrice + (directionMultiplier * 50 * pipMultiplier);
      const sl = basePrice - (directionMultiplier * 12 * pipMultiplier);
      
      const pipsResult = isWin ? (i % 3 === 1 ? 20 : 15) : -12;
      const exitPrice = isWin
        ? (i % 3 === 1 ? tp2 : tp1)
        : sl;
      
      const exitReason = isWin
        ? (i % 3 === 1 ? 'TP2_HIT' : 'TP1_HIT')
        : 'SL_HIT';
      
      const entryTime = new Date(Date.now() - (15 - i) * 3600000);
      const exitTime = new Date(entryTime.getTime() + 30 * 60000);
      
      const trade = await Trade.create({
        userId: new mongoose.Types.ObjectId(session.user.id),
        pair,
        direction,
        timeframe,
        entryPrice: parseFloat(basePrice.toFixed(5)),
        entryTime,
        tp1: parseFloat(tp1.toFixed(5)),
        tp2: parseFloat(tp2.toFixed(5)),
        tp3: parseFloat(tp3.toFixed(5)),
        sl: parseFloat(sl.toFixed(5)),
        exitPrice: parseFloat(exitPrice.toFixed(5)),
        exitTime,
        exitReason,
        pipsResult,
        mfe: isWin ? pipsResult + 5 : 3,
        mae: isWin ? -3 : pipsResult - 2,
        maxExitTime: new Date(entryTime.getTime() + 4 * 3600000),
        status: 'CLOSED',
        confidence: 60 + (i * 2) % 30,
        strategy,
        reason: `Test trade ${i + 1} - ${isWin ? 'Win' : 'Loss'}`,
      });
      
      testTrades.push(trade);
    }
    
    console.log(`✅ Created ${testTrades.length} test trades`);
    
    return NextResponse.json({
      success: true,
      message: `🎉 ${testTrades.length} test trades created!`,
      tradesCreated: testTrades.length,
      breakdown: {
        wins: testTrades.filter(t => t.exitReason?.includes('TP')).length,
        losses: testTrades.filter(t => t.exitReason === 'SL_HIT').length,
      },
      nextStep: 'अब /api/learning/analyze call करो',
    });
    
  } catch (error) {
    console.error('❌ Test trades creation failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed',
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE - Clean up test trades
// ═══════════════════════════════════════════════════════════
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login ज़रूरी है' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const result = await Trade.deleteMany({
      userId: new mongoose.Types.ObjectId(session.user.id),
      reason: { $regex: /^Test trade/ },
    });
    
    console.log(`🗑️ Deleted ${result.deletedCount} test trades`);
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} test trades`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('❌ Delete error:', error);
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
}