import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';

interface AdminCardProps {
  children: ReactNode;
  className?: string;
}

export function AdminCard({ children, className }: AdminCardProps) {
  return (
    <Card
      className={cn(
        'bg-white dark:bg-[#16161D] border border-slate-200 dark:border-[#27272A] shadow-sm transition-colors',
        className
      )}
    >
      {children}
    </Card>
  );
}

export function AdminCardContent({ children, className }: AdminCardProps) {
  return <CardContent className={cn('p-4', className)}>{children}</CardContent>;
}