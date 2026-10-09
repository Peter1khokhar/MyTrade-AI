'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  History as HistoryIcon,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Trash2,
  Filter,
  AlertCircle,
  Trophy,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  staggerContainer,
  staggerItem,
  fadeInUp,
} from '@/lib/animations';

interface Signal {
  _id: string;
  pair: string;
  timeframe: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  riskReward: string;
  strategy: string;
  reason: string;
  createdAt: string;
  largeMove?: {
    possible: boolean;
    pips: number;
  };
}

const PAIRS = [
  'All', 'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD',
  'NZDUSD', 'USDCAD', 'XAUTUSD', 'PAXGUSD', 'XAGUSD', 'USOIL',
];
const SIGNAL_TYPES = ['All', 'BUY', 'SELL', 'HOLD'];

export default function HistoryPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pairFilter, setPairFilter] = useState('All');
  const [signalFilter, setSignalFilter] = useState('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSignals = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (pairFilter !== 'All') params.append('pair', pairFilter);
      if (signalFilter !== 'All') params.append('signal', signalFilter);

      const res = await fetch(`/api/signals?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setSignals(data.signals);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch signals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, [pairFilter, signalFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this signal?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/signals?id=${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        setSignals(signals.filter((s) => s._id !== id));
        setTotal(total - 1);
        toast.success('Signal deleted');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HistoryIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Signal History
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            All your generated signals ({total} total)
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Total Signals */}
        <motion.div variants={staggerItem} whileHover={{ y: -4 }}>
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase">
                    Total Signals
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* BUY Signals */}
        <motion.div variants={staggerItem} whileHover={{ y: -4 }}>
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase">
                    BUY Signals
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {signals.filter((s) => s.signal === 'BUY').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-950/50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SELL Signals */}
        <motion.div variants={staggerItem} whileHover={{ y: -4 }}>
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase">
                    SELL Signals
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                    {signals.filter((s) => s.signal === 'SELL').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-950/50 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* High Confidence */}
        <motion.div variants={staggerItem} whileHover={{ y: -4 }}>
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase">
                    High Confidence
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {signals.filter((s) => s.confidence >= 75).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/50 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Filters
              </span>
            </div>

            <div className="space-y-3">
              {/* Pair Filter */}
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                  Pair
                </p>
                <div className="flex flex-wrap gap-2">
                  {PAIRS.map((p) => (
                    <motion.button
                      key={p}
                      onClick={() => setPairFilter(p)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        'px-3 py-1 rounded-lg text-xs font-medium transition-all border',
                        pairFilter === p
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                      )}
                    >
                      {p}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Signal Filter */}
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                  Signal Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {SIGNAL_TYPES.map((s) => (
                    <motion.button
                      key={s}
                      onClick={() => setSignalFilter(s)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        'px-3 py-1 rounded-lg text-xs font-medium transition-all border',
                        signalFilter === s
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                      )}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
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
      {!isLoading && signals.length === 0 && (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-12 text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No signals yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto">
                Go to "Signals" page to generate your first AI signal
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Signals List */}
      {!isLoading && signals.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {signals.map((signal) => {
            const isBuy = signal.signal === 'BUY';
            const isSell = signal.signal === 'SELL';
            const SignalIcon = isBuy ? TrendingUp : isSell ? TrendingDown : Minus;

            return (
              <motion.div
                key={signal._id}
                variants={staggerItem}
                whileHover={{ y: -2, scale: 1.005 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Signal Icon */}
                      <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                          isBuy && 'bg-green-100 dark:bg-green-950/50',
                          isSell && 'bg-red-100 dark:bg-red-950/50',
                          !isBuy && !isSell && 'bg-amber-100 dark:bg-amber-950/50'
                        )}
                      >
                        <SignalIcon
                          className={cn(
                            'w-6 h-6',
                            isBuy && 'text-green-600 dark:text-green-400',
                            isSell && 'text-red-600 dark:text-red-400',
                            !isBuy && !isSell && 'text-amber-600 dark:text-amber-400'
                          )}
                        />
                      </motion.div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {signal.pair}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                            {signal.timeframe}
                          </span>
                          <span
                            className={cn(
                              'text-xs font-bold px-2 py-0.5 rounded',
                              isBuy &&
                                'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400',
                              isSell &&
                                'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400',
                              !isBuy &&
                                !isSell &&
                                'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                            )}
                          >
                            {signal.signal}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {signal.confidence}% confidence
                          </span>
                          {signal.largeMove?.possible && (
                            <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded">
                              🚀 {signal.largeMove.pips} pips
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-3 mt-2 text-xs">
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">
                              Entry:
                            </span>{' '}
                            <span className="font-mono font-semibold text-slate-900 dark:text-white">
                              {signal.entryPrice}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">
                              SL:
                            </span>{' '}
                            <span className="font-mono font-semibold text-red-600 dark:text-red-400">
                              {signal.stopLoss}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">
                              TP1:
                            </span>{' '}
                            <span className="font-mono font-semibold text-green-600 dark:text-green-400">
                              {signal.takeProfit1}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate">
                          {signal.reason}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>📅 {formatDate(signal.createdAt)}</span>
                          <span>🎯 {signal.strategy}</span>
                          <span>⚖️ {signal.riskReward}</span>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(signal._id)}
                          disabled={deletingId === signal._id}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 flex-shrink-0"
                        >
                          {deletingId === signal._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </motion.div>
                    </div>
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