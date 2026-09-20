import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';

export async function GET() {
  try {
    console.log('🧪 Testing User Model...');
    
    await connectDB();
    
    // Count existing users
    const userCount = await User.countDocuments();
    
    return NextResponse.json({
      success: true,
      message: '✅ User model working!',
      userCount: userCount,
      modelName: User.modelName,
      collectionName: User.collection.name,
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: '❌ User model failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}