'use client';

import { motion } from 'framer-motion';
import { coinFloat } from '@/lib/landing-animations';

interface Coin {
  symbol: string;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  size: number;
  gradient: string;
  delay: number;
  duration: number;
}

const coins: Coin[] = [
  {
    symbol: '$',
    position: { top: '18%', left: '6%' },
    size: 64,
    gradient: 'from-[#34D399] to-[#059669]',
    delay: 0,
    duration: 5,
  },
  {
    symbol: '€',
    position: { top: '55%', left: '4%' },
    size: 56,
    gradient: 'from-[#60A5FA] to-[#2563EB]',
    delay: 0.3,
    duration: 6,
  },
  {
    symbol: '£',
    position: { bottom: '20%', right: '7%' },
    size: 56,
    gradient: 'from-[#A78BFA] to-[#7C3AED]',
    delay: 0.6,
    duration: 5.5,
  },
  {
    symbol: '¥',
    position: { top: '25%', right: '5%' },
    size: 52,
    gradient: 'from-[#F87171] to-[#DC2626]',
    delay: 0.9,
    duration: 7,
  },
  {
    symbol: '₿',
    position: { top: '8%', right: '18%' },
    size: 72,
    gradient: 'from-[#FBBF24] to-[#D97706]',
    delay: 0.4,
    duration: 6.5,
  },
  {
    symbol: 'Au',
    position: { bottom: '12%', left: '12%' },
    size: 60,
    gradient: 'from-[#FCD34D] to-[#B45309]',
    delay: 0.7,
    duration: 5.8,
  },
];

function CoinIcon({ coin }: { coin: Coin }) {
  return (
    <motion.div
      variants={coinFloat(coin.delay)}
      initial="hidden"
      animate="visible"
      style={{ position: 'absolute', ...coin.position }}
      className="pointer-events-none select-none hidden md:block"
    >
      <motion.div
        animate={{
          y: [0, -14, 0],
          rotate: [0, 6, 0],
        }}
        transition={{
          duration: coin.duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative"
      >
        {/* Coin outer glow */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${coin.gradient} blur-xl opacity-30`}
        />
        
        {/* Coin body */}
        <div
          className={`relative rounded-full bg-gradient-to-br ${coin.gradient} flex items-center justify-center shadow-2xl`}
          style={{ width: coin.size, height: coin.size }}
        >
          {/* Inner ring */}
          <div
            className="absolute inset-[3px] rounded-full border border-white/40"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)' }}
          />
          
          {/* Symbol */}
          <span
            className="font-semibold text-white/95 relative z-10"
            style={{ fontSize: coin.size * 0.42 }}
          >
            {coin.symbol}
          </span>
          
          {/* Shine */}
          <div className="absolute top-2 left-3 w-1/3 h-1/4 bg-white/30 rounded-full blur-sm" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export function FloatingCoins() {
  return (
    <>
      {coins.map((coin, i) => (
        <CoinIcon key={i} coin={coin} />
      ))}
    </>
  );
}