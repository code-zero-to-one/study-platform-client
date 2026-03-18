'use client';

import { useParams } from 'next/navigation';
import StudyReviewDetail from '@/components/my-page/study-review/study-review-detail';
import { MOCK_PREMIUM_REVIEW_DETAIL } from '@/mocks/study-review-mock-data';

export default function PremiumStudyReviewDetailPage() {
  const params = useParams();
  const studyId = Number(params.id);
  const data = MOCK_PREMIUM_REVIEW_DETAIL[studyId];

  if (!data) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="font-designer-16r text-text-subtle">
          해당 스터디의 후기를 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <StudyReviewDetail
      data={data}
      backLabel="멘토 스터디 목록"
      backHref="/my-study-review?tab=mentor"
    />
  );
}
