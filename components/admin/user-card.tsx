'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserCardProps {
  user: any;
}

export function UserCard({ user }: UserCardProps) {
  const initials = user.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isPro = ['weekly', 'monthly'].includes(user.plan);
  const isSpecial = user.isSpecial;
  const isExpired = user.planExpiry && new Date(user.planExpiry) < new Date();

  const getPlanBadge = () => {
    if (isSpecial) {
      return (
        <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0 text-[10px] px-1.5 py-0 h-4 font-light">
          <Star className="w-2.5 h-2.5 mr-0.5" strokeWidth={1.5} />
          Special
        </Badge>
      );
    }
    if (isPro && !isExpired) {
      return (
        <Badge className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-0 text-[10px] px-1.5 py-0 h-4 font-light">
          <Crown className="w-2.5 h-2.5 mr-0.5" strokeWidth={1.5} />
          {user.plan === 'weekly' ? 'Weekly' : 'Monthly'}
        </Badge>
      );
    }
    if (user.plan === 'free_trial') {
      return (
        <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0 text-[10px] px-1.5 py-0 h-4 font-light">
          <Clock className="w-2.5 h-2.5 mr-0.5" strokeWidth={1.5} />
          Trial
        </Badge>
      );
    }
    if (isExpired) {
      return (
        <Badge className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-0 text-[10px] px-1.5 py-0 h-4 font-light">
          Expired
        </Badge>
      );
    }
    return (
      <Badge className="bg-slate-100 dark:bg-[#27272A] text-slate-600 dark:text-[#A1A1AA] border-0 text-[10px] px-1.5 py-0 h-4 font-light">
        Free
      </Badge>
    );
  };

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Link href={`/admin/users/${user._id}`}>
        <div className="admin-card p-4 group cursor-pointer">
          <div className="flex items-center gap-3">
            <Avatar
              className={cn(
                'w-10 h-10',
                isSpecial
                  ? 'bg-gradient-to-br from-amber-500 to-red-500'
                  : isPro
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600'
                  : 'bg-slate-200 dark:bg-[#27272A]'
              )}
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <AvatarFallback className="bg-transparent text-white text-xs font-medium">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-sm font-normal text-slate-900 dark:text-white truncate">
                  {user.name}
                </p>
                {getPlanBadge()}
              </div>
              <p className="text-xs font-light text-slate-500 dark:text-[#71717A] truncate">
                {user.email}
              </p>
              {user.lastPayment && (
                <p className="text-[10px] font-light text-amber-600 dark:text-amber-500 mt-0.5">
                  ₹{user.lastPayment.amount} •{' '}
                  {new Date(user.lastPayment.createdAt).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>

            <ChevronRight
              className="w-4 h-4 text-slate-400 dark:text-[#71717A] group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all"
              strokeWidth={1.5}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}