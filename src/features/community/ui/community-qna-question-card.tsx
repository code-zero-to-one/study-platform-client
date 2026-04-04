'use client';

import { CircleHelp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';
import Avatar from '@/components/common/ui/avatar';
import { buildCommunityQuestionHref } from '@/features/community/model/community-route';
import { COMMUNITY_BOARD } from '@/types/community/domain';
import type { CommunityQnaQuestionSummary } from '@/types/community/qna-domain';
import CommunityAuthorNameTrigger from './community-author-name-trigger';
import { isCommunityCardNestedInteraction } from './community-card-navigation';
import {
  CommunityBoardBadge,
  CommunityMemberRoleBadge,
} from './community-meta-badge';
import {
  CommunityQnaQuestionAcceptedBadge,
  CommunityQnaQuestionStats,
} from './community-qna-question-meta';

interface CommunityQnaQuestionCardProps {
  currentPage?: number;
  question: CommunityQnaQuestionSummary;
}

export default function CommunityQnaQuestionCard({
  currentPage,
  question,
}: CommunityQnaQuestionCardProps) {
  const router = useRouter();
  const detailHref = buildCommunityQuestionHref(question.id, currentPage);

  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    if (isCommunityCardNestedInteraction(event.target)) {
      return;
    }

    router.push(detailHref);
  };

  return (
    <article
      className="flex h-full cursor-pointer flex-col rounded-200 border border-border-default bg-background-default p-250"
      onClick={handleCardClick}
    >
      <div className="mb-200 inline-flex flex-col items-center gap-100">
        <CommunityBoardBadge board={COMMUNITY_BOARD.QNA} showIcon={false} />
        <Link
          href={detailHref}
          aria-label={`${question.title} 상세 보기`}
          className="block rounded-150 transition-opacity hover:opacity-80"
          suppressHydrationWarning={true}
        >
          <div className="flex h-600 w-600 items-center justify-center rounded-150 border border-border-default bg-background-default">
            <CircleHelp className="h-225 w-225 text-text-brand" />
          </div>
        </Link>
      </div>

      <div className="flex items-start justify-between gap-200">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-100">
            <span className="flex items-center gap-75">
              <Avatar
                image={question.author.profileImageUrl}
                alt={question.author.name}
                size={20}
              />
              <CommunityAuthorNameTrigger
                memberId={question.author.memberId}
                name={question.author.name}
                className="font-designer-13r text-text-default"
              />
            </span>
            <CommunityMemberRoleBadge role={question.author.role} />
            <span className="font-designer-13r text-text-subtlest">
              {question.createdAt}
            </span>
            <CommunityQnaQuestionAcceptedBadge question={question} />
          </div>

          <Link
            href={detailHref}
            aria-label={`${question.title} 상세 보기`}
            className="mt-150 block rounded-150 transition-opacity hover:opacity-80"
            suppressHydrationWarning={true}
          >
            <p className="line-clamp-2 font-designer-20b text-text-strong">
              {question.title}
              <span className="ml-50 font-designer-16m text-text-brand">
                ({question.stats.questionCommentCount})
              </span>
            </p>
            {question.excerpt ? (
              <p className="mt-150 line-clamp-2 font-designer-14r leading-250 text-text-subtle">
                {question.excerpt}
              </p>
            ) : null}
          </Link>
        </div>

        <div className="flex shrink-0 items-start">
          <CommunityQnaQuestionStats question={question} className="shrink-0" />
        </div>
      </div>
    </article>
  );
}
