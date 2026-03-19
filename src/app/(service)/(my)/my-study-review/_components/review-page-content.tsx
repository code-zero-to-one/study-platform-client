'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import KeywordReview from '@/components/common/cards/keyword-review';
import UserAvatar from '@/components/common/ui/avatar';
import type { MyReviewItem } from '@/types/api/review.types';
import { formatKoreaRelativeTime } from '@/utils/time';
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
            개선이 필요한 점은 나에게만 보여요
          </span>
        </div>

        <div className="mb-400 grid grid-cols-2 gap-300">
          <div className="rounded-100 border-border-subtle min-h-280 border p-200">
            <div className="mb-200 flex justify-between">
              <h3 className="font-designer-16b text-text-default">좋았던 점</h3>
              <MoreKeywordReviewModal
                title="좋았던 점"
                keywords={allPositiveKeywords}
              />
            </div>

            <ul className="flex flex-col gap-50">
              {positiveKeywords.length > 0 ? (
                positiveKeywords.map((keyword) => (
                  <KeywordReview
                    key={keyword.id}
                    content={keyword.content}
                    count={keyword.count}
                  />
                ))
              ) : (
                <span className="font-designer-14r text-text-subtle text-center">
                  아직 받은 평가가 없습니다.
                </span>
              )}
            </ul>
          </div>

          <div className="rounded-100 border-border-subtle min-h-280 border p-200">
            <div className="mb-200 flex justify-between">
              <h3 className="font-designer-16b text-text-default">
                개선이 필요한 점
              </h3>
              <MoreKeywordReviewModal
                title="개선이 필요한 점"
                keywords={allNegativeKeywords}
              />
            </div>

            <ul className="flex flex-col gap-50">
              {negativeKeywords.length > 0 ? (
                negativeKeywords.map((keyword) => (
                  <KeywordReview
                    key={keyword.id}
                    content={keyword.content}
                    count={keyword.count}
                  />
                ))
              ) : (
                <span className="font-designer-14r text-text-subtle text-center">
                  아직 받은 평가가 없습니다.
                </span>
              )}
            </ul>
          </div>
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
          모든 후기는 나에게만 보여요
        </span>

        <ul>
          {myReviews.length > 0 ? (
            myReviews.map((review) => <Review key={review.id} data={review} />)
          ) : (
            <div className="font-designer-14r text-text-subtle flex h-200 items-center justify-center text-center">
              아직까지 받은 후기가 없습니다.
            </div>
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
        </ul>
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
            {data.startDate.replace(/-/g, '.')} ~{' '}
            {data.endDate.replace(/-/g, '.')}
          </span>
        </div>
        <div className="text-text-subtle">
          <span className="font-designer-14b mr-100">스터디 주제</span>
          <span className="font-designer-13r">
            {data.studySubjects.filter((subject) => subject).join(', ')}
          </span>
        </div>
      </div>
    </li>
  );
}
