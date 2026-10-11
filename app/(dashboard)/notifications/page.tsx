'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  BellOff,
  Loader2,
  TrendingUp,
  TrendingDown,
  Trash2,
  CheckCheck,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/lib/context/notification-context';

// 🆕 Notification type
interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  pair?: string;
  signal?: 'BUY' | 'SELL' | 'HOLD';
  confidence?: number;
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  timeframe?: string;
  strategy?: string;
  reason?: string;
  confluenceScore?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

 useEffect(() => {
  refresh();
  
  // Mark all as read when page opens
  const markAll = async () => {
    if (unreadCount > 0) {
      await markAllAsRead();
    }
  };
  
  // Small delay to show unread state briefly
  const timer = setTimeout(markAll, 100);
  
  return () => clearTimeout(timer);
}, []);

  const clearAll = async () => {
    if (!confirm('Clear all notifications?')) return;

    try {
      await fetch('/api/notifications', { method: 'DELETE' });
      await refresh();
      toast.success('All cleared');
    } catch (error) {
      toast.error('Failed');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString('en-IN');
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white border-0 font-bold">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            AI scanner ke signals aur alerts
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
                className="h-9 text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
                Mark all read
              </Button>
            )}
            <Button
              onClick={clearAll}
              variant="outline"
              size="sm"
              className="h-9 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:border-slate-700 dark:hover:bg-red-950/30"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Clear all
            </Button>
          </div>
        )}
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && notifications.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <BellOff className="w-8 h-8 text-slate-400 dark:text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Koi notification nahi
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Jab AI ko strong trading setup milega, notification yahan dikhega
          </p>
        </motion.div>
      )}

      {/* Notifications List */}
      {!isLoading && notifications.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((notification: Notification) => {
              const isBuy = notification.signal === 'BUY';
              const isSell = notification.signal === 'SELL';
              const SignalIcon = isBuy ? TrendingUp : isSell ? TrendingDown : Target;

              return (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                  className={cn(
                    'p-4 rounded-xl border cursor-pointer transition-all',
                    notification.isRead
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 hover:shadow-md'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        isBuy && 'bg-green-100 dark:bg-green-950/50',
                        isSell && 'bg-red-100 dark:bg-red-950/50',
                        !isBuy && !isSell && 'bg-blue-100 dark:bg-blue-950/50'
                      )}
                    >
                      <SignalIcon
                        className={cn(
                          'w-5 h-5',
                          isBuy && 'text-green-600 dark:text-green-400',
                          isSell && 'text-red-600 dark:text-red-400',
                          !isBuy && !isSell && 'text-blue-600 dark:text-blue-400'
                        )}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                          className={cn(
                            'text-sm font-semibold',
                            notification.isRead
                              ? 'text-slate-900 dark:text-white'
                              : 'text-blue-900 dark:text-blue-100'
                          )}
                        >
                          {notification.title}
                        </h3>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex-shrink-0">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                        {notification.message}
                      </p>

                      {notification.signal && notification.signal !== 'HOLD' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-[11px]">
                          <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                            <span className="text-slate-500 dark:text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">
                              Entry
                            </span>
                            <span className="font-mono font-semibold text-slate-900 dark:text-white">
                              {notification.entryPrice?.toFixed(5)}
                            </span>
                          </div>
                          <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                            <span className="text-slate-500 dark:text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">
                              Stop Loss
                            </span>
                            <span className="font-mono font-semibold text-red-600 dark:text-red-400">
                              {notification.stopLoss?.toFixed(5)}
                            </span>
                          </div>
                          <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                            <span className="text-slate-500 dark:text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">
                              Take Profit
                            </span>
                            <span className="font-mono font-semibold text-green-600 dark:text-green-400">
                              {notification.takeProfit?.toFixed(5)}
                            </span>
                          </div>
                          <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                            <span className="text-slate-500 dark:text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">
                              Confidence
                            </span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {notification.confidence}%
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                        {notification.pair && (
                          <span className="font-semibold">{notification.pair}</span>
                        )}
                        {notification.confluenceScore && (
                          <span className="text-blue-600 dark:text-blue-400">
                            • {notification.confluenceScore} confluence
                          </span>
                        )}
                      </div>
                    </div>

                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-2 animate-pulse" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}