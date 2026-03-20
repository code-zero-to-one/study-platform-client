'use client';

import { ChevronLeft } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAllMyReviewsQuery } from '@/hooks/queries/use-review-query';
import OneToOneReviewCard from './_components/one-to-one-review-card';
import EvaluationSection from '../../group/[groupStudyId]/_components/evaluation-section';
import SatisfactionSection from '../../group/[groupStudyId]/_components/satisfaction-section';

export default function OneToOneReviewDetailPage() {
  const { studySpaceId } = useParams<{ studySpaceId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const title = searchParams.get('title') ?? '1:1 스터디 후기';
  const studyTypeName = '1:1스터디';
  const startTime = searchParams.get('startTime');
  const endTime = searchParams.get('endTime');
  const studyPeriod =
    startTime && endTime ? `${startTime} ~ ${endTime}` : undefined;

  const { data: allReviews = [] } = useAllMyReviewsQuery();

  const reviews = allReviews.filter(
    (r) => r.studySpaceId === Number(studySpaceId),
  );

  const studyTitle =
    reviews.length > 0 ? `${reviews[0].writer.memberName}님과의 스터디` : title;

  return (
    <div className="flex flex-col gap-400">
      <button
        type="button"
        onClick={() => router.push('/my-study-review/one-to-one')}
        className="flex cursor-pointer items-center gap-50 self-start"
        aria-label="뒤로가기"
      >
        <ChevronLeft className="text-text-subtle" size={20} />
        <span className="font-designer-13r text-text-subtle">
          1:1 스터디 목록
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

      <SatisfactionSection
        emptyMessage={`아직 받은 ${studyTypeName} 만족도가 없습니다`}
      />

      <EvaluationSection studyTypeName={studyTypeName} />

      <div className="flex flex-col gap-200">
        <div className="flex items-center gap-100">
          <h2 className="font-designer-20b text-text-default">후기</h2>
          <span className="font-designer-20b text-text-default">
            {reviews.length}
          </span>
        </div>
        <span className="font-designer-14r text-text-subtle">
          모든 후기는 나에게만 보여요
        </span>

        {reviews.length > 0 ? (
          <ul className="flex flex-col">
            {reviews.map((review) => (
              <OneToOneReviewCard key={review.id} review={review} />
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
