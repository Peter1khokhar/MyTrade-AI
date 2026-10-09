'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SignalResult } from '@/components/signals/signal-result';
import { SuccessAnimation } from '@/components/ui/success-animation';
import { toast } from 'sonner';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

const PAIRS = {
  'Forex Majors': ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD'],
  '🥇 Gold (Delta)': ['XAUTUSD', 'PAXGUSD'],
  '🥈 Silver': ['XAGUSD'],
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
  const [showSuccess, setShowSuccess] = useState(false);

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
        toast.error(data.message || 'Signal generate नहीं हुआ');
        setError(data.message);
        return;
      }

      setSignal(data.signal);
      
      // 🎉 Show celebration animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1800);
      
      toast.success('🎉 Signal successfully generated!');
    } catch (err) {
      toast.error('कुछ गलत हो गया, फिर try करो');
      setError('कुछ गलत हो गया, फिर try करो');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 🎉 Success Animation */}
      <SuccessAnimation
        show={showSuccess}
        message="Signal Generated!"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Zap className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </motion.div>
          AI Signal Generator
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          ICT/SMC strategy के साथ high-probability trading signals
        </p>
      </motion.div>

      {/* Generator Form */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white">
              🎯 Generate Signal
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Select pair और timeframe, फिर AI analysis शुरू करो
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Pair Selector */}
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300 font-semibold">
                Currency Pair / Asset
              </Label>
              <div className="space-y-3">
                {Object.entries(PAIRS).map(([category, pairs]) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pairs.map((p) => (
                        <motion.button
                          key={p}
                          onClick={() => setPair(p)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                            pair === p
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md shadow-blue-500/20'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700'
                          )}
                        >
                          {p}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Timeframe Selector */}
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300 font-semibold">
                Timeframe
              </Label>
              <div className="flex flex-wrap gap-2">
                {TIMEFRAMES.map((tf) => (
                  <motion.button
                    key={tf.value}
                    onClick={() => setTimeframe(tf.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                      timeframe === tf.value
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md shadow-blue-500/20'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700'
                    )}
                  >
                    <div>{tf.label}</div>
                    <div className="text-xs opacity-75">{tf.type}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generate Button */}
            <motion.div
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-base shadow-lg shadow-blue-500/20"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="w-5 h-5 mr-2" />
                    </motion.div>
                    AI Analysis running...
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                    </motion.div>
                    Generate AI Signal
                  </>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {signal && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
          >
            <SignalResult signal={signal} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}