import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/connect';
import Notification from '@/lib/db/models/Notification';

// ═══════════════════════════════════════════════════════════
// 📬 GET - User Notifications
// ═══════════════════════════════════════════════════════════

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login zaroori hai' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = { userId: session.user.id };
    if (unreadOnly) {
      query.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Notification.countDocuments({
        userId: session.user.id,
        isRead: false,
      }),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });

  } catch (error) {
    console.error('❌ Fetch notifications error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch',
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// ✅ PATCH - Mark as Read
// ═══════════════════════════════════════════════════════════

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login zaroori hai' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await Notification.updateMany(
        { userId: session.user.id, isRead: false },
        { isRead: true }
      );

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      });
    }

    if (!notificationId) {
      return NextResponse.json(
        { success: false, message: 'Notification ID required' },
        { status: 400 }
      );
    }

    await Notification.findOneAndUpdate(
      { _id: notificationId, userId: session.user.id },
      { isRead: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Marked as read',
    });

  } catch (error) {
    console.error('❌ Mark as read error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to mark as read' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// 🗑️ DELETE - Clear All
// ═══════════════════════════════════════════════════════════

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login zaroori hai' },
        { status: 401 }
      );
    }

    await connectDB();

    const result = await Notification.deleteMany({
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} notifications deleted`,
    });

  } catch (error) {
    console.error('❌ Delete notifications error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete' },
      { status: 500 }
    );
  }
}