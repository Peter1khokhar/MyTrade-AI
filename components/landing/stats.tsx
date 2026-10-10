'use client';

import { motion } from 'framer-motion';
import { scrollFadeUp } from '@/lib/landing-animations';

const stats = [
  { value: '10,000+', label: 'Signals Generated' },
  { value: '68%', label: 'Win Rate' },
  { value: '50+', label: 'Pairs Covered' },
  { value: '24/7', label: 'AI Monitoring' },
];

export function LandingStats() {
  return (
    <section className="relative py-20 lg:py-24 bg-[#FAFAF7] dark:bg-[#0F0F12] border-t border-[#E5E5E0] dark:border-[#27272A]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          variants={scrollFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div
                className="text-3xl md:text-4xl lg:text-5xl font-light text-[#1A1A1A] dark:text-white mb-2 tracking-tight"
                style={{ fontFamily: 'var(--font-fancy)', fontWeight: 500 }}
              >
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-[#6B7280] dark:text-[#A1A1AA] font-light">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}