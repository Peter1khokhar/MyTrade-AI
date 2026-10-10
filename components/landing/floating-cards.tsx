'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Sparkles } from 'lucide-react';
import { cardFloat } from '@/lib/landing-animations';

export function FloatingCards() {
  return (
    <>
      {/* Live Signal Card - Bottom Left */}
      <motion.div
        variants={cardFloat(0)}
        initial="hidden"
        animate="visible"
        style={{ position: 'absolute', bottom: '10%', left: '5%' }}
        className="hidden lg:block pointer-events-none select-none"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-56 bg-white dark:bg-[#1A1A1F] rounded-2xl border border-[#E5E5E0] dark:border-[#27272A] p-4 shadow-xl shadow-black/5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-xs font-medium text-[#1A1A1A] dark:text-white">
                EURUSD
              </span>
            </div>
            <span className="text-[10px] font-semibold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">
              BUY
            </span>
          </div>
          
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-lg font-semibold text-[#1A1A1A] dark:text-white font-mono">
              1.1602
            </span>
            <span className="text-xs text-[#10B981] font-medium">
              +45 pips
            </span>
          </div>
          
          {/* Mini chart */}
          <svg viewBox="0 0 200 40" className="w-full h-8">
            <path
              d="M0,30 L20,25 L40,28 L60,18 L80,22 L100,12 L120,16 L140,8 L160,14 L180,6 L200,10"
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Chart Card - Top Right */}
      <motion.div
        variants={cardFloat(0.3)}
        initial="hidden"
        animate="visible"
        style={{ position: 'absolute', top: '18%', right: '5%' }}
        className="hidden lg:block pointer-events-none select-none"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-56 bg-white dark:bg-[#1A1A1F] rounded-2xl border border-[#E5E5E0] dark:border-[#27272A] p-4 shadow-xl shadow-black/5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#1A1A1A] dark:text-white">
              XAUUSD
            </span>
            <div className="flex items-center gap-1 text-[#10B981]">
              <TrendingUp className="w-3 h-3" />
              <span className="text-[10px] font-semibold">+1.2%</span>
            </div>
          </div>
          
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-lg font-semibold text-[#1A1A1A] dark:text-white font-mono">
              $4,196.50
            </span>
          </div>
          
          {/* Mini chart */}
          <svg viewBox="0 0 200 40" className="w-full h-8">
            <defs>
              <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,25 L30,22 L60,28 L90,18 L120,15 L150,20 L180,10 L200,8"
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M0,25 L30,22 L60,28 L90,18 L120,15 L150,20 L180,10 L200,8 L200,40 L0,40 Z"
              fill="url(#chartGrad)"
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* AI Card - Mid Left */}
      <motion.div
        variants={cardFloat(0.6)}
        initial="hidden"
        animate="visible"
        style={{ position: 'absolute', top: '62%', left: '7%' }}
        className="hidden xl:block pointer-events-none select-none"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-48 bg-white dark:bg-[#1A1A1F] rounded-2xl border border-[#E5E5E0] dark:border-[#27272A] p-3.5 shadow-xl shadow-black/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#1E40AF] to-[#7C3AED] flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-[10px] font-medium text-[#6B7280] dark:text-[#A1A1AA]">
              AI Confidence
            </span>
          </div>
          <div className="text-lg font-semibold text-[#1A1A1A] dark:text-white">
            83%
          </div>
          <div className="w-full bg-[#E5E5E0] dark:bg-[#27272A] rounded-full h-1.5 mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '83%' }}
              transition={{ delay: 2, duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[#1E40AF] to-[#7C3AED]"
            />
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}