'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Star,
  History,
  Settings,
  Zap,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Signals',
    href: '/signals',
    icon: Zap,
  },
  {
    title: 'Analysis',
    href: '/analysis',
    icon: BarChart3,
  },
  {
    title: 'Watchlist',
    href: '/watchlist',
    icon: Star,
  },
  {
    title: 'History',
    href: '/history',
    icon: History,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 h-screen bg-white border-r border-slate-200 fixed left-0 top-0">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-200">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg">
          💱
        </div>
        <div>
          <h1 className="font-bold text-slate-900 leading-tight">TradeSage</h1>
          <p className="text-xs text-slate-500">AI Signals</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'text-blue-600')} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <p className="text-xs font-semibold text-blue-900 mb-1">
            🚀 Upgrade to Pro
          </p>
          <p className="text-xs text-blue-700">
            Unlimited signals + Priority support
          </p>
        </div>
      </div>
    </aside>
  );
}