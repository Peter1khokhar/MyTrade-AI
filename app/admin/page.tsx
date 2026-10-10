'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Crown,
  TrendingUp,
  Zap,
  IndianRupee,
  Activity,
  Star,
  Award,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stats {
  users: {
    total: number;
    pro: number;
    special: number;
    freeTrial: number;
    newToday: number;
    newThisWeek: number;
  };
  revenue: {
    thisMonth: number;
    today: number;
    total: number;
    payments: {
      success: number;
      pending: number;
      failed: number;
    };
  };
  signals: {
    total: number;
    today: number;
    thisMonth: number;
  };
  charts: {
    revenueByDay: Array<{ date: string; revenue: number; count: number }>;
    usersByDay: Array<{ date: string; count: number }>;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-amber-500" strokeWidth={1.5} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-sm font-light text-slate-500 dark:text-[#71717A]">
          Failed to load stats
        </p>
      </div>
    );
  }

  const mainStats = [
    {
      title: 'Total Users',
      value: stats.users.total,
      change: `+${stats.users.newThisWeek} this week`,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
    },
    {
      title: 'Pro Users',
      value: stats.users.pro,
      change: `${stats.users.freeTrial} free trials`,
      icon: Crown,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
    },
    {
      title: 'Revenue (Month)',
      value: `₹${stats.revenue.thisMonth.toLocaleString('en-IN')}`,
      change: `₹${stats.revenue.today.toLocaleString('en-IN')} today`,
      icon: IndianRupee,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-500/10',
    },
    {
      title: 'Total Signals',
      value: stats.signals.total,
      change: `${stats.signals.today} today`,
      icon: Zap,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl lg:text-2xl font-light text-slate-900 dark:text-white tracking-tight">
          Welcome back, Admin
        </h1>
        <p className="text-sm font-light text-slate-500 dark:text-[#71717A] mt-1">
          Here's what's happening with MyTrade AI today
        </p>
      </motion.div>

      {/* Main Stats - Borderless */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ y: -2 }}
              className="admin-card p-5 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', stat.bg)}>
                  <Icon className={cn('w-4 h-4', stat.color)} strokeWidth={1.5} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-green-500" strokeWidth={1.5} />
              </div>
              <p className="text-[11px] font-light text-slate-500 dark:text-[#71717A] uppercase tracking-wider mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-light text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </p>
              <p className="text-[11px] font-light text-slate-400 dark:text-[#71717A] mt-1">
                {stat.change}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Secondary Stats - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Special Users', value: stats.users.special, icon: Star },
          { label: 'Success Payments', value: stats.revenue.payments.success, icon: Award },
          { label: 'Active Signals', value: stats.signals.thisMonth, icon: Activity },
          { label: 'Total Revenue', value: `₹${stats.revenue.total.toLocaleString('en-IN')}`, icon: TrendingUp },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
              className="admin-card-subtle p-3.5"
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-[#71717A]" strokeWidth={1.5} />
                <div className="min-w-0">
                  <p className="text-[10px] font-light text-slate-500 dark:text-[#71717A] uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-base font-light text-slate-900 dark:text-white tracking-tight">
                    {item.value}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="admin-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-normal text-slate-900 dark:text-white tracking-tight">
              Revenue (Last 7 Days)
            </h2>
            <p className="text-[11px] font-light text-slate-500 dark:text-[#71717A] mt-1">
              Daily revenue from successful payments
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-light text-amber-600 dark:text-amber-500 tracking-tight">
              ₹{stats.charts.revenueByDay.reduce((sum, d) => sum + d.revenue, 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] font-light text-slate-400 dark:text-[#71717A]">
              7-day total
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 h-32">
          {stats.charts.revenueByDay.length > 0 ? (
            stats.charts.revenueByDay.map((day, i) => {
              const maxRevenue = Math.max(...stats.charts.revenueByDay.map((d) => d.revenue), 1);
              const height = (day.revenue / maxRevenue) * 100;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-[10px] font-light text-slate-600 dark:text-[#A1A1AA] font-mono">
                    ₹{day.revenue}
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 5)}%` }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
                    className="w-full rounded-md bg-gradient-to-t from-amber-400 to-amber-300 dark:from-amber-500 dark:to-amber-400"
                    style={{ minHeight: '16px' }}
                  />
                  <div className="text-[9px] font-light text-slate-400 dark:text-[#71717A]">
                    {day.date.split('-').slice(2).join('/')}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-[#71717A] text-sm font-light">
              No revenue data yet
            </div>
          )}
        </div>
      </motion.div>

      {/* Users Growth Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="admin-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-normal text-slate-900 dark:text-white tracking-tight">
              New Users (Last 7 Days)
            </h2>
            <p className="text-[11px] font-light text-slate-500 dark:text-[#71717A] mt-1">
              Daily user signups
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-light text-blue-600 dark:text-blue-400 tracking-tight">
              {stats.charts.usersByDay.reduce((sum, d) => sum + d.count, 0)}
            </p>
            <p className="text-[10px] font-light text-slate-400 dark:text-[#71717A]">
              7-day total
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 h-32">
          {stats.charts.usersByDay.length > 0 ? (
            stats.charts.usersByDay.map((day, i) => {
              const maxCount = Math.max(...stats.charts.usersByDay.map((d) => d.count), 1);
              const height = (day.count / maxCount) * 100;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-[10px] font-light text-slate-600 dark:text-[#A1A1AA] font-mono">
                    {day.count}
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 5)}%` }}
                    transition={{ delay: 0.6 + i * 0.05, duration: 0.4 }}
                    className="w-full rounded-md bg-gradient-to-t from-blue-500 to-blue-300 dark:from-blue-500 dark:to-blue-400"
                    style={{ minHeight: '16px' }}
                  />
                  <div className="text-[9px] font-light text-slate-400 dark:text-[#71717A]">
                    {day.date.split('-').slice(2).join('/')}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-[#71717A] text-sm font-light">
              No users in the last 7 days
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}