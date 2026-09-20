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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

const PAIRS = ['All', 'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD', 'XAUUSD', 'XAGUSD', 'USOIL'];
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
    if (!confirm('क्या आप ये signal delete करना चाहते हो?')) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/signals?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setSignals(signals.filter(s => s._id !== id));
        setTotal(total - 1);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
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
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <HistoryIcon className="w-7 h-7 text-blue-600" />
            Signal History
          </h1>
          <p className="text-slate-600 mt-1">
            आपके सारे generated signals ({total} total)
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-700">Filters</span>
          </div>
          
          <div className="space-y-3">
            {/* Pair Filter */}
            <div>
              <p className="text-xs text-slate-500 mb-2 font-medium">Pair</p>
              <div className="flex flex-wrap gap-2">
                {PAIRS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPairFilter(p)}
                    className={cn(
                      'px-3 py-1 rounded-lg text-xs font-medium transition-all border',
                      pairFilter === p
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Signal Filter */}
            <div>
              <p className="text-xs text-slate-500 mb-2 font-medium">Signal Type</p>
              <div className="flex flex-wrap gap-2">
                {SIGNAL_TYPES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSignalFilter(s)}
                    className={cn(
                      'px-3 py-1 rounded-lg text-xs font-medium transition-all border',
                      signalFilter === s
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && signals.length === 0 && (
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              अभी कोई signals नहीं हैं
            </h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              "Signals" page पर जाकर अपना पहला AI signal generate करो
            </p>
          </CardContent>
        </Card>
      )}

      {/* Signals List */}
      {!isLoading && signals.length > 0 && (
        <div className="space-y-3">
          {signals.map((signal) => {
            const isBuy = signal.signal === 'BUY';
            const isSell = signal.signal === 'SELL';
            const SignalIcon = isBuy ? TrendingUp : isSell ? TrendingDown : Minus;

            return (
              <Card
                key={signal._id}
                className="border-slate-200 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Signal Icon */}
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                        isBuy && 'bg-green-100',
                        isSell && 'bg-red-100',
                        !isBuy && !isSell && 'bg-amber-100'
                      )}
                    >
                      <SignalIcon
                        className={cn(
                          'w-6 h-6',
                          isBuy && 'text-green-600',
                          isSell && 'text-red-600',
                          !isBuy && !isSell && 'text-amber-600'
                        )}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-slate-900">
                          {signal.pair}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                          {signal.timeframe}
                        </span>
                        <span
                          className={cn(
                            'text-xs font-bold px-2 py-0.5 rounded',
                            isBuy && 'bg-green-100 text-green-700',
                            isSell && 'bg-red-100 text-red-700',
                            !isBuy && !isSell && 'bg-amber-100 text-amber-700'
                          )}
                        >
                          {signal.signal}
                        </span>
                        <span className="text-xs text-slate-500">
                          {signal.confidence}% confidence
                        </span>
                        {signal.largeMove?.possible && (
                          <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                            🚀 {signal.largeMove.pips} pips
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3 mt-2 text-xs">
                        <div>
                          <span className="text-slate-500">Entry:</span>{' '}
                          <span className="font-mono font-semibold text-slate-900">
                            {signal.entryPrice}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">SL:</span>{' '}
                          <span className="font-mono font-semibold text-red-600">
                            {signal.stopLoss}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">TP1:</span>{' '}
                          <span className="font-mono font-semibold text-green-600">
                            {signal.takeProfit1}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 mt-2 truncate">
                        {signal.reason}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>📅 {formatDate(signal.createdAt)}</span>
                        <span>🎯 {signal.strategy}</span>
                        <span>⚖️ {signal.riskReward}</span>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(signal._id)}
                      disabled={deletingId === signal._id}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                    >
                      {deletingId === signal._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}