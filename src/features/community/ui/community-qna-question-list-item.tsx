'use client';

import { CircleHelp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';
import { buildCommunityQuestionHref } from '@/features/community/model/community-route';
import { COMMUNITY_BOARD } from '@/types/community/domain';
import type { CommunityQnaQuestionSummary } from '@/types/community/qna-domain';
import { isCommunityCardNestedInteraction } from './community-card-navigation';
import CommunityFeedAuthorMeta from './community-feed-author-meta';
import CommunityFeedListItemShell from './community-feed-list-item-shell';
import { CommunityBoardBadge } from './community-meta-badge';
import {
  CommunityQnaQuestionAcceptedBadge,
  CommunityQnaQuestionStats,
} from './community-qna-question-meta';

interface CommunityQnaQuestionListItemProps {
  currentPage?: number;
  question: CommunityQnaQuestionSummary;
}

export default function CommunityQnaQuestionListItem({
  currentPage,
  question,
}: CommunityQnaQuestionListItemProps) {
  const router = useRouter();
  const detailHref = buildCommunityQuestionHref(question.id, currentPage);

  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    if (isCommunityCardNestedInteraction(event.target)) {
      return;
    }

    router.push(detailHref);
  };

  return (
    <CommunityFeedListItemShell
      className="hover-lift-neutral"
      content={
        <Link
          href={detailHref}
          aria-label={`${question.title} 상세 보기`}
          className="mt-100 block rounded-150 transition-opacity hover:opacity-80 sm:mt-75"
          suppressHydrationWarning={true}
        >
          <p className="truncate font-designer-18b text-text-strong">
            {question.title}
            <span className="ml-50 font-designer-16m text-text-brand">
              ({question.stats.answerCount})
            </span>
          </p>
          {question.excerpt ? (
            <p className="mt-75 line-clamp-2 font-designer-14r leading-250 text-text-subtle">
              {question.excerpt}
            </p>
          ) : null}
        </Link>
      }
      media={
        <Link
          href={detailHref}
          aria-label={`${question.title} 상세 보기`}
          className="block rounded-150 transition-opacity hover:opacity-80"
          suppressHydrationWarning={true}
        >
          {question.previewImage ? (
            <div className="overflow-hidden rounded-150 border border-border-default bg-background-default">
              <Image
                src={question.previewImage}
                alt={question.previewImageAlt ?? question.title}
                width={48}
                height={48}
                sizes="48px"
                className="h-600 w-600 object-cover"
              />
            </div>
          ) : (
            <div className="flex h-600 w-600 items-center justify-center rounded-150 border border-border-default bg-background-default">
              <CircleHelp className="h-225 w-225 text-text-brand" />
            </div>
          )}
        </Link>
      }
      mediaBadge={
        <CommunityBoardBadge board={COMMUNITY_BOARD.QNA} showIcon={false} />
      }
      meta={
        <CommunityFeedAuthorMeta
          authorImage={question.author.profileImageUrl ?? undefined}
          authorName={question.author.name}
          createdAt={question.createdAt}
          memberId={question.author.memberId}
          role={question.author.role}
          afterDate={<CommunityQnaQuestionAcceptedBadge question={question} />}
        />
      }
      onClick={handleCardClick}
      stats={
        <CommunityQnaQuestionStats
          question={question}
          className="shrink-0 sm:justify-end"
        />
      }
    />
  );
}
