import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Trade from '@/lib/db/models/Trade';

export async function GET() {
  try {
    await connectDB();
    
    const tradeCount = await Trade.countDocuments();
    
    return NextResponse.json({
      success: true,
      message: '✅ Trade model working!',
      tradeCount,
      modelName: Trade.modelName,
      collectionName: Trade.collection.name,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}