import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin-check';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminTopbar } from '@/components/admin/topbar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0F] transition-colors">
      <AdminSidebar />
      <div className="lg:ml-64">
        <AdminTopbar
          userName={admin.name}
          userEmail={admin.email}
        />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}