'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Crown,
  Star,
  Zap,
  TrendingUp,
  IndianRupee,
  Activity,
  Target,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        setPayments(data.payments);
        setSubscriptions(data.subscriptions);
        setStats(data.stats);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchUser();
  }, [userId]);

  const handleAction = async (action: string, extra?: any) => {
    if (
      action === 'delete' &&
      !confirm('Are you sure you want to delete this user?')
    ) {
      return;
    }

    setIsActionLoading(true);
    try {
      if (action === 'delete') {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });
        const data = await res.json();

        if (data.success) {
          toast.success(data.message);
          setTimeout(() => router.push('/admin/users'), 1500);
        } else {
          toast.error(data.message);
        }
      } else {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, ...extra }),
        });
        const data = await res.json();

        if (data.success) {
          toast.success(data.message);
          fetchUser();
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-amber-500" strokeWidth={1.5} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-sm font-light text-slate-500 dark:text-[#A1A1AA]">
          User not found
        </p>
      </div>
    );
  }

  const initials = user.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isPro = ['weekly', 'monthly'].includes(user.plan);
  const isSpecial = user.isSpecial;
  const isExpired = user.planExpiry && new Date(user.planExpiry) < new Date();

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Back Button */}
      <button
        onClick={() => router.push('/admin/users')}
        className="flex items-center gap-1.5 text-xs font-light text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
        Back to Users
      </button>

      {/* User Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-card p-6"
      >
        <div className="flex items-start gap-5 flex-wrap">
          {/* Avatar */}
          <Avatar
            className={cn(
              'w-16 h-16',
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
              <AvatarFallback className="bg-transparent text-white text-xl font-light">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h1 className="text-xl lg:text-2xl font-light text-slate-900 dark:text-white tracking-tight">
                {user.name}
              </h1>
              {isSpecial && (
                <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0 font-light text-[11px]">
                  <Star className="w-3 h-3 mr-1" strokeWidth={1.5} />
                  Special
                </Badge>
              )}
              {isPro && !isExpired && !isSpecial && (
                <Badge className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-0 font-light text-[11px]">
                  <Crown className="w-3 h-3 mr-1" strokeWidth={1.5} />
                  {user.plan === 'weekly' ? 'Weekly Pro' : 'Monthly Pro'}
                </Badge>
              )}
              {isExpired && (
                <Badge className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-0 font-light text-[11px]">
                  Expired
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs font-light text-slate-500 dark:text-[#A1A1AA] flex-wrap">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3 h-3" strokeWidth={1.5} />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" strokeWidth={1.5} />
                <span>
                  Joined {new Date(user.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>

            {isSpecial && user.specialNote && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 rounded-md">
                <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                <span className="text-[11px] font-light text-amber-700 dark:text-amber-400">
                  {user.specialNote}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-2">
          {!isSpecial ? (
            <Button
              onClick={() =>
                handleAction('make-special', { specialNote: 'Friend' })
              }
              disabled={isActionLoading}
              className="h-9 px-4 text-xs font-light bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
            >
              <Star className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
              Make Special
            </Button>
          ) : (
            <Button
              onClick={() => handleAction('remove-special')}
              disabled={isActionLoading}
              variant="outline"
              className="h-9 px-4 text-xs font-light bg-slate-50 dark:bg-[#1F1F26] border-0 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] rounded-lg"
            >
              Remove Special
            </Button>
          )}

          <Button
            onClick={() =>
              handleAction('manual-upgrade', {
                planId: 'monthly',
                durationDays: 30,
              })
            }
            disabled={isActionLoading}
            className="h-9 px-4 text-xs font-light bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Crown className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
            Upgrade 30d
          </Button>

          <Button
            onClick={() => handleAction('delete')}
            disabled={isActionLoading}
            variant="outline"
            className="h-9 px-4 text-xs font-light bg-red-50 dark:bg-red-500/10 border-0 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
            Delete
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Signals',
            value: stats?.totalSignals || 0,
            icon: Zap,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-500/10',
          },
          {
            label: 'Avg Confidence',
            value: `${stats?.avgConfidence || 0}%`,
            icon: Target,
            color: 'text-green-500',
            bg: 'bg-green-50 dark:bg-green-500/10',
          },
          {
            label: 'Favourite Pair',
            value: stats?.favouritePair || 'N/A',
            icon: TrendingUp,
            color: 'text-purple-500',
            bg: 'bg-purple-50 dark:bg-purple-500/10',
          },
          {
            label: 'Total Spent',
            value: `₹${user.totalSpent || 0}`,
            icon: IndianRupee,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
          },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="admin-card p-4"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className={cn('w-7 h-7 rounded-md flex items-center justify-center', item.bg)}>
                  <Icon className={cn('w-3.5 h-3.5', item.color)} strokeWidth={1.5} />
                </div>
                <p className="text-[10px] font-light text-slate-500 dark:text-[#71717A] uppercase tracking-wider">
                  {item.label}
                </p>
              </div>
              <p className="text-lg font-light text-slate-900 dark:text-white tracking-tight">
                {item.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="admin-card p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <IndianRupee className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
          <h2 className="text-sm font-normal text-slate-900 dark:text-white tracking-tight">
            Payment History
          </h2>
        </div>

        {payments.length > 0 ? (
          <div className="space-y-1.5">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#1F1F26]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-md flex items-center justify-center',
                      payment.status === 'success' && 'bg-green-50 dark:bg-green-500/10',
                      payment.status === 'pending' && 'bg-amber-50 dark:bg-amber-500/10',
                      payment.status === 'failed' && 'bg-red-50 dark:bg-red-500/10'
                    )}
                  >
                    {payment.status === 'success' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" strokeWidth={1.5} />
                    )}
                    {payment.status === 'pending' && (
                      <Loader2 className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />
                    )}
                    {payment.status === 'failed' && (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" strokeWidth={1.5} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-normal text-slate-900 dark:text-white">
                      ₹{payment.amount} • {payment.planType}
                    </p>
                    <p className="text-[10px] font-light text-slate-500 dark:text-[#71717A]">
                      {new Date(payment.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <Badge
                  className={cn(
                    'border-0 text-[10px] font-light',
                    payment.status === 'success' && 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400',
                    payment.status === 'pending' && 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
                    payment.status === 'failed' && 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                  )}
                >
                  {payment.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-xs font-light text-slate-400 dark:text-[#71717A] py-8">
            No payments yet
          </p>
        )}
      </motion.div>

      {/* Subscription History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="admin-card p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
          <h2 className="text-sm font-normal text-slate-900 dark:text-white tracking-tight">
            Subscription History
          </h2>
        </div>

        {subscriptions.length > 0 ? (
          <div className="space-y-1.5">
            {subscriptions.map((sub) => (
              <div
                key={sub._id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#1F1F26]"
              >
                <div>
                  <p className="text-sm font-normal text-slate-900 dark:text-white capitalize">
                    {sub.plan} Plan
                  </p>
                  <p className="text-[10px] font-light text-slate-500 dark:text-[#71717A]">
                    {new Date(sub.startDate).toLocaleDateString('en-IN')} →{' '}
                    {new Date(sub.endDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    className={cn(
                      'border-0 text-[10px] font-light',
                      sub.status === 'active' && 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400',
                      sub.status === 'expired' && 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400',
                      sub.status === 'pending' && 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    )}
                  >
                    {sub.status}
                  </Badge>
                  <p className="text-[10px] font-light text-slate-500 dark:text-[#71717A] mt-1">
                    ₹{sub.amount} • {sub.source}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-xs font-light text-slate-400 dark:text-[#71717A] py-8">
            No subscriptions yet
          </p>
        )}
      </motion.div>
    </div>
  );
}