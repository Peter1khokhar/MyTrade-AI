'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Crown,
  BarChart3,
  TrendingUp,
  Settings,
  ArrowLeft,
} from 'lucide-react';

const menuItems = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Users', href: '/admin/users', icon: Users },
  { title: 'Special Users', href: '/admin/special-users', icon: Crown },
  { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { title: 'Revenue', href: '/admin/revenue', icon: TrendingUp },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
];

interface MobileAdminSidebarProps {
  onClose?: () => void;
}

export function MobileAdminSidebar({ onClose }: MobileAdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0F0F12]">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-slate-200 dark:border-[#27272A]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F59E0B] to-[#EF4444] flex items-center justify-center">
          <span className="text-white text-xs font-bold">A</span>
        </div>
        <div>
          <h1 className="font-semibold text-slate-900 dark:text-white leading-tight text-sm">
            Admin Panel
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-[#71717A]">
            MyTrade AI
          </p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-all',
                isActive
                  ? 'bg-slate-100 dark:bg-[#1F1F26] text-slate-900 dark:text-[#F59E0B]'
                  : 'text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-[#1A1A1F] hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Back to App */}
      <div className="p-3 border-t border-slate-200 dark:border-[#27272A]">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2 px-2.5 py-2 text-xs text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white rounded-md transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to App</span>
        </Link>
      </div>
    </div>
  );
}