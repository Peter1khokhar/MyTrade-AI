import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/connect';
import LearningLog from '@/lib/db/models/LearningLog';
import mongoose from 'mongoose';

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
    
    const logs = await LearningLog.find({
      userId: new mongoose.Types.ObjectId(session.user.id),
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    const latestPrompt = logs[0]?.refinedPromptSummary || '';
    
    return NextResponse.json({
      success: true,
      logs,
      latestPrompt,
      totalLogs: logs.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Fetch failed' },
      { status: 500 }
    );
  }
}