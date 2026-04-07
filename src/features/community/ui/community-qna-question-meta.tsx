'use client';

import { CheckCircle2, Eye, MessageCircle } from 'lucide-react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Badge from '@/components/common/ui/badge';
import type { CommunityQnaQuestionSummary } from '@/types/community/qna-domain';

const COMMUNITY_QNA_ACCEPTED_LABEL = '채택 완료';
const compactCountFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  notation: 'compact',
});

const formatCompactCount = (count: number) =>
  compactCountFormatter.format(count).replace('K', 'k');

interface CommunityQnaQuestionBadgesProps {
  question: CommunityQnaQuestionSummary;
}

interface CommunityQnaQuestionStatsProps {
  className?: string;
  question: CommunityQnaQuestionSummary;
}

export function CommunityQnaQuestionAcceptedBadge({
  question,
}: CommunityQnaQuestionBadgesProps) {
  if (!question.accepted) {
    return null;
  }

  return (
    <Badge
      color="green"
      shape="round"
      leftIcon={<CheckCircle2 className="h-150 w-150" />}
      className="font-designer-12m"
    >
      {COMMUNITY_QNA_ACCEPTED_LABEL}
    </Badge>
  );
}

export function CommunityQnaQuestionStats({
  className,
  question,
}: CommunityQnaQuestionStatsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-150 font-designer-13r text-text-subtle',
        className,
      )}
    >
      <span className="flex items-center gap-50">
        <Eye className="h-200 w-200" />
        {formatCompactCount(question.stats.viewCount)}
      </span>
      <span className="flex items-center gap-50">
        <MessageCircle className="h-200 w-200" />
        {formatCompactCount(question.stats.answerCount)}
      </span>
    </div>
  );
}
