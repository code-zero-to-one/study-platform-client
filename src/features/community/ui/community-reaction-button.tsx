'use client';

import { ThumbsUp } from 'lucide-react';
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
        'inline-flex items-center gap-75 font-designer-13m transition-colors focus-visible:ring-fill-brand-default-default focus-visible:ring-offset-background-default rounded-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:text-text-disabled',
        isActive
          ? 'text-text-brand'
          : 'text-text-subtle hover:text-text-default',
      )}
    >
      <span className="flex items-center">
        <ThumbsUp
          className={cn('h-16 w-16 shrink-0', isActive && 'fill-current')}
        />
      </span>
      <span>{count.toLocaleString()}</span>
    </button>
  );
}
