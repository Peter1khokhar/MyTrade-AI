import { NextResponse } from 'next/server';
import { monitorActiveTrades } from '@/lib/trades/monitor';

// ═══════════════════════════════════════════════════════════
// POST - Trigger trade monitor (called by cron or manual)
// ═══════════════════════════════════════════════════════════
export async function POST(req: Request) {
  try {
    // ═══════════════════════════════════════════════════════════
    // 🔒 Security: Verify request is from Vercel Cron or authorized
    // ═══════════════════════════════════════════════════════════
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Vercel Cron automatically adds this header
    const isVercelCron = req.headers.get('user-agent')?.includes('vercel-cron');
    const isAuthorized = authHeader === `Bearer ${cronSecret}`;
    
    // Allow if: cron secret matches OR Vercel cron
    if (cronSecret && !isAuthorized && !isVercelCron) {
      console.log('⚠️ Unauthorized monitor attempt');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await monitorActiveTrades();

    return NextResponse.json({
      success: true,
      message: 'Monitor complete',
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Monitor API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Monitor failed',
      },
      { status: 500 }
    );
  }
}