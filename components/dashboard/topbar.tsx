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

interface TopbarProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function Topbar({ userName, userEmail }: TopbarProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left - Mobile Menu + Page Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <Sheet>
  <SheetTrigger className="lg:hidden">
    <Menu className="w-5 h-5" />
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
          <span className="font-bold text-slate-900">TradeSage</span>
        </div>
      </div>

      {/* Right - User Menu */}
      <div className="flex items-center gap-3">
          <DropdownMenu>
  <DropdownMenuTrigger className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50 transition-colors outline-none">
    <Avatar className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600">
      <AvatarFallback className="bg-transparent text-white font-semibold text-sm">
        {initials}
      </AvatarFallback>
    </Avatar>
    <div className="hidden md:block text-left">
      <p className="text-sm font-semibold text-slate-900 leading-tight">
        {userName || 'User'}
      </p>
      <p className="text-xs text-slate-500 leading-tight">
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
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoading ? 'Logging out...' : 'Logout'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}