import React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface RankingTabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export default function RankingTabButton({
  isActive,
  onClick,
  children,
}: RankingTabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'font-designer-14m rounded-100 flex items-center gap-50 px-200 py-100 whitespace-nowrap transition-all',
        isActive
          ? 'bg-fill-neutral-strong-default text-text-inverse shadow-1'
          : 'text-text-subtle hover:bg-fill-neutral-subtle-hover',
      )}
    >
      {children}
    </button>
  );
}
