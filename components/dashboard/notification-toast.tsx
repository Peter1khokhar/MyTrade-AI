'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/lib/context/notification-context';
import { TrendingUp, TrendingDown, Target, X, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NotificationToast() {
  const router = useRouter();
  const { latestNotification } = useNotifications();
  const [visibleNotification, setVisibleNotification] = useState<any>(null);

  useEffect(() => {
    if (latestNotification) {
      setVisibleNotification(latestNotification);

      // Auto hide after 8 seconds
      const timer = setTimeout(() => {
        setVisibleNotification(null);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [latestNotification]);

  if (!visibleNotification) return null;

  const isBuy = visibleNotification.signal === 'BUY';
  const isSell = visibleNotification.signal === 'SELL';
  const SignalIcon = isBuy ? TrendingUp : isSell ? TrendingDown : Target;

  return (
    <AnimatePresence>
      {visibleNotification && (
        <motion.div
          initial={{ opacity: 0, x: 400, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 400, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-20 right-4 z-50 w-80 cursor-pointer"
          onClick={() => {
            router.push('/notifications');
            setVisibleNotification(null);
          }}
        >
          <div
            className={cn(
              'bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 overflow-hidden',
              isBuy && 'border-green-500/30',
              isSell && 'border-red-500/30',
              !isBuy && !isSell && 'border-blue-500/30'
            )}
          >
            {/* Header */}
            <div
              className={cn(
                'p-3 flex items-center justify-between',
                isBuy && 'bg-green-50 dark:bg-green-950/30',
                isSell && 'bg-red-50 dark:bg-red-950/30',
                !isBuy && !isSell && 'bg-blue-50 dark:bg-blue-950/30'
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    isBuy && 'bg-green-500',
                    isSell && 'bg-red-500',
                    !isBuy && !isSell && 'bg-blue-500'
                  )}
                >
                  <SignalIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {visibleNotification.signal} Signal
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {visibleNotification.pair}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setVisibleNotification(null);
                }}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                {visibleNotification.title}
              </p>

              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                  <p className="text-slate-500 dark:text-slate-400">Entry</p>
                  <p className="font-mono font-bold text-slate-900 dark:text-white">
                    {visibleNotification.entryPrice?.toFixed(5)}
                  </p>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                  <p className="text-slate-500 dark:text-slate-400">Confidence</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400">
                    {visibleNotification.confidence}%
                  </p>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                  <p className="text-slate-500 dark:text-slate-400">Confluence</p>
                  <p className="font-bold text-purple-600 dark:text-purple-400">
                    {visibleNotification.confluenceScore}
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                <Bell className="w-3 h-3" />
                Click to view details
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}