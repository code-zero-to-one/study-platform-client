'use client';

import ProfileInfoEditModal from './profileinfo-edit-modal';
import ProfileInfoCard from '../../widgets/my-page/profileinfo-card';
import { useGetProfile } from '@/hooks/profile';
import { useGetSelectedTechStackDisplays } from '@/hooks/tech-stacks';

export default function ProfileInfo() {
  const { data: profile } = useGetProfile({ memberId: '10000' });
  const techStackNames = useGetSelectedTechStackDisplays({ memberId: '10000' });

  return (
    <div className="flex flex-col items-start gap-[40px] border-t-[1px] border-[var(--color-border-subtle)] pt-[16px]">
      {/* 내정보 */}
      <div className="flex w-full items-center gap-[12px]">
        <div className="text-[18px] font-[700]">내정보</div>
        <ProfileInfoEditModal />
      </div>

      {/* 세부 설명 */}
      <div className="flex flex-col gap-[32px]">
        <ProfileInfoCard
          title="자기소개"
          content={profile?.memberInfo.selfIntroduction}
        />

        <ProfileInfoCard
          title="공부 주제 및 계획"
          content={profile?.memberInfo.studyPlan}
        />

        <ProfileInfoCard
          title="선호하는 스터디 주제"
          content={profile?.memberInfo.preferredStudySubjectId}
        />

        <ProfileInfoCard
          title="가능 시간대"
          content={profile?.memberInfo.availableStudyTimes
            .map((availableStudyTime) => availableStudyTime.fullLabel)
            .join(', ')}
        />

        <ProfileInfoCard
          title="기술 스택"
          content={techStackNames?.join(', ')}
        />
      </div>
    </div>
  );
}
