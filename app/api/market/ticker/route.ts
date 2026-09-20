import { NextResponse } from 'next/server';
import { getMultipleTicks, SUPPORTED_PAIRS } from '@/lib/market/biquote';

export async function GET() {
  try {
    console.log('📊 Fetching market ticker...');
    
    const ticks = await getMultipleTicks(SUPPORTED_PAIRS);
    
    console.log(`✅ Fetched ${ticks.length} pairs`);
    
    return NextResponse.json({
      success: true,
      data: ticks,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('❌ Market ticker error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Market data fetch failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}