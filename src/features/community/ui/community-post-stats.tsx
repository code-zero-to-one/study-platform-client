'use client';

import { Eye, ThumbsUp } from 'lucide-react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

const compactCountFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  notation: 'compact',
});

const formatCompactCount = (count: number) =>
  compactCountFormatter.format(count).replace('K', 'k');

interface CommunityPostStatsProps {
  reactionCount: number;
  viewCount: number;
  className?: string;
}

export default function CommunityPostStats({
  reactionCount,
  viewCount,
  className,
}: CommunityPostStatsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-150 font-designer-13r text-text-subtle',
        className,
      )}
    >
      <span className="flex items-center gap-50">
        <Eye className="h-16 w-16" />
        {formatCompactCount(viewCount)}
      </span>
      <span className="flex items-center gap-50">
        <ThumbsUp className="h-16 w-16" />
        {formatCompactCount(reactionCount)}
      </span>
    </div>
  );
}
