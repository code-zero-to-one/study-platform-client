'use client';

import * as React from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface StatItemProps {
  icon: React.ReactNode;
  value: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  iconClassName?: string;
  valueClassName?: string;
  hoverClassName?: string;
}

export default function StatItem({
  icon,
  value,
  onClick,
  className,
  iconClassName,
  valueClassName,
  hoverClassName,
}: StatItemProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex items-center justify-center gap-25 rounded-full p-1 tabular-nums transition-transform',
          hoverClassName,
          className,
        )}
      >
        <span className={cn('flex items-center', iconClassName)}>{icon}</span>
        <span className={cn(valueClassName)}>{value}</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-25 tabular-nums',
        className,
      )}
    >
      <span className={cn('flex items-center', iconClassName)}>{icon}</span>
      <span className={cn(valueClassName)}>{value}</span>
    </div>
  );
}
