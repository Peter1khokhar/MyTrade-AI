'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { scrollFadeUp } from '@/lib/landing-animations';

export function LandingCTA() {
  return (
    <section className="relative py-24 lg:py-32 bg-[#F5F3EE] dark:bg-[#0A0A0D] border-t border-[#E5E5E0] dark:border-[#27272A]">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          variants={scrollFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#1A1A1A] dark:text-white font-light tracking-tight leading-tight mb-5">
            Ready to trade with an{' '}
            <span
              className="italic bg-gradient-to-r from-[#1E40AF] to-[#7C3AED] bg-clip-text text-transparent"
              style={{ fontFamily: 'var(--font-fancy)', fontWeight: 500 }}
            >
              AI edge
            </span>
            ?
          </h2>
          <p className="text-base text-[#6B7280] dark:text-[#A1A1AA] max-w-lg mx-auto mb-8 font-light">
            Join thousands of traders using MyTrade AI to make better decisions.
          </p>

          <Link href="/register">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-block"
            >
              <Button
                size="lg"
                className="h-12 px-7 text-sm font-medium bg-[#1A1A1A] hover:bg-black dark:bg-white dark:hover:bg-[#E5E5E5] text-white dark:text-[#0F0F12] rounded-xl shadow-lg shadow-black/10 dark:shadow-white/10 group"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}