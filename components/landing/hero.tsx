'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { FloatingCoins } from './floating-coins';
import { FloatingCards } from './floating-cards';
import { containerVariants, itemFadeUp, itemScale } from '@/lib/landing-animations';

export function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-[#FAFAF7] dark:bg-[#0F0F12]">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.15]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #1A1A1A 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Gradient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#1E40AF]/10 to-[#7C3AED]/10 dark:from-[#1E40AF]/20 dark:to-[#7C3AED]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Floating coins */}
      <FloatingCoins />

      {/* Floating cards */}
      <FloatingCards />

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center"
      >
        {/* Badge */}
        <motion.div variants={itemFadeUp} className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-[#1A1A1F] border border-[#E5E5E0] dark:border-[#27272A] rounded-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#1E40AF] dark:text-[#60A5FA]" />
            <span className="text-xs font-medium text-[#6B7280] dark:text-[#A1A1AA]">
              AI-powered · ICT/SMC Analysis
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemFadeUp}
          className="text-4xl md:text-5xl lg:text-6xl leading-[1.15] tracking-tight text-[#1A1A1A] dark:text-white font-light mb-6"
        >
          now the era of human{' '}
          <span className="text-[#6B7280] dark:text-[#A1A1AA] font-normal">+ AI</span>
          <br />
          lets{' '}
          <span
            className="italic bg-gradient-to-r from-[#1E40AF via-[#7C3AED] to-[#1E40AF] bg-clip-text text-transparent"
            style={{ fontFamily: 'var(--font-fancy)', fontWeight: 500 }}
          >
            trade
          </span>{' '}
          together
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemFadeUp}
          className="text-base md:text-lg text-[#6B7280] dark:text-[#A1A1AA] max-w-2xl mx-auto mb-10 leading-relaxed font-light"
        >
          AI-powered Forex signals with institutional-grade ICT/SMC analysis.
          <br className="hidden md:block" />
          Built for traders who want an edge.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemScale}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
        >
          <Link href="/register">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                size="lg"
                className="h-12 px-7 text-sm font-medium bg-[#1A1A1A] hover:bg-black dark:bg-white dark:hover:bg-[#E5E5E5] text-white dark:text-[#0F0F12] rounded-xl shadow-lg shadow-black/10 dark:shadow-white/10 group"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </motion.div>
          </Link>

          <Link href="/login">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-7 text-sm font-medium bg-white dark:bg-transparent border border-[#E5E5E0] dark:border-[#27272A] text-[#1A1A1A] dark:text-white hover:bg-[#F5F3EE] dark:hover:bg-[#1A1A1F] rounded-xl"
              >
                See Live Demo
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          variants={itemFadeUp}
          className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#6B7280] dark:text-[#A1A1AA]"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Free forever plan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>AI-powered analysis</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}