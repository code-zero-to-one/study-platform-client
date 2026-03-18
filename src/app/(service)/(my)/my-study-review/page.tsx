'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import KeywordReview from '@/components/common/cards/keyword-review';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/common/ui/avatar';
import {
  useMyNegativeKeywordsQuery,
  useMyReviewsInfinityQuery,
  useUserPositiveKeywordsQuery,
} from '@/hooks/queries/use-review-query';
import { MyReviewItem } from '@/types/api/review.types';
import { formatKoreaRelativeTime } from '@/utils/time';

const MoreKeywordReviewModal = dynamic(
  () => import('@/components/common/modals/more-keyword-review-modal'),
  { ssr: false },
);

const GroupStudyReviewList = dynamic(
  () =>
    import(
      '@/components/my-page/study-review/group-study-review-list'
    ),
  { ssr: false },
);

const PremiumStudyReviewList = dynamic(
  () =>
    import(
      '@/components/my-page/study-review/premium-study-review-list'
    ),
  { ssr: false },
);

type ReviewTab = 'one-on-one' | 'group' | 'mentor';

const TABS: { key: ReviewTab; label: string }[] = [
  { key: 'one-on-one', label: '1:1 스터디' },
  { key: 'group', label: '그룹스터디' },
  { key: 'mentor', label: '멘토스터디' },
];

export default function MyStudyReview() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as ReviewTab | null;
  const [activeTab, setActiveTab] = useState<ReviewTab>(
    tabFromUrl && TABS.some((t) => t.key === tabFromUrl)
      ? tabFromUrl
      : 'one-on-one',
  );

  return (
    <>
      <h1 className="font-designer-24b text-text-strong mb-300">
        스터디 후기
      </h1>

      {/* 탭 네비게이션 */}
      <div className="mb-400 flex gap-0 border-b border-border-subtle">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'font-designer-15m px-200 py-150 cursor-pointer transition-colors',
              activeTab === tab.key
                ? 'border-b-2 border-text-strong text-text-strong font-designer-15b'
                : 'text-text-subtle hover:text-text-default',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'one-on-one' && <OneOnOneReviewContent />}
      {activeTab === 'group' && <GroupStudyReviewList />}
      {activeTab === 'mentor' && <PremiumStudyReviewList />}
    </>
  );
}

function OneOnOneReviewContent() {
  const { data: positiveKeywordsData } = useUserPositiveKeywordsQuery({
    pageSize: 5,
  });

  const { data: negativeKeywordsData } = useMyNegativeKeywordsQuery({
    pageSize: 5,
  });
  const {
    data: myReviewsData,
    fetchNextPage,
    hasNextPage,
  } = useMyReviewsInfinityQuery();

  const positiveKeywords = positiveKeywordsData?.keywords || [];
  const negativeKeywords = negativeKeywordsData?.keywords || [];

  const positiveKeywordsCount = positiveKeywordsData?.totalCount || 0;
  const negativeKeywordsCount = negativeKeywordsData?.totalCount || 0;

  const totalKeywordsCount = positiveKeywordsCount + negativeKeywordsCount;

  const myReviews = myReviewsData?.reviews || [];

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
          <div className="rounded-100 border-border-subtle min-h-[280px] border p-200">
            <div className="mb-200 flex justify-between">
              <h3 className="font-designer-16b text-text-default">좋았던 점</h3>

              <MorePositiveKeywordsModal />
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
                <span className="text-text-subtle font-designer-14r text-center">
                  아직 받은 평가가 없습니다.
                </span>
              )}
            </ul>
          </div>

          <div className="rounded-100 border-border-subtle min-h-[280px] border p-200">
            <div className="mb-200 flex justify-between">
              <h3 className="font-designer-16b text-text-default">
                개선이 필요한 점
              </h3>

              <MoreNegativeKeywordsModal />
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
                <span className="text-text-subtle font-designer-14r text-center">
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
            {myReviewsData?.totalCount || 0}
          </div>
        </div>

        <span className="font-designer-14r text-text-subtle">
          모든 후기는 나에게만 보여요
        </span>

        <ul>
          {myReviews.length > 0 ? (
            myReviews.map((review) => <Review key={review.id} data={review} />)
          ) : (
            <div className="text-text-subtle font-designer-14r flex h-[200px] items-center justify-center text-center">
              아직까지 받은 후기가 없습니다.
            </div>
          )}

          {hasNextPage && (
            <button
              className="font-designer-14m text-text-subtle hover:bg-background-accent-gray-default rounded-50 flex w-full cursor-pointer items-center justify-center py-200"
              onClick={() => fetchNextPage()}
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

function MorePositiveKeywordsModal() {
  const { data: allPositiveKeywordsData } = useUserPositiveKeywordsQuery({});

  const allPositiveKeywords = allPositiveKeywordsData?.keywords || [];

  return (
    <MoreKeywordReviewModal title="좋았던 점" keywords={allPositiveKeywords} />
  );
}

function MoreNegativeKeywordsModal() {
  const { data: allNegativeKeywordsData } = useMyNegativeKeywordsQuery({});

  const allNegativeKeywords = allNegativeKeywordsData?.keywords || [];

  return (
    <MoreKeywordReviewModal
      title="개선이 필요한 점"
      keywords={allNegativeKeywords}
    />
  );
}

function Review({ data }: { data: MyReviewItem }) {
  const [expanded, setExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const lineHeight = parseInt(
        window.getComputedStyle(contentRef.current).lineHeight,
        10,
      );
      const maxHeight = lineHeight * 3;
      setShowButton(contentRef.current.scrollHeight > maxHeight);
    }
  }, [data.content]);

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
          className={`text-text-default font-designer-15r ${
            expanded ? 'line-clamp-none' : 'line-clamp-3'
          }`}
        >
          {data.content}
        </p>

        {showButton && (
          <button
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
