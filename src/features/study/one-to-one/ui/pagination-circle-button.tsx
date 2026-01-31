import React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface PaginationCircleButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function PaginationCircleButton({
  onClick,
  disabled,
  children,
  className,
}: PaginationCircleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'border-border-subtle hover:bg-fill-neutral-subtle-hover text-text-subtle flex h-[40px] w-[40px] items-center justify-center rounded-[9999px] border transition-colors disabled:opacity-50 disabled:hover:bg-transparent',
        className,
      )}
    >
      {children}
    </button>
  );
}
