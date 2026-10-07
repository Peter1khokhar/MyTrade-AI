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
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Star className="w-7 h-7 text-amber-500" />
          Watchlist
        </h1>
        <p className="text-slate-600 mt-1">
          Track your favorite pairs ({watchlist.length}/20)
        </p>
      </div>

      {/* Add Pair */}
      <Card className="border-slate-200">
        <CardContent className="p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">
              ➕ Add pair
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. EURUSD"
                value={newPair}
                onChange={(e) => setNewPair(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd(newPair)}
                className="h-11"
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
            <p className="text-xs text-slate-500 mb-2 font-medium">
              Quick Add (Popular Pairs):
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_PAIRS.filter((p) => !watchlist.includes(p)).map((pair) => (
                <button
                  key={pair}
                  onClick={() => handleAdd(pair)}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  + {pair}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              <span>✅ {success}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && watchlist.length === 0 && (
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Watchlist is empty
            </h3>
            <p className="text-slate-600 text-sm">
              Add pair from given pairs or select popular pairs
            </p>
          </CardContent>
        </Card>
      )}

      {/* Watchlist Items */}
      {!isLoading && watchlist.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((pair) => {
            const tick = ticks.find((t) => t.symbol === pair);
            const isUp = (tick?.changePercent || 0) >= 0;

            return (
              <Card
                key={pair}
                className="border-slate-200 hover:shadow-md transition-shadow group"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-700">
                          {pair.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{pair}</p>
                        <p className="text-xs text-slate-500">Forex Pair</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(pair)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {tick ? (
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold font-mono text-slate-900">
                          {tick.price.toFixed(tick.price > 100 ? 2 : 5)}
                        </span>
                        {isUp ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div
                        className={cn(
                          'text-sm font-semibold',
                          isUp ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {isUp ? '+' : ''}
                        {tick.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400">
                      Loading price...
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}