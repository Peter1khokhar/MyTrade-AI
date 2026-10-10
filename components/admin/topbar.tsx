'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { MobileAdminSidebar } from './mobile-sidebar';

interface AdminTopbarProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function AdminTopbar({ userName, userEmail }: AdminTopbarProps) {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'A';

  return (
    <header className="h-14 lg:h-16 bg-white dark:bg-[#0F0F12] border-b border-slate-200 dark:border-[#27272A] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 transition-colors">
      {/* Left - Mobile Menu */}
      <div className="flex items-center gap-3">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors">
            <Menu className="w-4.5 h-4.5 text-slate-700 dark:text-[#A1A1AA]" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-white dark:bg-[#0F0F12] border-r border-slate-200 dark:border-[#27272A]">
            <MobileAdminSidebar onClose={() => setIsMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Admin Badge - Desktop */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-[#F59E0B]/10 border border-amber-200 dark:border-[#F59E0B]/20 rounded-md">
          <span className="text-[10px] font-medium text-amber-700 dark:text-[#F59E0B]">
            Admin Mode
          </span>
        </div>

        {/* Logo Mobile */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#F59E0B] to-[#EF4444] flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-white text-sm">
            Admin
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 lg:gap-3">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors outline-none cursor-pointer">
            <Avatar className="w-8 h-8 bg-gradient-to-br from-[#F59E0B] to-[#EF4444]">
              <AvatarFallback className="bg-transparent text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-slate-900 dark:text-white leading-tight">
                {userName || 'Admin'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-[#71717A] leading-tight">
                Administrator
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-white dark:bg-[#16161D] border-slate-200 dark:border-[#27272A]"
          >
            <DropdownMenuItem
              onClick={() => router.push('/dashboard')}
              className="text-slate-700 dark:text-white text-sm focus:bg-slate-100 dark:focus:bg-[#1F1F26]"
            >
              <User className="w-3.5 h-3.5 mr-2" />
              User View
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-200 dark:bg-[#27272A]" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400 text-sm focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-[#EF4444]/10"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}