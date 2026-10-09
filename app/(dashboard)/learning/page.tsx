'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  BookOpen,
  Loader2,
  Sparkles,
  Award,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations';
import { toast } from 'sonner';

interface LearningLog {
  _id: string;
  promptVersion: number;
  tradesAnalyzed: number;
  wins: number;
  losses: number;
  winRate: number;
  avgPips: number;
  totalPips: number;
  bestPair: string;
  bestPairWinRate: number;
  worstPair: string;
  worstPairWinRate: number;
  bestStrategy: string;
  worstStrategy: string;
  lessons: string[];
  improvements: string[];
  refinedPromptSummary: string;
  createdAt: string;
}

export default function LearningPage() {
  const [logs, setLogs] = useState<LearningLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const fetchLearningHistory = async () => {
    try {
      const res = await fetch('/api/learning/history');
      const data = await res.json();

      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch learning history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningHistory();
  }, []);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError('');

    try {
      const res = await fetch('/api/learning/analyze', { method: 'POST' });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.message);
        setError(data.message);
        return;
      }

      toast.success('🎉 Learning analysis complete!');
      fetchLearningHistory();
    } catch (err) {
      toast.error('Analysis failed, try again');
      setError('Analysis failed, try again');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const latestLog = logs[0];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
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
            <Brain className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            AI Learning Center
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            AI सीख रहा है आपके trades से — performance improve हो रही है
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Run Learning Analysis
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-400 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && logs.length === 0 && (
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-12 text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-950 dark:to-blue-950 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </motion.div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Ready to start learning
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto mb-4">
                AI needs at least 3 closed trades to analyze and find patterns
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Click "Run Learning Analysis" button above to start
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Learning Data */}
      {!isLoading && latestLog && (
        <>
          {/* Performance Stats */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <motion.div variants={staggerItem} whileHover={{ y: -4 }}>
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase">
                        Win Rate
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                        {latestLog.winRate}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-950/50 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem} whileHover={{ y: -4 }}>
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase">
                        Trades
                      </p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {latestLog.tradesAnalyzed}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem} whileHover={{ y: -4 }}>
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase">
                        Avg Pips
                      </p>
                      <p
                        className={cn(
                          'text-2xl font-bold mt-1',
                          latestLog.avgPips > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {latestLog.avgPips > 0 ? '+' : ''}
                        {latestLog.avgPips}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/50 rounded-xl flex items-center justify-center">
                      {latestLog.avgPips > 0 ? (
                        <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem} whileHover={{ y: -4 }}>
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase">
                        Version
                      </p>
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                        v{latestLog.promptVersion}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/50 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Best/Worst */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                  🏆 Best Performing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Best Pair
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {latestLog.bestPair} ({latestLog.bestPairWinRate}% WR)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Best Strategy
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {latestLog.bestStrategy || 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                  ❌ Worst Performing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Worst Pair
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {latestLog.worstPair} ({latestLog.worstPairWinRate}% WR)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Worst Strategy
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {latestLog.worstStrategy || 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lessons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-300">
                  <Brain className="w-5 h-5" />
                  🧠 Lessons Learned
                </CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-400">
                  AI ने आपके trades से ये patterns खोजे
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {latestLog.lessons.map((lesson, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-purple-100 dark:border-purple-900"
                  >
                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-950/50 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-700 dark:text-purple-400">
                      {i + 1}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {lesson}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Improvements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
                  <Lightbulb className="w-5 h-5" />
                  💡 Improvements to Apply
                </CardTitle>
                <CardDescription className="text-amber-700 dark:text-amber-400">
                  ये changes अब automatically signals में apply होंगे
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {latestLog.improvements.map((improvement, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-amber-100 dark:border-amber-900"
                  >
                    <div className="w-6 h-6 bg-amber-100 dark:bg-amber-950/50 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-amber-700 dark:text-amber-400">
                      {i + 1}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {improvement}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Current Focus */}
          {latestLog.refinedPromptSummary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-300">
                    🎯 Current Focus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-900 dark:text-green-300 leading-relaxed font-medium">
                    {latestLog.refinedPromptSummary}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Learning History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <BookOpen className="w-5 h-5" />
                  📚 Learning History
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Past analysis records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {logs.map((log, i) => (
                    <div
                      key={log._id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-md',
                        i === 0
                          ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs',
                            i === 0
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          )}
                        >
                          v{log.promptVersion}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {log.tradesAnalyzed} trades analyzed
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(log.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            'text-sm font-bold',
                            log.winRate >= 60
                              ? 'text-green-600 dark:text-green-400'
                              : log.winRate >= 40
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-red-600 dark:text-red-400'
                          )}
                        >
                          {log.winRate}% WR
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {log.lessons.length} lessons
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}