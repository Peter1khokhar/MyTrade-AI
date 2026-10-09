'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { MobileSidebar } from './mobile-sidebar';
import { ThemeToggle } from './theme-toggle';
import { SuccessAnimation } from '@/components/ui/success-animation';

interface TopbarProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function Topbar({ userName, userEmail }: TopbarProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showGoodbye, setShowGoodbye] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    // 🎉 Show goodbye animation
    setShowGoodbye(true);

    setTimeout(async () => {
      await signOut({ redirect: false });
      router.push('/login');
      router.refresh();
    }, 1200);
  };

  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <>
      {/* 🎉 Goodbye Animation */}
      <SuccessAnimation
        show={showGoodbye}
        message="Goodbye! See you soon 👋"
      />

      <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 transition-colors">
        {/* Left - Mobile Menu + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <MobileSidebar />
            </SheetContent>
          </Sheet>

          {/* Logo for mobile */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm">
              💱
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              TradeSage
            </span>
          </div>
        </div>

        {/* Right - Theme Toggle + User Menu */}
        <div className="flex items-center gap-2 lg:gap-3">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors outline-none cursor-pointer">
              <Avatar className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600">
                <AvatarFallback className="bg-transparent text-white font-semibold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                  {userName || 'User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem disabled>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoading}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isLoading ? 'Logging out...' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}