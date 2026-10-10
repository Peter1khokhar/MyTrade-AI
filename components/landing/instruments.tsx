'use client';

import { motion } from 'framer-motion';
import { scrollFadeUp } from '@/lib/landing-animations';

const instruments = [
  { symbol: 'EURUSD', name: 'Euro / USD', price: '1.1602', change: '+0.32%', up: true },
  { symbol: 'GBPUSD', name: 'Pound / USD', price: '1.3210', change: '+0.18%', up: true },
  { symbol: 'USDJPY', name: 'USD / Yen', price: '158.26', change: '-0.12%', up: false },
  { symbol: 'XAUTUSD', name: 'Gold (Tether)', price: '4196.50', change: '+1.24%', up: true },
  { symbol: 'PAXGUSD', name: 'Gold (Paxos)', price: '4195.20', change: '+1.18%', up: true },
  { symbol: 'XAGUSD', name: 'Silver', price: '28.45', change: '+0.86%', up: true },
  { symbol: 'USOIL', name: 'Crude Oil', price: '78.20', change: '-0.45%', up: false },
  { symbol: 'XCUUSD', name: 'Copper', price: '4.35', change: '+0.72%', up: true },
];

export function LandingInstruments() {
  return (
    <section
      id="instruments"
      className="relative py-24 lg:py-32 bg-[#F5F3EE] dark:bg-[#0A0A0D] border-t border-[#E5E5E0] dark:border-[#27272A]"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          variants={scrollFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <p className="text-xs font-medium tracking-widest uppercase text-[#6B7280] dark:text-[#A1A1AA] mb-4">
            Instruments
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#1A1A1A] dark:text-white font-light tracking-tight leading-tight max-w-3xl mx-auto mb-4">
            Trade every{' '}
            <span
              className="italic bg-gradient-to-r from-[#1E40AF] to-[#7C3AED] bg-clip-text text-transparent"
              style={{ fontFamily: 'var(--font-fancy)', fontWeight: 500 }}
            >
              major
            </span>{' '}
            market
          </h2>
          <p className="text-base text-[#6B7280] dark:text-[#A1A1AA] max-w-xl mx-auto font-light">
            Forex, metals, energy, and commodities — all in one platform.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={scrollFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {instruments.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2 }}
              className="p-4 rounded-xl bg-white dark:bg-[#1A1A1F] border border-[#E5E5E0] dark:border-[#27272A] hover:border-[#1E40AF]/30 dark:hover:border-[#60A5FA]/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#1A1A1A] dark:text-white tracking-tight">
                  {item.symbol}
                </span>
                <span
                  className={`text-[10px] font-medium ${
                    item.up ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}
                >
                  {item.change}
                </span>
              </div>
              <div className="text-[10px] text-[#6B7280] dark:text-[#A1A1AA] mb-2 font-light">
                {item.name}
              </div>
              <div className="text-sm font-medium text-[#1A1A1A] dark:text-white font-mono">
                {item.price}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}