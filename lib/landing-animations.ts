import { Variants } from 'framer-motion';

// ═══════════════════════════════════════════════════════════
// 🎬 Page Load Animations
// ═══════════════════════════════════════════════════════════

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

export const itemFadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const itemFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const itemScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export const navbarVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

// ═══════════════════════════════════════════════════════════
// 🪙 Floating Coin Animations
// ═══════════════════════════════════════════════════════════

export const coinFloat = (delay = 0): Variants => ({
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: 1.2 + delay,
      duration: 0.6,
      ease: 'easeOut',
    },
  },
});

export const coinFloatLoop = (duration = 4) => ({
  y: [0, -12, 0],
  rotate: [0, 5, 0],
  transition: {
    duration,
    repeat: Infinity,
    ease: 'easeInOut',
  },
});

// ═══════════════════════════════════════════════════════════
// 📊 Floating Cards
// ═══════════════════════════════════════════════════════════

export const cardFloat = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 1.4 + delay,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
});

export const cardFloatLoop = (duration = 5) => ({
  y: [0, -8, 0],
  transition: {
    duration,
    repeat: Infinity,
    ease: 'easeInOut',
  },
});

// ═══════════════════════════════════════════════════════════
// 📜 Scroll Animations (Sections)
// ═══════════════════════════════════════════════════════════

export const scrollFadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const scrollStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};