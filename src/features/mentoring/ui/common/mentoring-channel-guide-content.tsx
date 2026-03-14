'use client';

import { SquareArrowOutUpRight } from 'lucide-react';
import Button from '@/components/common/ui/button';

interface MentoringChannelGuideContentProps {
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export default function MentoringChannelGuideContent({
  description,
  actionHref,
  actionLabel,
}: MentoringChannelGuideContentProps) {
  return (
    <div className="flex flex-col items-start gap-100">
      <p className="font-designer-14r text-text-default leading-relaxed whitespace-pre-line">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Button asChild color="outlined" size="small">
          <a href={actionHref} target="_blank" rel="noreferrer">
            <span className="inline-flex items-center gap-50">
              {actionLabel}
              <SquareArrowOutUpRight className="h-14 w-14" />
            </span>
          </a>
        </Button>
      ) : null}
    </div>
  );
}
