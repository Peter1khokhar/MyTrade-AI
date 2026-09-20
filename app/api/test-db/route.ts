import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    console.log('🧪 Testing MongoDB connection...');
    
    await connectDB();
    
    return NextResponse.json({
      success: true,
      message: '✅ MongoDB connected successfully!',
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: '❌ MongoDB connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}