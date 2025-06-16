'use client';

import { MemberInfo } from '@/entities/user/api/types';
import ProfileInfoEditModal from '@/features/my-page/ui/profileinfo-edit-modal';
import ProfileInfoCard from '@/widgets/my-page/profileinfo-card';
import { UpdateUserProfileInfoRequest } from '../api/types';
import { useUpdateUserProfileInfoMutation } from '../model/use-update-user-profile-mutation';

interface ProfileInfoProps {
  memberId: number;
  memberInfo: MemberInfo;
}

export default function ProfileInfo({ memberId, memberInfo }: ProfileInfoProps) {

  const { mutate } = useUpdateUserProfileInfoMutation(memberId);

  const handleSubmit = (formData: UpdateUserProfileInfoRequest) => {
    mutate(formData);
  };

  return (
    <div className="flex flex-col items-start gap-[40px] border-t border-border-subtle pt-200">
      <div className="flex flex-col gap-200 w-full">
        <div className="flex w-full items-center gap-150">
          <div className="font-designer-20b">내정보</div>
          <ProfileInfoEditModal memberInfo={memberInfo} onSubmit={handleSubmit} />
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
          content={memberInfo.availableStudyTimes && memberInfo.availableStudyTimes.length > 0
            ? memberInfo.availableStudyTimes.map(time => time.fullLabel).join(', ')
            : '선택안함'}
        />

        <ProfileInfoCard
          title="기술 스택"
          content={memberInfo.techStacks && memberInfo.techStacks.length > 0
            ? memberInfo.techStacks.map(tech => tech.techStackName).join(', ')
            : '선택안함'}
        />
      </div>
    </div>
  );
}
