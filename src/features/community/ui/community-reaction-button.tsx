'use client';

import { Heart } from 'lucide-react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface CommunityReactionButtonProps {
  count: number;
  isActive: boolean;
  onClick: () => void;
  ariaLabel?: string;
  disabled?: boolean;
}

export default function CommunityReactionButton({
  count,
  isActive,
  onClick,
  ariaLabel,
  disabled = false,
}: CommunityReactionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      className={cn(
        'inline-flex items-center gap-75 font-designer-14m transition-colors focus-visible:ring-fill-brand-default-default focus-visible:ring-offset-background-default rounded-100 p-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:text-text-disabled',
        isActive
          ? 'text-text-brand'
          : 'text-text-subtle hover:text-text-default',
      )}
    >
      <Heart
        className={cn('h-200 w-200 shrink-0', isActive && 'fill-current')}
      />
      <span>{count.toLocaleString()}</span>
    </button>
  );
}
