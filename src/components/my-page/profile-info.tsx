'use client';

import dynamic from 'next/dynamic';
import ProfileInfoCard from '@/components/common/cards/profile-info-card';
import { MemberInfo } from '@/types/api/user.types';

const ProfileInfoEditModal = dynamic(
  () => import('@/components/common/modals/profile-info-edit-modal'),
  { ssr: false },
);

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
          <div className="font-designer-20b">내 스터디 정보</div>
          <ProfileInfoEditModal memberId={memberId} memberInfo={memberInfo} />
        </div>

        <ProfileInfoCard
          title="자기소개"
          content={memberInfo.selfIntroduction ?? '없음'}
        />

        <ProfileInfoCard
          title="공부 주제 및 계획"
          content={memberInfo.studyPlan ?? '없음'}
        />

        <ProfileInfoCard
          title="선호하는 스터디 주제"
          content={memberInfo.preferredStudySubject?.name ?? '없음'}
        />

        <ProfileInfoCard
          title="가능 시간대"
          content={
            memberInfo.availableStudyTimes &&
            memberInfo.availableStudyTimes.length > 0
              ? memberInfo.availableStudyTimes
                  .map((time) => time.fullLabel)
                  .join(', ')
              : '없음'
          }
        />

        {/* 기본정보로 이동 (SPRINT2 프로필개선) */}
        {/* <ProfileInfoCard
          title="기술 스택"
          content={
            memberInfo.techStacks && memberInfo.techStacks.length > 0
              ? memberInfo.techStacks
                  .map((tech) => tech.techStackName)
                  .join(', ')
              : '선택안함'
          } */}

        <ProfileInfoCard
          title="직무"
          content={
            memberInfo.jobs && memberInfo.jobs.length > 0
              ? memberInfo.jobs
                  .map((job) => job.description || job.job || '')
                  .filter(Boolean)
                  .join(', ')
              : '없음'
          }
        />
        <ProfileInfoCard
          title="경력"
          content={
            memberInfo.career
              ? memberInfo.career.description ||
                memberInfo.career.career ||
                '경력을 입력해주세요'
              : '없음'
          }
        />
        <ProfileInfoCard
          title="스터디 형태"
          content={
            memberInfo.studyFormatTypes &&
            memberInfo.studyFormatTypes.length > 0
              ? memberInfo.studyFormatTypes
                  .map(
                    (studyFormatType) =>
                      studyFormatType.description ||
                      studyFormatType.studyFormatType,
                  )
                  .join(', ')
              : '없음'
          }
        />
        <ProfileInfoCard
          title="스터디 목표"
          content={memberInfo.goal ? memberInfo.goal : '없음'}
        />
      </div>
    </div>
  );
}
