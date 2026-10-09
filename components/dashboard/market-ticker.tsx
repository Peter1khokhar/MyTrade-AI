'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MarketTick {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export function MarketTicker() {
  const [ticks, setTicks] = useState<MarketTick[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTicks = async () => {
    try {
      const res = await fetch('/api/market/ticker');
      const data = await res.json();

      if (data.success) {
        setTicks(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch ticks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicks();

    const interval = setInterval(fetchTicks, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-center gap-2"
      >
        <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Loading market data...
        </span>
      </motion.div>
    );
  }

  if (ticks.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Market data unavailable
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
    >
      <div className="flex overflow-x-auto scrollbar-hide">
        {ticks.map((tick, index) => {
          const isUp = tick.changePercent >= 0;

          return (
            <motion.div
              key={tick.symbol}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
              className="flex-shrink-0 px-4 py-3 border-r border-slate-100 dark:border-slate-800 last:border-r-0 min-w-[140px] transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {tick.symbol}
                </span>
                {isUp ? (
                  <TrendingUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                {tick.price.toFixed(tick.price > 100 ? 2 : 5)}
              </div>
              <div
                className={cn(
                  'text-xs font-medium mt-0.5',
                  isUp
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {isUp ? '+' : ''}
                {tick.changePercent.toFixed(2)}%
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}