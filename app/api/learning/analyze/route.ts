import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { analyzeLearning } from '@/lib/ai/learning-analyzer';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login ज़रूरी है' },
        { status: 401 }
      );
    }
    
    const result = await analyzeLearning(session.user.id);
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Analysis failed',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}