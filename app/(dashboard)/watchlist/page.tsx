'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Star,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations';

interface MarketTick {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const POPULAR_PAIRS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD',
  'XAUUSD', 'XAGUSD', 'USOIL', 'UKOIL', 'XCUUSD',
  'EURGBP', 'EURJPY', 'GBPJPY',
];

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [ticks, setTicks] = useState<MarketTick[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPair, setNewPair] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchWatchlist = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/watchlist');
      const data = await res.json();
      if (data.success) {
        setWatchlist(data.watchlist);
        setTicks(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
    const interval = setInterval(fetchWatchlist, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAdd = async (pair: string) => {
    setError('');
    setSuccess('');
    const upperPair = pair.toUpperCase().trim();

    if (!upperPair) return;

    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pair: upperPair }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      setSuccess(data.message);
      setNewPair('');
      fetchWatchlist();

      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Add नहीं हुआ');
    }
  };

  const handleRemove = async (pair: string) => {
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/watchlist?pair=${pair}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      setSuccess(data.message);
      fetchWatchlist();

      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Remove नहीं हुआ');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Star className="w-7 h-7 text-amber-500" />
          Watchlist
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Track your favorite pairs ({watchlist.length}/20)
        </p>
      </motion.div>

      {/* Add Pair */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                ➕ Add Pair
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. EURUSD"
                  value={newPair}
                  onChange={(e) => setNewPair(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdd(newPair)}
                  className="h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                  maxLength={10}
                />
                <Button
                  onClick={() => handleAdd(newPair)}
                  className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* Popular Pairs */}
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                Quick Add (Popular Pairs):
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_PAIRS.filter((p) => !watchlist.includes(p)).map((pair) => (
                  <motion.button
                    key={pair}
                    onClick={() => handleAdd(pair)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    + {pair}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg text-green-700 dark:text-green-400 text-sm"
                >
                  <span>✅ {success}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && watchlist.length === 0 && (
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-12 text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <Star className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </motion.div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Watchlist खाली है
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                ऊपर से pair add करो या popular pairs से select करो
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Watchlist Items */}
      {!isLoading && watchlist.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {watchlist.map((pair) => {
            const tick = ticks.find((t) => t.symbol === pair);
            const isUp = (tick?.changePercent || 0) >= 0;

            return (
              <motion.div
                key={pair}
                variants={staggerItem}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-all group h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 rounded-xl flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                            {pair.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {pair}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Forex Pair
                          </p>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(pair)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </div>

                    {tick ? (
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                            {tick.price.toFixed(tick.price > 100 ? 2 : 5)}
                          </span>
                          {isUp ? (
                            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div
                          className={cn(
                            'text-sm font-semibold',
                            isUp
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          )}
                        >
                          {isUp ? '+' : ''}
                          {tick.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400 dark:text-slate-500">
                        Loading price...
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}