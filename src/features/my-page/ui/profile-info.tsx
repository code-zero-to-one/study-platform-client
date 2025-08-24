'use client';

import { MemberInfo } from '@/entities/user/api/types';
import ProfileInfoCard from '@/entities/user/ui/profile-info-card';
import ProfileInfoEditModal from '@/features/my-page/ui/profile-info-edit-modal';

interface ProfileInfoProps {
  memberId: number;
  memberInfo: MemberInfo;
}

export default function ProfileInfo({
  memberId,
  memberInfo,
}: ProfileInfoProps) {
  return (
    <div className="border-border-subtle flex flex-col items-start gap-[40px] border-t pt-200">
      <div className="flex w-full flex-col gap-200">
        <div className="flex w-full items-center gap-150">
          <div className="font-designer-20b">내 정보</div>
          <ProfileInfoEditModal memberId={memberId} memberInfo={memberInfo} />
        </div>

        <ProfileInfoCard
          title="자기소개"
          content={memberInfo.selfIntroduction}
        />

        <ProfileInfoCard
          title="공부 주제 및 계획"
          content={memberInfo.studyPlan}
        />

        <ProfileInfoCard
          title="선호하는 스터디 주제"
          content={memberInfo.preferredStudySubject?.name}
        />

        <ProfileInfoCard
          title="가능 시간대"
          content={
            memberInfo.availableStudyTimes &&
            memberInfo.availableStudyTimes.length > 0
              ? memberInfo.availableStudyTimes
                  .map((time) => time.fullLabel)
                  .join(', ')
              : '선택안함'
          }
        />

        <ProfileInfoCard
          title="기술 스택"
          content={
            memberInfo.techStacks && memberInfo.techStacks.length > 0
              ? memberInfo.techStacks
                  .map((tech) => tech.techStackName)
                  .join(', ')
              : '선택안함'
          }
        />
      </div>
    </div>
  );
}
