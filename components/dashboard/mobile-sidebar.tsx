'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BarChart3,
  Star,
  History,
  Settings,
  Zap,
  Brain,
} from 'lucide-react';

const menuItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Signals', href: '/signals', icon: Zap },
  { title: 'Analysis', href: '/analysis', icon: BarChart3 },
  { title: 'Watchlist', href: '/watchlist', icon: Star },
  { title: 'History', href: '/history', icon: History },
  { title: 'AI Learning', href: '/learning', icon: Brain },
  { title: 'Settings', href: '/settings', icon: Settings },
];

interface MobileSidebarProps {
  onClose?: () => void;
}

export function MobileSidebar({ onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg">
          💱
        </div>
        <div>
          <h1 className="font-bold text-slate-900 dark:text-white leading-tight">
            TradeSage
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">AI Signals</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5',
                  isActive && 'text-blue-600 dark:text-blue-400'
                )}
              />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-100 dark:border-blue-900">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1">
            🚀 Upgrade to Pro
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Unlimited signals + Priority support
          </p>
        </div>
      </div>
    </div>
  );
}