'use client';

import { motion } from 'framer-motion';
import { Target, BarChart3, Brain, ArrowUpRight } from 'lucide-react';
import { scrollFadeUp, scrollStagger } from '@/lib/landing-animations';

const features = [
  {
    icon: Target,
    title: 'AI-Powered Signals',
    description:
      'High-probability trade setups with precise entry, stop-loss, and take-profit levels.',
  },
  {
    icon: BarChart3,
    title: 'ICT/SMC Analysis',
    description:
      'Institutional concepts — Order Blocks, FVGs, Liquidity Sweeps — analyzed in real-time.',
  },
  {
    icon: Brain,
    title: 'Self-Learning AI',
    description:
      'The AI learns from every trade. Performance improves with each signal.',
  },
];

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="relative py-24 lg:py-32 bg-[#FAFAF7] dark:bg-[#0F0F12] border-t border-[#E5E5E0] dark:border-[#27272A]"
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
            Features
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#1A1A1A] dark:text-white font-light tracking-tight leading-tight max-w-3xl mx-auto">
            Everything you need to{' '}
            <span
              className="italic bg-gradient-to-r from-[#1E40AF] to-[#7C3AED] bg-clip-text text-transparent"
              style={{ fontFamily: 'var(--font-fancy)', fontWeight: 500 }}
            >
              trade
            </span>{' '}
            smarter
          </h2>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={scrollStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                variants={scrollFadeUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="group relative p-7 rounded-2xl bg-white dark:bg-[#1A1A1F] border border-[#E5E5E0] dark:border-[#27272A] hover:border-[#1E40AF]/30 dark:hover:border-[#60A5FA]/30 transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E40AF] to-[#7C3AED] flex items-center justify-center mb-5 shadow-lg shadow-[#1E40AF]/10">
                  <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>

                {/* Content */}
                <h3 className="text-base font-medium text-[#1A1A1A] dark:text-white mb-2.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#6B7280] dark:text-[#A1A1AA] leading-relaxed font-light">
                  {feature.description}
                </p>

                {/* Arrow on hover */}
                <ArrowUpRight className="absolute top-7 right-7 w-4 h-4 text-[#6B7280] dark:text-[#A1A1AA] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}