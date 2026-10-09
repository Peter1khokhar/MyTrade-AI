'use client';

import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Sparkles,
  Zap,
  ArrowUpRight,
  Shield,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SignalResultProps {
  signal: any;
}

export function SignalResult({ signal }: SignalResultProps) {
  const isBuy = signal.signal === 'BUY';
  const isSell = signal.signal === 'SELL';

  const signalColor = isBuy
    ? 'from-green-500 to-emerald-500'
    : isSell
    ? 'from-red-500 to-rose-500'
    : 'from-amber-500 to-orange-500';

  const SignalIcon = isBuy ? TrendingUp : isSell ? TrendingDown : Minus;

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        {/* Signal Header */}
        <div className={cn('bg-gradient-to-r p-6 text-white', signalColor)}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <SignalIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm opacity-90 font-medium">
                  {signal.pair} • {signal.timeframe}
                </p>
                <h2 className="text-4xl font-bold tracking-wider">
                  {signal.signal}
                </h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90 font-medium">Confidence</p>
              <p className="text-4xl font-bold">{signal.confidence}%</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Trade Setup Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900">
              <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold mb-1">
                💵 ENTRY
              </p>
              <p className="text-lg font-bold font-mono text-blue-900 dark:text-blue-200">
                {signal.entryPrice}
              </p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900">
              <p className="text-xs text-red-700 dark:text-red-400 font-semibold mb-1">
                🛑 STOP LOSS
              </p>
              <p className="text-lg font-bold font-mono text-red-900 dark:text-red-200">
                {signal.stopLoss}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-100 dark:border-green-900">
              <p className="text-xs text-green-700 dark:text-green-400 font-semibold mb-1">
                🎯 TP1
              </p>
              <p className="text-lg font-bold font-mono text-green-900 dark:text-green-200">
                {signal.takeProfit1}
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900">
              <p className="text-xs text-purple-700 dark:text-purple-400 font-semibold mb-1">
                ⚖️ R:R
              </p>
              <p className="text-lg font-bold font-mono text-purple-900 dark:text-purple-200">
                {signal.riskReward}
              </p>
            </div>
          </div>

          {/* Additional TPs */}
          {(signal.takeProfit2 || signal.takeProfit3) && (
            <div className="grid grid-cols-2 gap-4">
              {signal.takeProfit2 && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900">
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
                    🎯 TP2 (Moderate)
                  </p>
                  <p className="text-lg font-bold font-mono text-emerald-900 dark:text-emerald-200">
                    {signal.takeProfit2}
                  </p>
                </div>
              )}
              {signal.takeProfit3 && (
                <div className="p-4 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-100 dark:border-teal-900">
                  <p className="text-xs text-teal-700 dark:text-teal-400 font-semibold mb-1">
                    🚀 TP3 (Large Move)
                  </p>
                  <p className="text-lg font-bold font-mono text-teal-900 dark:text-teal-200">
                    {signal.takeProfit3}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Large Move Alert */}
          {signal.largeMove?.possible && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-200 dark:border-amber-900">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ArrowUpRight className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-bold text-amber-900 dark:text-amber-300 mb-1">
                    🚀 Large Move Possible!
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    <strong>{signal.largeMove.pips} pips</strong> की move expected है
                  </p>
                  {signal.largeMove.reason && (
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                      {signal.largeMove.reason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Strategy & Timing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase">
                  Strategy
                </p>
              </div>
              <p className="font-bold text-slate-900 dark:text-white">
                {signal.strategy || 'ICT/SMC'}
              </p>
            </div>
            {signal.bestTimeToEnter && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase">
                    Best Time to Enter
                  </p>
                </div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {signal.bestTimeToEnter}
                </p>
              </div>
            )}
          </div>

          {/* AI Reasoning */}
          <div className="p-5 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-xl border border-purple-100 dark:border-purple-900">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <p className="font-bold text-slate-900 dark:text-white">
                🧠 AI Analysis
              </p>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {signal.reason}
            </p>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg">
            <Shield className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              ⚠️ ये AI-generated analysis है, financial advice नहीं। अपनी खुद की research करें और proper risk management use करें।
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}