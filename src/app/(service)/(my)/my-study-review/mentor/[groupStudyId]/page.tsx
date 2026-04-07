'use client';

import { useQueries } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  groupStudyReviewDetailQueryOptions,
  useGetGroupStudyReviews,
  type GroupStudyExperienceReviewDetail,
} from '@/hooks/queries/group-study-review-api';
import { useGroupStudyDetailQuery } from '@/hooks/queries/use-study-query';
import EvaluationSection from '../../group/[groupStudyId]/_components/evaluation-section';
import GroupReviewCard from '../../group/[groupStudyId]/_components/group-review-card';
import SatisfactionSection from '../../group/[groupStudyId]/_components/satisfaction-section';
import { useReviewStatistics } from '../../group/[groupStudyId]/_hooks/use-review-statistics';

export default function MentorStudyReviewDetailPage() {
  const { groupStudyId } = useParams<{ groupStudyId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const title = searchParams.get('title') ?? '스터디 후기';
  const studyTypeName = '멘토스터디';

  const { data: studyDetail } = useGroupStudyDetailQuery(Number(groupStudyId));

  const studyTitle = studyDetail?.detailInfo?.title ?? title;
  const startDate = studyDetail?.basicInfo?.startDate;
  const endDate = studyDetail?.basicInfo?.endDate;
  const studyPeriod =
    startDate && endDate ? `${startDate} ~ ${endDate}` : undefined;

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
      <button
        type="button"
        onClick={() => router.push('/my-study-review/mentor')}
        className="flex cursor-pointer items-center gap-50 self-start"
        aria-label="뒤로가기"
      >
        <ChevronLeft className="text-text-subtle" size={20} />
        <span className="font-designer-13r text-text-subtle">
          멘토 스터디 목록
        </span>
      </button>

      <div className="flex flex-col gap-75">
        <h1 className="font-designer-36b text-text-default">{studyTitle}</h1>
        {studyPeriod && (
          <span className="font-designer-14r text-text-subtlest">
            {studyPeriod}
          </span>
        )}
      </div>
      <SatisfactionSection statistics={statistics} />

      <EvaluationSection
        statistics={statistics}
        studyTypeName={studyTypeName}
      />

      <div className="flex flex-col gap-200">
        <div className="flex items-center gap-100">
          <h2 className="font-designer-20b text-text-default">후기</h2>
          <span className="font-designer-20b text-text-default">
            {totalElements}
          </span>
        </div>
        <span className="font-designer-14r text-text-subtle">
          수집된 스터디 후기는 서비스 홍보 및 마케팅을 위해 활용될 수 있습니다.
        </span>

        {reviews.length > 0 ? (
          <ul className="flex flex-col">
            {reviews.map((review, index) => (
              <GroupReviewCard key={review.reviewId ?? index} review={review} />
            ))}
          </ul>
        ) : (
          <div className="font-designer-14r text-text-subtle flex h-200 items-center justify-center text-center">
            아직 받은 {studyTypeName} 후기가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
