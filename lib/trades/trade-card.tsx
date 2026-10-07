'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Trade {
  _id: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  timeframe: string;
  entryPrice: number;
  entryTime: string;
  tp1: number;
  tp2: number;
  tp3: number;
  sl: number;
  exitPrice?: number;
  exitTime?: string;
  exitReason?: string;
  pipsResult?: number;
  mfe: number;
  mae: number;
  maxExitTime: string;
  status: 'ACTIVE' | 'CLOSED';
  confidence?: number;
  strategy?: string;
  reason?: string;
}

interface TradeCardProps {
  trade: Trade;
  onClose?: (id: string) => void;
  onDelete?: (id: string) => void;
  isClosing?: boolean;
}

export function TradeCard({ trade, onClose, onDelete, isClosing }: TradeCardProps) {
  const isBuy = trade.direction === 'BUY';
  const isActive = trade.status === 'ACTIVE';
  
  const getResultColor = (reason?: string) => {
    if (!reason) return 'slate';
    if (reason.includes('TP')) return 'green';
    if (reason === 'SL_HIT') return 'red';
    return 'amber'; // TIMEOUT or MANUAL
  };
  
  const getResultLabel = (reason?: string) => {
    if (!reason) return 'Active';
    return reason.replace('_', ' ');
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

  const getTimeRemaining = (maxExitTime: string) => {
    const now = new Date().getTime();
    const max = new Date(maxExitTime).getTime();
    const diff = max - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m left`;
  };

  const resultColor = getResultColor(trade.exitReason);

  return (
    <Card className={cn(
      'border-slate-200 hover:shadow-md transition-shadow',
      isActive && 'border-l-4 border-l-blue-500'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Direction Icon */}
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
              isBuy ? 'bg-green-100' : 'bg-red-100'
            )}
          >
            {isBuy ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600" />
            )}
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-bold text-slate-900 text-lg">
                {trade.pair}
              </span>
              <span className={cn(
                'text-xs font-bold px-2 py-0.5 rounded',
                isBuy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}>
                {trade.direction}
              </span>
              <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                {trade.timeframe}
              </span>
              
              {/* Status Badge */}
              {isActive ? (
                <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  ACTIVE
                </span>
              ) : (
                <span className={cn(
                  'text-xs font-bold px-2 py-0.5 rounded',
                  resultColor === 'green' && 'bg-green-100 text-green-700',
                  resultColor === 'red' && 'bg-red-100 text-red-700',
                  resultColor === 'amber' && 'bg-amber-100 text-amber-700'
                )}>
                  {trade.exitReason?.includes('TP') && '✅ '}
                  {trade.exitReason === 'SL_HIT' && '❌ '}
                  {trade.exitReason === 'TIMEOUT' && '⏱️ '}
                  {getResultLabel(trade.exitReason)}
                </span>
              )}
            </div>

            {/* Price Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
              <div>
                <div className="text-slate-500 mb-0.5">Entry</div>
                <div className="font-mono font-bold text-slate-900">
                  {trade.entryPrice}
                </div>
              </div>
              <div>
                <div className="text-slate-500 mb-0.5">Stop Loss</div>
                <div className="font-mono font-bold text-red-600">
                  {trade.sl}
                </div>
              </div>
              <div>
                <div className="text-slate-500 mb-0.5">TP1</div>
                <div className="font-mono font-bold text-green-600">
                  {trade.tp1}
                </div>
              </div>
              {isActive ? (
                <div>
                  <div className="text-slate-500 mb-0.5">MFE / MAE</div>
                  <div className="font-mono font-bold">
                    <span className="text-green-600">{trade.mfe.toFixed(1)}</span>
                    <span className="text-slate-400"> / </span>
                    <span className="text-red-600">{trade.mae.toFixed(1)}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-slate-500 mb-0.5">Exit Price</div>
                  <div className="font-mono font-bold text-slate-900">
                    {trade.exitPrice}
                  </div>
                </div>
              )}
            </div>

            {/* Closed Trade Result */}
            {!isActive && trade.pipsResult !== undefined && (
              <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-600">Result</span>
                <span className={cn(
                  'font-mono font-bold text-sm',
                  trade.pipsResult > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {trade.pipsResult > 0 ? '+' : ''}{trade.pipsResult} pips
                </span>
              </div>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 flex-wrap">
              <span>📅 {formatDate(trade.entryTime)}</span>
              {isActive && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getTimeRemaining(trade.maxExitTime)}
                </span>
              )}
              {trade.strategy && <span>🎯 {trade.strategy}</span>}
              {trade.confidence && <span>📊 {trade.confidence}%</span>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {isActive && onClose && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onClose(trade._id)}
                disabled={isClosing}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                {isClosing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <X className="w-4 h-4 mr-1" />
                    Close
                  </>
                )}
              </Button>
            )}
            {!isActive && onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(trade._id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}