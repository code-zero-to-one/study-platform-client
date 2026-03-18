'use client';

import { useQueries } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { axiosInstance } from '@/api/client/axios';
import {
  groupStudyReviewQueryKeys,
  useGetGroupStudyReviews,
  type GroupStudyExperienceReviewDetail,
} from '@/hooks/queries/group-study-review-api';
import EvaluationSection from './_components/evaluation-section';
import GroupReviewCard from './_components/group-review-card';
import SatisfactionSection from './_components/satisfaction-section';

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

  const detailQueries = useQueries({
    queries: reviews.map((review) => ({
      queryKey: groupStudyReviewQueryKeys.detail(review.reviewId!),
      queryFn: async () => {
        const { data } = await axiosInstance.get<{
          content: GroupStudyExperienceReviewDetail;
        }>(`/group-studies/reviews/${review.reviewId}`);

        return data.content;
      },
      enabled: !!review.reviewId,
      staleTime: 60_000,
    })),
  });

  const reviewDetails = detailQueries
    .map((q) => q.data)
    .filter((d): d is GroupStudyExperienceReviewDetail => !!d);

  const goodCount = reviews.filter((r) => r.satisfaction === 'GOOD').length;
  const disappointedCount = reviews.filter(
    (r) => r.satisfaction === 'DISAPPOINTED',
  ).length;
  const totalCount = reviews.length;
  const ratings = reviews.filter((r) => r.rating).map((r) => r.rating!);
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

  const goodItemsMap = new Map<
    number,
    { id: number; label: string; count: number }
  >();
  const disappointedItemsMap = new Map<
    number,
    { id: number; label: string; count: number }
  >();

  reviewDetails.forEach((detail) => {
    detail.selectableReviewItems?.forEach((item) => {
      if (!item.id) return;
      const map =
        item.satisfactionType === 'GOOD' ? goodItemsMap : disappointedItemsMap;
      const entry = map.get(item.id);
      if (entry) entry.count++;
      else map.set(item.id, { id: item.id, label: item.label ?? '', count: 1 });
    });
  });

  const statistics =
    totalCount > 0
      ? {
          goodCount,
          disappointedCount,
          totalCount,
          averageRating,
          goodItems: [...goodItemsMap.values()].sort(
            (a, b) => b.count - a.count,
          ),
          disappointedItems: [...disappointedItemsMap.values()].sort(
            (a, b) => b.count - a.count,
          ),
        }
      : null;

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

        <h1 className="font-designer-20b text-text-default">{title}</h1>
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
          <div className="font-designer-14r text-text-subtle flex h-[200px] items-center justify-center text-center">
            아직 작성된 후기가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
