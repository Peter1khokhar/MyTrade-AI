'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Zap,
  Loader2,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SignalResult } from '@/components/signals/signal-result';

const PAIRS = {
  'Forex Majors': ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD'],
  'Metals': ['XAUUSD', 'XAGUSD'],
  'Energy': ['USOIL', 'UKOIL'],
  'Industrial': ['XCUUSD'],
};

const TIMEFRAMES = [
  { value: '15m', label: '15 Min', type: 'Scalping' },
  { value: '30m', label: '30 Min', type: 'Scalping' },
  { value: '1h', label: '1 Hour', type: 'Intraday' },
  { value: '4h', label: '4 Hours', type: 'Swing' },
  { value: '1d', label: '1 Day', type: 'Position' },
];

export default function SignalsPage() {
  const [pair, setPair] = useState('EURUSD');
  const [timeframe, setTimeframe] = useState('15m');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [signal, setSignal] = useState<any>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    setSignal(null);

    try {
      const res = await fetch('/api/signals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pair, timeframe }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Signal generate नहीं हुआ');
        return;
      }

      setSignal(data.signal);
    } catch (err) {
      setError('कुछ गलत हो गया, फिर try करो');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Zap className="w-7 h-7 text-blue-600" />
          AI Signal Generator
        </h1>
        <p className="text-slate-600 mt-1">
          ICT/SMC strategy के साथ high-probability trading signals
        </p>
      </div>

      {/* Generator Form */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">🎯 Signal Generate करो</CardTitle>
          <CardDescription>
            Pair और timeframe select करो, फिर AI analysis शुरू करो
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Pair Selector */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold">
              Currency Pair / Asset
            </Label>
            <div className="space-y-3">
              {Object.entries(PAIRS).map(([category, pairs]) => (
                <div key={category}>
                  <p className="text-xs text-slate-500 mb-2 font-medium">
                    {category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pairs.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPair(p)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                          pair === p
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold">Timeframe</Label>
            <div className="flex flex-wrap gap-2">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                    timeframe === tf.value
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                  )}
                >
                  <div>{tf.label}</div>
                  <div className="text-xs opacity-75">{tf.type}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                AI Analysis चल रहा है...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate AI Signal
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {signal && <SignalResult signal={signal} />}
    </div>
  );
}