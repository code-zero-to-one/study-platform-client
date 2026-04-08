'use client';

import {
  useMyNegativeKeywordsQuery,
  useMyReviewsInfinityQuery,
  useUserPositiveKeywordsQuery,
} from '@/hooks/queries/group-study/use-review-query';

import { buildEvaluationStatistics } from './_utils';
import CompletedStudyReviewPage from '@/components/group-study/review/completed-study-review-page';
import StudyReviewTabNav from '@/components/group-study/review/study-review-tab-nav';
import OneToOneReviewCard from './_components/one-to-one-review-card';
import EvaluationSection from '@/components/group-study/review/group/detail/evaluation-section';

export default function OneToOneReviewPage() {
  const { data: positiveData } = useUserPositiveKeywordsQuery({});
  const { data: negativeData } = useMyNegativeKeywordsQuery({});
  const {
    data: reviewData,
    fetchNextPage,
    hasNextPage,
  } = useMyReviewsInfinityQuery();

  const statistics = buildEvaluationStatistics(
    positiveData?.keywords ?? [],
    negativeData?.keywords ?? [],
  );

  const reviews = reviewData?.reviews ?? [];
  const totalCount = reviewData?.totalCount ?? 0;

  return (
    <div className="flex flex-col gap-400">
      <StudyReviewTabNav />

      <EvaluationSection statistics={statistics} />

      <section className="flex flex-col gap-200">
        <div className="flex items-center gap-100">
          <h2 className="font-designer-20b text-text-default">후기</h2>
          <span className="font-designer-20b text-text-default">
            {totalCount}
          </span>
        </div>
        <span className="font-designer-14r text-text-subtle">
          수집된 스터디 후기는 서비스 홍보 및 마케팅을 위해 활용될 수 있습니다.
        </span>

        {reviews.length > 0 ? (
          <ul className="flex flex-col">
            {reviews.map((review) => (
              <OneToOneReviewCard key={review.id} review={review} />
            ))}
          </ul>
        ) : (
          <div className="text-text-subtle font-designer-14r flex h-200 items-center justify-center text-center">
            아직까지 받은 후기가 없습니다.
          </div>
        )}

        {hasNextPage && (
          <button
            type="button"
            className="font-designer-14m text-text-subtle hover:bg-background-accent-gray-default rounded-50 flex w-full cursor-pointer items-center justify-center py-200"
            onClick={() => fetchNextPage()}
          >
            더보기
          </button>
        )}
      </section>

      <CompletedStudyReviewPage
        basePath="/my-study-review/one-to-one"
        studyType="ONE_ON_ONE_STUDY"
        studyTypeName="1:1스터디"
        hideTabNav
        hideEmptyMessage
      />
    </div>
  );
}
