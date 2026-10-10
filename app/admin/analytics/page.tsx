'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Loader2,
  Activity,
  Zap,
  Users,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAnalytics(data.analytics);
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

  if (!analytics) {
    return (
      <div className="text-center py-20">
        <p className="text-sm font-light text-slate-500 dark:text-[#A1A1AA]">
          Failed to load analytics
        </p>
      </div>
    );
  }

  const maxPairCount = Math.max(...analytics.topPairs.map((p: any) => p.totalSignals), 1);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl lg:text-2xl font-light text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
          <BarChart3 className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
          Analytics
        </h1>
        <p className="text-sm font-light text-slate-500 dark:text-[#71717A] mt-1">
          Insights about user behaviour and trading patterns
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Active Users (7d)',
            value: analytics.activeUsersCount,
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-500/10',
          },
          {
            label: 'Top Traded Pairs',
            value: analytics.topPairs.length,
            icon: TrendingUp,
            color: 'text-green-500',
            bg: 'bg-green-50 dark:bg-green-500/10',
          },
          {
            label: 'Signal Types',
            value: analytics.signalDistribution.length,
            icon: Zap,
            color: 'text-purple-500',
            bg: 'bg-purple-50 dark:bg-purple-500/10',
          },
          {
            label: 'Timeframes',
            value: analytics.timeframeDistribution.length,
            icon: Activity,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="admin-card p-4"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className={cn('w-7 h-7 rounded-md flex items-center justify-center', stat.bg)}>
                  <Icon className={cn('w-3.5 h-3.5', stat.color)} strokeWidth={1.5} />
                </div>
              </div>
              <p className="text-[10px] font-light text-slate-500 dark:text-[#71717A] uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-2xl font-light text-slate-900 dark:text-white tracking-tight mt-1">
                {stat.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Top Traded Pairs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="admin-card p-6"
      >
        <div className="mb-5">
          <h2 className="text-sm font-normal text-slate-900 dark:text-white tracking-tight">
            Top Traded Pairs
          </h2>
          <p className="text-[11px] font-light text-slate-500 dark:text-[#71717A] mt-0.5">
            This month
          </p>
        </div>

        {analytics.topPairs.length > 0 ? (
          <div className="space-y-3">
            {analytics.topPairs.map((pair: any, i: number) => {
              const width = (pair.totalSignals / maxPairCount) * 100;
              return (
                <motion.div
                  key={pair.pair}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-[10px] font-medium text-amber-700 dark:text-amber-500">
                        {i + 1}
                      </div>
                      <span className="font-normal text-slate-900 dark:text-white">
                        {pair.pair}
                      </span>
                      <span className="text-[10px] font-light text-slate-500 dark:text-[#71717A]">
                        {pair.uniqueUsers} users
                      </span>
                    </div>
                    <span className="font-mono text-xs font-light text-slate-700 dark:text-[#A1A1AA]">
                      {pair.totalSignals} signals
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-[#1F1F26] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ delay: 0.5 + i * 0.05, duration: 0.6 }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 dark:from-amber-500 dark:to-amber-400"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-xs font-light text-slate-400 dark:text-[#71717A] py-8">
            No trading data yet
          </p>
        )}
      </motion.div>

      {/* Top Performing Pairs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="admin-card p-6"
      >
        <div className="mb-5">
          <h2 className="text-sm font-normal text-slate-900 dark:text-white tracking-tight">
            Top Performing Pairs
          </h2>
          <p className="text-[11px] font-light text-slate-500 dark:text-[#71717A] mt-0.5">
            By win rate
          </p>
        </div>

        {analytics.topPerformingPairs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {analytics.topPerformingPairs.map((pair: any) => (
              <div
                key={pair.pair}
                className="p-4 rounded-lg bg-slate-50 dark:bg-[#1F1F26]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-normal text-slate-900 dark:text-white">
                    {pair.pair}
                  </span>
                  <Award className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />
                </div>
                <div className="space-y-1.5 text-[11px] font-light">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-[#71717A]">Win Rate</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {pair.winRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-[#71717A]">Trades</span>
                    <span className="text-slate-900 dark:text-white">
                      {pair.totalTrades}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-[#71717A]">Avg Pips</span>
                    <span
                      className={cn(
                        'font-mono',
                        pair.avgPips > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {pair.avgPips > 0 ? '+' : ''}
                      {pair.avgPips}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-xs font-light text-slate-400 dark:text-[#71717A] py-8">
            Not enough closed trades to calculate
          </p>
        )}
      </motion.div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Signal Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="admin-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
            <h2 className="text-sm font-normal text-slate-900 dark:text-white tracking-tight">
              Signal Distribution
            </h2>
          </div>

          <div className="space-y-3">
            {analytics.signalDistribution.map((item: any) => {
              const total = analytics.signalDistribution.reduce(
                (sum: number, d: any) => sum + d.count,
                0
              );
              const percent = total > 0 ? (item.count / total) * 100 : 0;

              return (
                <div key={item._id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={cn(
                        'font-normal',
                        item._id === 'BUY' && 'text-green-600 dark:text-green-400',
                        item._id === 'SELL' && 'text-red-600 dark:text-red-400',
                        item._id === 'HOLD' && 'text-amber-600 dark:text-amber-400'
                      )}
                    >
                      {item._id}
                    </span>
                    <span className="font-light text-slate-500 dark:text-[#A1A1AA]">
                      {item.count} ({percent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-[#1F1F26] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className={cn(
                        'h-full rounded-full',
                        item._id === 'BUY' &&
                          'bg-gradient-to-r from-green-400 to-green-500',
                        item._id === 'SELL' &&
                          'bg-gradient-to-r from-red-400 to-red-500',
                        item._id === 'HOLD' &&
                          'bg-gradient-to-r from-amber-400 to-amber-500'
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Timeframes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="admin-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-purple-500" strokeWidth={1.5} />
            <h2 className="text-sm font-normal text-slate-900 dark:text-white tracking-tight">
              Timeframe Distribution
            </h2>
          </div>

          <div className="space-y-3">
            {analytics.timeframeDistribution.map((item: any) => {
              const total = analytics.timeframeDistribution.reduce(
                (sum: number, d: any) => sum + d.count,
                0
              );
              const percent = total > 0 ? (item.count / total) * 100 : 0;

              return (
                <div key={item._id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-normal text-slate-900 dark:text-white">
                      {item._id}
                    </span>
                    <span className="font-light text-slate-500 dark:text-[#A1A1AA]">
                      {item.count} ({percent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-[#1F1F26] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                      className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}