'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Loader2,
  Crown,
  Star,
  Award,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const RANGES = [
  { value: '7', label: '7 Days' },
  { value: '30', label: '30 Days' },
  { value: '90', label: '90 Days' },
  { value: '365', label: '1 Year' },
];

export default function AdminRevenuePage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState('30');

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/admin/revenue?range=${range}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [range]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-amber-500" strokeWidth={1.5} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-sm font-light text-slate-500 dark:text-[#A1A1AA]">
          Failed to load revenue data
        </p>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.revenueByDay.map((d: any) => d.revenue), 1);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-xl lg:text-2xl font-light text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <IndianRupee className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
            Revenue Analytics
          </h1>
          <p className="text-sm font-light text-slate-500 dark:text-[#71717A] mt-1">
            Track earnings and subscription performance
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex gap-1.5">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                'px-2.5 py-1.5 rounded-md text-[11px] font-light transition-all',
                range === r.value
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 dark:bg-[#1F1F26] text-slate-600 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Revenue',
            value: `₹${data.revenue.total.toLocaleString('en-IN')}`,
            change: `${data.revenue.totalPayments} payments`,
            icon: IndianRupee,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
          },
          {
            label: 'This Month',
            value: `₹${data.revenue.thisMonth.toLocaleString('en-IN')}`,
            change: `${data.revenue.growth >= 0 ? '+' : ''}${data.revenue.growth}% vs last`,
            icon: data.revenue.growth >= 0 ? TrendingUp : TrendingDown,
            color: data.revenue.growth >= 0 ? 'text-green-500' : 'text-red-500',
            bg: data.revenue.growth >= 0 ? 'bg-green-50 dark:bg-green-500/10' : 'bg-red-50 dark:bg-red-500/10',
            growthPositive: data.revenue.growth >= 0,
          },
          {
            label: 'Active Pro',
            value: data.subscriptionStats.activeProUsers,
            change: `${data.subscriptionStats.expiredProUsers} expired`,
            icon: Crown,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-500/10',
          },
          {
            label: 'Special Users',
            value: data.subscriptionStats.specialUsers,
            change: 'Free lifetime access',
            icon: Star,
            color: 'text-purple-500',
            bg: 'bg-purple-50 dark:bg-purple-500/10',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="admin-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn('w-8 h-8 rounded-md flex items-center justify-center', stat.bg)}>
                  <Icon className={cn('w-4 h-4', stat.color)} strokeWidth={1.5} />
                </div>
              </div>
              <p className="text-[10px] font-light text-slate-500 dark:text-[#71717A] uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-light text-slate-900 dark:text-white tracking-tight mb-1">
                {stat.value}
              </p>
              <p
                className={cn(
                  'text-[11px] font-light flex items-center gap-1',
                  stat.growthPositive === true
                    ? 'text-green-600 dark:text-green-400'
                    : stat.growthPositive === false
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-slate-500 dark:text-[#71717A]'
                )}
              >
                {stat.change}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="admin-card p-6"
      >
        <div className="mb-5">
          <h2 className="text-sm font-normal text-slate-900 dark:text-white tracking-tight">
            Daily Revenue
          </h2>
          <p className="text-[11px] font-light text-slate-500 dark:text-[#71717A] mt-0.5">
            Last {range} days
          </p>
        </div>

        {data.revenueByDay.length > 0 ? (
          <div className="flex items-end justify-between gap-1 h-44 overflow-x-auto pb-4">
            {data.revenueByDay.map((day: any, i: number) => {
              const height = (day.revenue / maxRevenue) * 100;
              const date = new Date(day.date);
              return (
                <div
                  key={day.date}
                  className="flex-1 min-w-[28px] flex flex-col items-center gap-1.5"
                >
                  <div className="text-[9px] font-light text-slate-500 dark:text-[#A1A1AA] font-mono">
                    ₹{day.revenue}
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 5)}%` }}
                    transition={{ delay: 0.3 + i * 0.02, duration: 0.4 }}
                    className="w-full rounded-md bg-gradient-to-t from-amber-400 to-amber-500 dark:from-amber-500 dark:to-amber-400"
                    style={{ minHeight: '12px' }}
                    title={`${day.date}: ₹${day.revenue}`}
                  />
                  <div className="text-[9px] font-light text-slate-400 dark:text-[#71717A]">
                    {date.getDate()}/{date.getMonth() + 1}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-xs font-light text-slate-400 dark:text-[#71717A] py-10">
            No revenue in the last {range} days
          </p>
        )}
      </motion.div>

      {/* Revenue by Plan + Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by Plan */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="admin-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
            <h2 className="text-sm font-normal text-slate-900 dark:text-white tracking-tight">
              Revenue by Plan
            </h2>
          </div>

          <div className="space-y-3">
            {data.revenueByPlan.map((plan: any) => {
              const total = data.revenueByPlan.reduce(
                (sum: number, p: any) => sum + p.revenue,
                0
              );
              const percent = total > 0 ? (plan.revenue / total) * 100 : 0;

              return (
                <div key={plan._id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-normal text-slate-900 dark:text-white capitalize">
                      {plan._id}
                    </span>
                    <span className="font-light text-slate-500 dark:text-[#A1A1AA]">
                      ₹{plan.revenue.toLocaleString('en-IN')} ({plan.count})
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-[#1F1F26] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className={cn(
                        'h-full rounded-full',
                        plan._id === 'monthly' &&
                          'bg-gradient-to-r from-amber-400 to-amber-500',
                        plan._id === 'weekly' &&
                          'bg-gradient-to-r from-blue-400 to-blue-500'
                      )}
                    />
                  </div>
                </div>
              );
            })}
            {data.revenueByPlan.length === 0 && (
              <p className="text-center text-xs font-light text-slate-400 dark:text-[#71717A] py-6">
                No revenue data yet
              </p>
            )}
          </div>
        </motion.div>

        {/* Top Paying Users */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="admin-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
            <h2 className="text-sm font-normal text-slate-900 dark:text-white tracking-tight">
              Top Paying Users
            </h2>
          </div>

          <div className="space-y-1.5">
            {data.topPayingUsers.map((user: any, i: number) => {
              const initials = user.name
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={user._id}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-[#1F1F26]"
                >
                  <div className="w-5 h-5 rounded-md bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-[10px] font-medium text-amber-700 dark:text-amber-500">
                    {i + 1}
                  </div>
                  <Avatar className="w-8 h-8 bg-gradient-to-br from-amber-500 to-red-500">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-transparent text-white text-[10px] font-light">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-normal text-slate-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-[10px] font-light text-slate-500 dark:text-[#71717A] truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-normal text-amber-600 dark:text-amber-500">
                      ₹{user.totalSpent.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] font-light text-slate-400 dark:text-[#71717A]">
                      {user.payments} payments
                    </p>
                  </div>
                </div>
              );
            })}
            {data.topPayingUsers.length === 0 && (
              <p className="text-center text-xs font-light text-slate-400 dark:text-[#71717A] py-6">
                No paying users yet
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}