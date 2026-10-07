'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3,
  Loader2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Target,
  Activity,
  Clock,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PAIRS = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD', 'XAUUSD','XAUTUSD', 'XAGUSD', 'USOIL'];

export default function AnalysisPage() {
  const [pair, setPair] = useState('EURUSD');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const res = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pair }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      setAnalysis(data);
    } catch (err) {
      setError('Analysis not done please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const getBiasColor = (bias: string) => {
    if (bias === 'BULLISH') return 'from-green-500 to-emerald-500';
    if (bias === 'BEARISH') return 'from-red-500 to-rose-500';
    return 'from-amber-500 to-orange-500';
  };

  const getBiasIcon = (bias: string) => {
    if (bias === 'BULLISH') return TrendingUp;
    if (bias === 'BEARISH') return TrendingDown;
    return Minus;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-blue-600" />
          Market Analysis
        </h1>
        <p className="text-slate-600 mt-1">
          Multi-timeframe ICT/SMC analysis
        </p>
      </div>

      {/* Pair Selector */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">🎯 Select Pair</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {PAIRS.map((p) => (
              <button
                key={p}
                onClick={() => setPair(p)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                  pair === p
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                )}
              >
                {p}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Multi-timeframe Analysis चल रहा है...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze {pair}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Result */}
      {analysis && (
        <div className="space-y-4">
          {/* Market Bias */}
          <Card className="border-slate-200 overflow-hidden">
            <div className={cn('bg-gradient-to-r p-6 text-white', getBiasColor(analysis.analysis.marketBias))}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  {(() => {
                    const Icon = getBiasIcon(analysis.analysis.marketBias);
                    return (
                      <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                        <Icon className="w-8 h-8" />
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-sm opacity-90">Market Bias</p>
                    <h2 className="text-3xl font-bold">{analysis.analysis.marketBias}</h2>
                    <p className="text-sm opacity-90 mt-1">
                      Strength: {analysis.analysis.biasStrength}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Current Price</p>
                  <p className="text-3xl font-bold font-mono">{analysis.currentPrice}</p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Summary */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  📝 Summary
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {analysis.analysis.summary}
                </p>
              </div>

              {/* RSI Multi-Timeframe */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                  <p className="text-xs text-blue-700 font-semibold mb-1">RSI 15m</p>
                  <p className="text-xl font-bold font-mono text-blue-900">
                    {analysis.marketData.rsi15m}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-center">
                  <p className="text-xs text-purple-700 font-semibold mb-1">RSI 1h</p>
                  <p className="text-xl font-bold font-mono text-purple-900">
                    {analysis.marketData.rsi1h}
                  </p>
                </div>
                <div className="p-4 bg-pink-50 rounded-xl border border-pink-100 text-center">
                  <p className="text-xs text-pink-700 font-semibold mb-1">RSI 4h</p>
                  <p className="text-xl font-bold font-mono text-pink-900">
                    {analysis.marketData.rsi4h}
                  </p>
                </div>
              </div>

              {/* Key Levels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-sm font-bold text-green-800 mb-3">
                    🟢 Support Levels
                  </p>
                  <div className="space-y-1">
                    {analysis.analysis.keyLevels?.support?.map((level: number, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-green-700">S{i + 1}</span>
                        <span className="font-mono font-bold text-green-900">{level}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-sm font-bold text-red-800 mb-3">
                    🔴 Resistance Levels
                  </p>
                  <div className="space-y-1">
                    {analysis.analysis.keyLevels?.resistance?.map((level: number, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-red-700">R{i + 1}</span>
                        <span className="font-mono font-bold text-red-900">{level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ICT Concepts */}
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <p className="text-sm font-bold text-indigo-900 mb-3">
                  🧠 ICT/SMC Concepts
                </p>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-indigo-800">Order Blocks:</span>
                    <p className="text-slate-700 mt-1">{analysis.analysis.ictConcepts?.orderBlocks}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-800">Fair Value Gaps:</span>
                    <p className="text-slate-700 mt-1">{analysis.analysis.ictConcepts?.fairValueGaps}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-800">Liquidity:</span>
                    <p className="text-slate-700 mt-1">{analysis.analysis.ictConcepts?.liquidity}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-800">Market Structure:</span>
                    <p className="text-slate-700 mt-1">{analysis.analysis.ictConcepts?.marketStructure}</p>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1 mb-1">
                    <Target className="w-3 h-3 text-slate-500" />
                    <p className="text-xs text-slate-600 font-semibold">Alignment</p>
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    {analysis.analysis.timeframeAlignment}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <p className="text-xs text-slate-600 font-semibold">Best Session</p>
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    {analysis.analysis.bestSession}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1 mb-1">
                    <Activity className="w-3 h-3 text-slate-500" />
                    <p className="text-xs text-slate-600 font-semibold">Volatility</p>
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    {analysis.analysis.volatility}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1 mb-1">
                    <Zap className="w-3 h-3 text-slate-500" />
                    <p className="text-xs text-slate-600 font-semibold">Bias</p>
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    {analysis.analysis.biasStrength}
                  </p>
                </div>
              </div>

              {/* Trade Ideas */}
              <div>
                <p className="text-sm font-bold text-slate-900 mb-3">
                  💡 Trade Ideas
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs font-bold text-blue-800 mb-1">⚡ Scalping</p>
                    <p className="text-xs text-slate-700">{analysis.analysis.tradeIdeas?.scalping}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <p className="text-xs font-bold text-purple-800 mb-1">📊 Intraday</p>
                    <p className="text-xs text-slate-700">{analysis.analysis.tradeIdeas?.intraday}</p>
                  </div>
                  <div className="p-3 bg-pink-50 rounded-lg border border-pink-100">
                    <p className="text-xs font-bold text-pink-800 mb-1">📈 Swing</p>
                    <p className="text-xs text-slate-700">{analysis.analysis.tradeIdeas?.swing}</p>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              {analysis.analysis.riskFactors?.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-sm font-bold text-amber-900 mb-2">
                    ⚠️ Risk Factors
                  </p>
                  <ul className="space-y-1">
                    {analysis.analysis.riskFactors.map((risk: string, i: number) => (
                      <li key={i} className="text-xs text-amber-800 flex items-start gap-2">
                        <span>•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendation */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <p className="text-sm font-bold text-blue-900 mb-2">
                  🎯 Recommendation
                </p>
                <p className="text-sm text-slate-800 font-medium">
                  {analysis.analysis.recommendation}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}