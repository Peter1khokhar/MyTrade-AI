'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  length?: number;
}

export function OTPInput({
  value,
  onChange,
  disabled = false,
  length = 6,
}: OTPInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Auto-focus first input
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, digit: string) => {
    // Only numbers
    if (digit && !/^\d$/.test(digit)) return;

    const newValue = [...value];
    newValue[index] = digit;
    onChange(newValue);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Backspace: clear current, then go previous
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        const newValue = [...value];
        newValue[index - 1] = '';
        onChange(newValue);
        inputs.current[index - 1]?.focus();
      } else {
        const newValue = [...value];
        newValue[index] = '';
        onChange(newValue);
      }
      e.preventDefault();
    }

    // Left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      inputs.current[index - 1]?.focus();
    }

    // Right arrow
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newValue = [...value];
    for (let i = 0; i < pastedData.length && i < length; i++) {
      newValue[i] = pastedData[i];
    }
    onChange(newValue);

    // Focus last filled input or last
    const focusIndex = Math.min(pastedData.length, length - 1);
    inputs.current[focusIndex]?.focus();
  };

  const handleFocus = (index: number) => {
    // Select content on focus
    inputs.current[index]?.select();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={cn(
            'w-12 h-14 lg:w-14 lg:h-16',
            'text-center text-2xl lg:text-3xl font-bold font-mono',
            'bg-white dark:bg-slate-800',
            'text-slate-900 dark:text-white',
            'border-2 rounded-xl',
            'border-slate-200 dark:border-slate-700',
            'focus:border-blue-500 dark:focus:border-blue-400',
            'focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950',
            'outline-none transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            value[index] && 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30'
          )}
        />
      ))}
    </div>
  );
}