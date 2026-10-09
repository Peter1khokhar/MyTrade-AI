'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { forwardRef } from 'react';

interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
        className="inline-block"
      >
        <Button ref={ref} {...(props as any)}>
          {children}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';