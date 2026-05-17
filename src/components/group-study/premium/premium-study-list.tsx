'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import Image from 'next/image';

import { GroupStudyListItemDto } from '@/api/openapi';
import StudyCard from '@/components/home/card/study-card';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { hashValue } from '@/utils/hash';

interface PremiumStudyListProps {
  studies: GroupStudyListItemDto[];
}

export default function PremiumStudyList({ studies }: PremiumStudyListProps) {
  const { memberId, isAuthReady } = useAuthReady();

  const handleStudyClick = (study: GroupStudyListItemDto) => {
    sendGTMEvent({
      event: 'premium_study_detail_view',
      dl_timestamp: new Date().toISOString(),
      ...(isAuthReady &&
        memberId && {
          dl_member_id: hashValue(String(memberId)),
        }),
      dl_study_id: String(study.basicInfo?.groupStudyId),
      dl_study_title: study.simpleDetailInfo?.title,
    });
  };

  if (studies.length === 0) {
    return (
      <div className="bg-background-alternative rounded-100 flex h-[300px] flex-col items-center justify-center gap-300 sm:h-[640px]">
        <Image
          src="/icons/empty-study-case.svg"
          alt="현재 멘토 스터디가 없습니다."
          width={88}
          height={88}
        />
        <div className="flex flex-col items-center justify-center gap-100">
          <span className="text-text-subtle font-designer-20b">
            스터디가 아직 준비되지 않았습니다.
          </span>
          <span className="text-text-subtlest font-designer-16r">
            원하는 주제로 스터디를 개설해 첫 번째 참여자가 되어보세요.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-300 sm:grid-cols-2 lg:grid-cols-3">
      {studies.map((study) => (
        <StudyCard
          key={study.basicInfo?.groupStudyId}
          study={study}
          href={`/premium-study/${study.basicInfo?.groupStudyId}`}
          onClick={() => handleStudyClick(study)}
          viewCount={study.viewCount}
        />
      ))}
    </div>
  );
}
