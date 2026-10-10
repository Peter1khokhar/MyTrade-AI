import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';

// ═══════════════════════════════════════════════════════════
// 🔐 Check if user is admin
// ═══════════════════════════════════════════════════════════

export async function isAdmin(): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.id) return false;

    await connectDB();
    const user = await User.findById(session.user.id).select('role');
    
    return user?.role === 'admin';
  } catch (error) {
    console.error('❌ Admin check error:', error);
    return false;
  }
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Admin access required');
  }
  return true;
}

// ═══════════════════════════════════════════════════════════
// 👤 Get current admin user
// ═══════════════════════════════════════════════════════════

export async function getCurrentAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();
  const user = await User.findById(session.user.id).select('-password');
  
  if (user?.role !== 'admin') return null;
  
  return user;
}