'use client';

import { Dot, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/stores/use-toast-store';
import {
  MOCK_PREMIUM_STUDIES_FOR_REVIEW,
  type MockStudyForReviewList,
} from '@/mocks/study-review-mock-data';

export default function PremiumStudyReviewList() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  const handleCardClick = (study: MockStudyForReviewList) => {
    if (study.studyRole === 'LEADER') {
      router.push(`/my-study-review/premium/${study.studyId}`);
    } else {
      showToast('준비 중인 기능입니다.', 'info');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-300 sm:grid-cols-2 lg:grid-cols-3">
      {MOCK_PREMIUM_STUDIES_FOR_REVIEW.map((study) => (
        <StudyReviewCard
          key={study.studyId}
          study={study}
          onClick={() => handleCardClick(study)}
        />
      ))}
    </div>
  );
}

function StudyReviewCard({
  study,
  onClick,
}: {
  study: MockStudyForReviewList;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer flex-col gap-100 text-left"
    >
      <div className="relative w-full overflow-hidden rounded-100">
        <img
          src={study.thumbnail}
          alt={study.title}
          className="h-[160px] w-full object-cover"
        />
      </div>

      <div className="flex flex-col gap-50">
        <div className="font-designer-15b text-text-default line-clamp-1">
          {study.title}
        </div>

        <div className="text-text-subtle flex flex-row items-center gap-50">
          <span className="font-designer-14m">
            {study.studyRole === 'LEADER' ? '스터디 리더' : '스터디원'}
          </span>
          <div className="flex flex-row items-center">
            <Users size={14} />
            <Dot size={14} />
            <span className="font-designer-12m">
              {study.participantsCount} / {study.maxMembersCount}
            </span>
          </div>
        </div>

        <div className="font-designer-12m text-text-subtle">
          {study.startDate} ~ {study.endDate}
        </div>
      </div>
    </button>
  );
}
