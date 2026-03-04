import React from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface FilterPillButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export default function FilterPillButton({
  isActive,
  onClick,
  children,
  disabled = false,
  className,
}: FilterPillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-100 font-designer-13b px-300 py-150 transition-all',
        isActive
          ? 'bg-fill-brand-default-default text-text-inverse shadow-1'
          : 'border-border-subtle bg-background-default text-text-subtle hover:border-border-brand hover:text-text-brand border',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}
