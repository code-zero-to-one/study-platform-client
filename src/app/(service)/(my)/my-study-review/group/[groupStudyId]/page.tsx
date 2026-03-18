'use client';

import { useQueries } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  groupStudyReviewDetailQueryOptions,
  useGetGroupStudyReviews,
  type GroupStudyExperienceReviewDetail,
} from '@/hooks/queries/group-study-review-api';
import EvaluationSection from './_components/evaluation-section';
import GroupReviewCard from './_components/group-review-card';
import SatisfactionSection from './_components/satisfaction-section';
import { useReviewStatistics } from './_hooks/use-review-statistics';

export default function GroupStudyReviewDetailPage() {
  const { groupStudyId } = useParams<{ groupStudyId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const title = searchParams.get('title') ?? '스터디 후기';

  const { data: reviewsData } = useGetGroupStudyReviews({
    groupStudyId: Number(groupStudyId),
    page: 1,
    size: 100,
  });

  const reviews = reviewsData?.content ?? [];
  const totalElements = reviewsData?.totalElements ?? 0;

  const reviewIds = reviews
    .map((r) => r.reviewId)
    .filter((id): id is number => id !== undefined);

  const detailQueries = useQueries({
    queries: reviewIds.map(groupStudyReviewDetailQueryOptions),
  });

  const reviewDetails = detailQueries
    .map((q) => q.data)
    .filter((d): d is GroupStudyExperienceReviewDetail => !!d);

  const statistics = useReviewStatistics(reviews, reviewDetails);

  return (
    <div className="flex flex-col gap-400">
      <div className="flex flex-col gap-100">
        <button
          type="button"
          onClick={() => router.push('/my-study-review/group')}
          className="flex cursor-pointer items-center gap-50 self-start"
          aria-label="뒤로가기"
        >
          <ChevronLeft className="text-text-subtle" size={20} />
          <span className="font-designer-13r text-text-subtle">
            그룹 스터디 목록
          </span>
        </button>

        <h1 className="font-designer-36b text-text-default">{title}</h1>
      </div>

      {statistics && <SatisfactionSection statistics={statistics} />}

      {statistics && <EvaluationSection statistics={statistics} />}

      <div className="flex flex-col gap-100">
        <div className="flex flex-col gap-50">
          <span className="font-designer-16b text-text-default">
            후기 {totalElements}
          </span>
          <span className="font-designer-13r text-text-subtle">
            모든 후기는 나에게만 보여요
          </span>
        </div>

        {reviews.length > 0 ? (
          <ul>
            {reviews.map((review, index) => (
              <GroupReviewCard key={review.reviewId ?? index} review={review} />
            ))}
          </ul>
        ) : (
          <div className="font-designer-14r text-text-subtle flex h-200 items-center justify-center text-center">
            아직 작성된 후기가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
