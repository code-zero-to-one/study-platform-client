'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type MouseEvent } from 'react';
import { buildCommunityQuestionHref } from '@/features/community/model/community-route';
import {
  COMMUNITY_BOARD,
  type CommunityBoard,
  isCommunityBoard,
} from '@/types/community/domain';
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
  activeFilter?: string;
  currentPage?: number;
  question: CommunityQnaQuestionSummary;
}

const COMMUNITY_ALLOWED_IMAGE_HOSTS = new Set([
  'api.zeroone.it.kr',
  'blog.zeroone.it.kr',
  'img1.kakaocdn.net',
  'lh3.googleusercontent.com',
  'test-api.zeroone.it.kr',
  'test-blog.zeroone.it.kr',
  'www.zeroone.it.kr',
]);

const isAllowedCommunityPreviewImageSrc = (value?: string) => {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return false;
  }

  if (normalizedValue.startsWith('/')) {
    return true;
  }

  try {
    const imageUrl = new URL(normalizedValue);

    if (imageUrl.hostname === 'localhost') {
      if (imageUrl.port === '1337') {
        return imageUrl.pathname.startsWith('/uploads/');
      }

      return process.env.NODE_ENV !== 'production' && imageUrl.port === '8080';
    }

    if (
      imageUrl.protocol !== 'https:' ||
      !COMMUNITY_ALLOWED_IMAGE_HOSTS.has(imageUrl.hostname)
    ) {
      return false;
    }

    if (
      imageUrl.hostname === 'blog.zeroone.it.kr' ||
      imageUrl.hostname === 'test-blog.zeroone.it.kr'
    ) {
      return imageUrl.pathname.startsWith('/uploads/');
    }

    return true;
  } catch {
    return false;
  }
};

export default function CommunityQnaQuestionCard({
  activeFilter,
  currentPage,
  question,
}: CommunityQnaQuestionCardProps) {
  const router = useRouter();
  const [failedPreviewImageSrc, setFailedPreviewImageSrc] = useState<
    string | undefined
  >();
  const resolvedBoard: CommunityBoard | undefined =
    activeFilter && isCommunityBoard(activeFilter) ? activeFilter : undefined;
  const detailHref = buildCommunityQuestionHref(
    question.id,
    currentPage,
    resolvedBoard,
  );
  const previewImageSrc = isAllowedCommunityPreviewImageSrc(
    question.previewImage,
  )
    ? question.previewImage
    : undefined;
  const shouldShowPreviewImage =
    previewImageSrc && failedPreviewImageSrc !== previewImageSrc;

  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    if (isCommunityCardNestedInteraction(event.target)) {
      return;
    }

    router.push(detailHref);
  };

  return (
    /* biome-ignore lint/a11y/useKeyWithClickEvents: 카드 내부에 상세 링크와 액션이 함께 있어 기존 전체 클릭 패턴을 유지한다. */
    <article
      className="flex h-full cursor-pointer flex-col rounded-200 border border-border-default bg-background-default p-250"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between gap-200">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-100">
            <CommunityBoardBadge board={COMMUNITY_BOARD.QNA} showIcon={false} />
            <CommunityAuthorNameTrigger
              memberId={question.author.memberId}
              name={question.author.name}
              image={question.author.profileImageUrl}
              imageSize={20}
              className="font-designer-13r text-text-default"
            />
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
                ({question.stats.answerCount})
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

      {shouldShowPreviewImage ? (
        <Link
          href={detailHref}
          aria-label={`${question.title} 상세 보기`}
          className="mt-200 block overflow-hidden rounded-150 border border-border-default bg-background-alternative transition-opacity hover:opacity-80"
          suppressHydrationWarning={true}
        >
          <Image
            src={previewImageSrc}
            alt={question.previewImageAlt ?? question.title}
            width={1200}
            height={800}
            sizes="(max-width: 767px) 100vw, 50vw"
            className="h-auto w-full"
            onError={() => {
              setFailedPreviewImageSrc(previewImageSrc);
            }}
          />
        </Link>
      ) : null}
    </article>
  );
}
