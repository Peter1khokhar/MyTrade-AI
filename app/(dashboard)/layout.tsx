import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';
import { NotificationProvider } from '@/lib/context/notification-context';
import { NotificationToast } from '@/components/dashboard/notification-toast';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen">
        <Sidebar />
        <div className="lg:ml-64">
          <Topbar
            userName={session.user?.name}
            userEmail={session.user?.email}
          />
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>
        <NotificationToast />
      </div>
    </NotificationProvider>
  );
}