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
  RefreshCw,
  Loader2,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [success, setSuccess] = useState('');

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
    setSuccess('');

    try {
      const res = await fetch('/api/learning/analyze', { method: 'POST' });
      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      setSuccess('🎉 Learning analysis complete! AI ने नई lessons निकालीं');
      fetchLearningHistory();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Analysis failed, फिर try करो');
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
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-purple-600" />
            AI Learning Center
          </h1>
          <p className="text-slate-600 mt-1">
            अपने trades से AI सीख रहा है - performance improve हो रही है
          </p>
        </div>
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
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && logs.length === 0 && (
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Learning शुरू करने के लिए तैयार
            </h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto mb-4">
              जब तुम्हारे पास कम से कम 3 closed trades होंगी, तब AI analyze करके lessons निकालेगा
            </p>
            <p className="text-xs text-slate-500">
              ऊपर "Run Learning Analysis" button click करके शुरू करो
            </p>
          </CardContent>
        </Card>
      )}

      {/* Current Learning Stats */}
      {!isLoading && latestLog && (
        <>
          {/* Performance Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600 font-semibold uppercase">Win Rate</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {latestLog.winRate}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600 font-semibold uppercase">Trades</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {latestLog.tradesAnalyzed}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600 font-semibold uppercase">Avg Pips</p>
                    <p className={cn(
                      'text-2xl font-bold mt-1',
                      latestLog.avgPips > 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {latestLog.avgPips > 0 ? '+' : ''}{latestLog.avgPips}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    {latestLog.avgPips > 0 ? (
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-purple-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600 font-semibold uppercase">Version</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">
                      v{latestLog.promptVersion}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Best/Worst Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-slate-200 border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-green-700 flex items-center gap-2">
                  🏆 Best Performing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Best Pair</span>
                    <span className="font-bold text-slate-900">
                      {latestLog.bestPair} ({latestLog.bestPairWinRate}% WR)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Best Strategy</span>
                    <span className="font-bold text-slate-900">
                      {latestLog.bestStrategy || 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-red-700 flex items-center gap-2">
                  ❌ Worst Performing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Worst Pair</span>
                    <span className="font-bold text-slate-900">
                      {latestLog.worstPair} ({latestLog.worstPairWinRate}% WR)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Worst Strategy</span>
                    <span className="font-bold text-slate-900">
                      {latestLog.worstStrategy || 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lessons */}
          <Card className="border-slate-200 bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Brain className="w-5 h-5" />
                🧠 Lessons Learned
              </CardTitle>
              <CardDescription className="text-purple-700">
                AI ने तुम्हारे trades से ये patterns खोजे
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestLog.lessons.map((lesson, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-100"
                >
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-700">
                    {i + 1}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{lesson}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Improvements */}
          <Card className="border-slate-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Lightbulb className="w-5 h-5" />
                💡 Improvements to Apply
              </CardTitle>
              <CardDescription className="text-amber-700">
                ये changes अब automatically signals में apply होंगे
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestLog.improvements.map((improvement, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-100"
                >
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-amber-700">
                    {i + 1}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{improvement}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Current Focus */}
          {latestLog.refinedPromptSummary && (
            <Card className="border-slate-200 bg-gradient-to-br from-green-50 to-teal-50 border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  🎯 Current Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-900 leading-relaxed font-medium">
                  {latestLog.refinedPromptSummary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Learning History */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                📚 Learning History
              </CardTitle>
              <CardDescription>
                पिछली analyses का record
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.map((log, i) => (
                  <div
                    key={log._id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      i === 0 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs',
                        i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                      )}>
                        v{log.promptVersion}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {log.tradesAnalyzed} trades analyzed
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(log.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'text-sm font-bold',
                        log.winRate >= 60 ? 'text-green-600' : 
                        log.winRate >= 40 ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {log.winRate}% WR
                      </p>
                      <p className="text-xs text-slate-500">
                        {log.lessons.length} lessons
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}