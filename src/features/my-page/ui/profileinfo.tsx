'use client';

import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/entities/user/api/get-user-profile';
import ProfileInfoEditModal from '@/features/my-page/ui/profileinfo-edit-modal';
import ProfileInfoCard from '@/widgets/my-page/profileinfo-card';

export default function ProfileInfo() {
  const memberId = 1;
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', memberId],
    queryFn: () => getUserProfile(memberId),
  });

  if (!userProfile) return null;

  return (
    <div className="flex flex-col items-start gap-[40px] border-t border-border-subtle pt-200">
      <div className="flex flex-col gap-200 w-full">
        <div className="flex w-full items-center gap-150">
          <div className="font-designer-20b">내정보</div>
          <ProfileInfoEditModal onSubmit={() => { }} />
        </div>

        <ProfileInfoCard
          title="자기소개"
          content={userProfile.memberInfo.selfIntroduction}
        />

        <ProfileInfoCard
          title="공부 주제 및 계획"
          content={userProfile.memberInfo.studyPlan}
        />

        <ProfileInfoCard
          title="선호하는 스터디 주제"
          content={userProfile.memberInfo.preferredStudySubject?.name}
        />

        <ProfileInfoCard
          title="가능 시간대"
          content={userProfile.memberInfo.availableStudyTimes && userProfile.memberInfo.availableStudyTimes.length > 0
            ? userProfile.memberInfo.availableStudyTimes.map(time => time.fullLabel).join(', ')
            : '선택안함'}
        />

        <ProfileInfoCard
          title="기술 스택"
          content={userProfile.memberInfo.techStacks && userProfile.memberInfo.techStacks.length > 0
            ? userProfile.memberInfo.techStacks.map(tech => tech.techStackName).join(', ')
            : '선택안함'}
        />
      </div>
    </div>
  );
}
