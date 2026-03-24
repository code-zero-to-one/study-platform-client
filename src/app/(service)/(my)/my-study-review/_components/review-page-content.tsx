'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';

import KeywordReview from '@/components/common/cards/keyword-review';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/common/ui/avatar';
import type { MyReviewItem } from '@/types/api/review.types';
import { formatDateDot, formatKoreaRelativeTime } from '@/utils/time';
import { useExpandableContent } from './use-expandable-content';

const MoreKeywordReviewModal = dynamic(
  () => import('@/components/common/modals/more-keyword-review-modal'),
  { ssr: false },
);

export interface ReviewKeyword {
  id: number;
  content: string;
  count: number;
}

interface ReviewPageContentProps {
  positiveKeywords: ReviewKeyword[];
  negativeKeywords: ReviewKeyword[];
  allPositiveKeywords: ReviewKeyword[];
  allNegativeKeywords: ReviewKeyword[];
  totalKeywordsCount: number;
  myReviews: MyReviewItem[];
  totalReviewsCount: number;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  keywordEmptyMessage?: string;
  reviewEmptyMessage?: string;
}

interface KeywordCardProps {
  title: string;
  keywords: ReviewKeyword[];
  allKeywords: ReviewKeyword[];
  emptyMessage?: string;
}

function KeywordCard({
  title,
  keywords,
  allKeywords,
  emptyMessage,
}: KeywordCardProps) {
  return (
    <div className="rounded-100 border-border-subtle min-h-280 border p-200">
      <div className="mb-200 flex justify-between">
        <h3 className="font-designer-16b text-text-default">{title}</h3>
        <MoreKeywordReviewModal title={title} keywords={allKeywords} />
      </div>
      <ul className="flex flex-col gap-50">
        {keywords.length > 0 ? (
          keywords.map((keyword) => (
            <KeywordReview
              key={keyword.id}
              content={keyword.content}
              count={keyword.count}
            />
          ))
        ) : (
          <li className="font-designer-14r text-text-subtle text-center">
            {emptyMessage ?? '아직 받은 평가가 없습니다.'}
          </li>
        )}
      </ul>
    </div>
  );
}

export default function ReviewPageContent({
  positiveKeywords,
  negativeKeywords,
  allPositiveKeywords,
  allNegativeKeywords,
  totalKeywordsCount,
  myReviews,
  totalReviewsCount,
  hasNextPage,
  fetchNextPage,
  keywordEmptyMessage,
  reviewEmptyMessage,
}: ReviewPageContentProps) {
  return (
    <>
      <section className="mt-300">
        <div className="mb-200">
          <div className="flex items-center gap-100">
            <div className="font-designer-20b text-text-default">받은 평가</div>
            <div className="font-designer-20b text-text-default">
              {totalKeywordsCount}
            </div>
          </div>

          <span className="font-designer-14r text-text-subtle">
            개선이 필요한 점은 스터디장에게만 보여요
          </span>
        </div>

        <div className="mb-400 grid grid-cols-2 gap-300">
          <KeywordCard
            title="좋았던 점"
            keywords={positiveKeywords}
            allKeywords={allPositiveKeywords}
            emptyMessage={keywordEmptyMessage}
          />
          <KeywordCard
            title="개선이 필요한 점"
            keywords={negativeKeywords}
            allKeywords={allNegativeKeywords}
            emptyMessage={keywordEmptyMessage}
          />
        </div>
      </section>

      <section>
        <div className="flex items-center gap-100">
          <div className="font-designer-20b text-text-default">후기</div>
          <div className="font-designer-20b text-text-default">
            {totalReviewsCount}
          </div>
        </div>

        <span className="font-designer-14r text-text-subtle">
          수집된 스터디 후기는 서비스 홍보 및 마케팅을 위해 활용될 수 있습니다.
        </span>

        {myReviews.length === 0 ? (
          <div className="text-text-subtle font-designer-14r flex h-200 items-center justify-center text-center">
            {reviewEmptyMessage ?? '아직까지 받은 후기가 없습니다.'}
          </div>
        ) : (
          <ul>
            {myReviews.map((review) => (
              <Review key={review.id} data={review} />
            ))}
          </ul>
        )}

        {hasNextPage && (
          <button
            type="button"
            className="font-designer-14m text-text-subtle hover:bg-background-accent-gray-default rounded-50 flex w-full cursor-pointer items-center justify-center py-200"
            onClick={fetchNextPage}
          >
            <span>더보기</span>
            <Image
              src="/icons/arrow-down.svg"
              width={20}
              height={20}
              alt="후기 더보기"
            />
          </button>
        )}
      </section>
    </>
  );
}

function Review({ data }: { data: MyReviewItem }) {
  const { contentRef, expanded, setExpanded, showButton } =
    useExpandableContent(data.content);

  return (
    <li className="border-b-border-subtle flex flex-col gap-150 border-b py-250">
      <div className="flex items-center gap-150">
        <UserAvatar
          size={32}
          image={data.writer.profileImageUrl}
          alt={`${data.writer.memberName} 프로필 이미지`}
        />

        <div>
          <span className="font-designer-14b text-text-default mr-50">
            {data.writer.memberName}
          </span>
          <span className="font-designer-14r text-text-subtle mr-50">·</span>
          <span className="font-designer-14r text-text-subtle">
            {formatKoreaRelativeTime(data.reviewedAt)}
          </span>
        </div>
      </div>

      <div>
        <p
          ref={contentRef}
          className={cn(
            'font-designer-15r text-text-default',
            expanded ? 'line-clamp-none' : 'line-clamp-3',
          )}
        >
          {data.content}
        </p>

        {showButton && (
          <button
            type="button"
            className="font-designer-14r text-text-subtlest cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '접기' : '더보기'}
          </button>
        )}
      </div>

      <div>
        <div className="text-text-subtle">
          <span className="font-designer-14b mr-100">스터디 기간</span>
          <span className="font-designer-13r">
            {formatDateDot(data.startDate)} ~ {formatDateDot(data.endDate)}
          </span>
        </div>
        <div className="text-text-subtle">
          <span className="font-designer-14b mr-100">스터디 주제</span>
          <span className="font-designer-13r">
            {data.studySubjects.filter(Boolean).join(', ')}
          </span>
        </div>
      </div>
    </li>
  );
}
