'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { navbarVariants } from '@/lib/landing-animations';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Instruments', href: '#instruments' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);
  });

  return (
    <motion.header
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[#FAFAF7]/80 dark:bg-[#0F0F12]/80 backdrop-blur-xl border-b border-[#E5E5E0] dark:border-[#27272A]'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E40AF] to-[#7C3AED] flex items-center justify-center shadow-lg shadow-[#1E40AF]/20"
            >
              <span className="text-white text-lg font-bold">M</span>
            </motion.div>
            <span className="text-lg font-semibold tracking-tight text-[#1A1A1A] dark:text-white">
              MyTrade <span className="text-[#6B7280] dark:text-[#A1A1AA] font-normal">AI</span>
            </span>
          </Link>

          {/* Nav Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-normal text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#1A1A1A] dark:hover:text-white transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[#1E40AF] dark:bg-[#60A5FA] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <Link href="/login">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="h-9 px-5 text-sm font-medium bg-[#1A1A1A] hover:bg-[#000000] dark:bg-white dark:hover:bg-[#E5E5E5] text-white dark:text-[#0F0F12] rounded-lg shadow-sm"
                >
                  Sign in
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}