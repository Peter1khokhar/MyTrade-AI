'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    
    // हर 30 seconds में refresh
    const interval = setInterval(fetchTicks, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <span className="text-sm text-slate-600">Market data load हो रहा है...</span>
      </div>
    );
  }

  if (ticks.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
        <p className="text-sm text-slate-600">Market data उपलब्ध नहीं है</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex overflow-x-auto scrollbar-hide">
        {ticks.map((tick) => {
          const isUp = tick.changePercent >= 0;
          
          return (
            <div
              key={tick.symbol}
              className="flex-shrink-0 px-4 py-3 border-r border-slate-100 last:border-r-0 min-w-[140px] hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-slate-900">
                  {tick.symbol}
                </span>
                {isUp ? (
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                )}
              </div>
              <div className="font-mono text-sm font-semibold text-slate-900">
                {tick.price.toFixed(tick.price > 100 ? 2 : 5)}
              </div>
              <div
                className={cn(
                  'text-xs font-medium mt-0.5',
                  isUp ? 'text-green-600' : 'text-red-600'
                )}
              >
                {isUp ? '+' : ''}{tick.changePercent.toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}