'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import UserAvatar from '@/components/common/ui/avatar';
import AvatarStack from '@/components/common/ui/avatar-stack';
import type { AvatarStackMember } from '@/components/common/ui/avatar-stack';
import Button from '@/components/common/ui/button';
import CurriculumSummarySection from '@/components/group-study/section/curriculum-summary-section';
import { useApplicantsByStatusQuery } from '@/hooks/queries/group-study/use-applicant-query';
import { useIsLeader } from '@/stores/useLeaderStore';
import { useUserStore } from '@/stores/useUserStore';

import type { GroupStudyFullResponse } from '@/types/api/group-study.types';
import { MARKDOWN_DESCRIPTION_CLASS } from '@/components/common/ui/editor/markdown-utils';
import SummaryStudyInfo from '@/components/group-study/summary/study-info-summary';

const UserProfileModal = dynamic(
  () => import('@/components/common/modals/user-profile-modal'),
  { ssr: false },
);

const MarkdownContent = dynamic(
  () => import('@/components/common/ui/editor/markdown-content'),
  { ssr: false },
);

function getApplicantsList<T>(pages: { content: T[] }[] | undefined) {
  if (!pages) return [];

  return pages.reduce<T[]>((acc, page) => [...acc, ...page.content], []);
}

interface PremiumStudyInfoSectionProps {
  study: GroupStudyFullResponse;
  isMember?: boolean;
}

export default function PremiumStudyInfoSection({
  study: studyDetail,
  isMember,
}: PremiumStudyInfoSectionProps) {
  const router = useRouter();
  const params = useParams();
  const memberId = useUserStore((state) => state.memberId);
  const isLeader = useIsLeader(memberId);

  const groupStudyId = Number(params.id);

  const { data: approvedApplicants } = useApplicantsByStatusQuery({
    groupStudyId,
    status: 'APPROVED',
  });

  const applicantsList = getApplicantsList(approvedApplicants?.pages);

  const { data: pendingApplicants } = useApplicantsByStatusQuery({
    groupStudyId,
    status: 'PENDING',
  });
  const pendingCount = pendingApplicants?.pages[0]?.totalElements ?? 0;

  const avatarMembers = useMemo<AvatarStackMember[]>(() => {
    const isNotLeader = [...applicantsList].filter(
      (data) => data.role !== 'LEADER',
    );

    const sortedNotLeader = isNotLeader.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    return sortedNotLeader.map(({ applicantInfo }) => ({
      memberId: applicantInfo.memberId,
      nickname: applicantInfo.memberNickname || '익명',
      profileImageUrl:
        applicantInfo.profileImage?.resizedImages[0]?.resizedImageUrl ?? '',
      isLeader: false,
    }));
  }, [applicantsList]);

  return (
    <div className="mt-500 flex w-full max-w-study-content flex-col gap-600 px-400 lg:flex-row">
      <div className="flex flex-1 flex-col gap-500">
        <div className="relative h-[220px] w-full lg:h-[430px]">
          <Image
            src={
              studyDetail?.detailInfo.image?.resizedImages[0].resizedImageUrl ??
              ''
            }
            alt="썸네일"
            fill
            className="object-contain"
          />
        </div>

        <div className="flex flex-col gap-600">
          <div className="flex flex-col gap-200">
            <p className="font-designer-20b">스터디 소개</p>
            <div className="bg-background-alternative rounded-100 flex items-center justify-between px-200 py-300">
              <div className="flex items-center gap-150">
                <UserAvatar
                  size={80}
                  image={
                    studyDetail.basicInfo.leader.profileImage?.resizedImages[0]
                      .resizedImageUrl ?? ''
                  }
                />
                <div className="flex flex-col">
                  <div className="flex flex-col items-start gap-50">
                    <span className="font-designer-20b">
                      {studyDetail.basicInfo.leader.memberNickname}
                    </span>
                    <div className="font-designer-15r text-text-subtle flex items-center gap-100">
                      <span>스터디 멘토</span>
                      <span className="h-100 w-px bg-border-subtle" />
                      <span>
                        {studyDetail.basicInfo.leader.simpleIntroduction}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <UserProfileModal
                memberId={studyDetail.basicInfo.leader.memberId}
                trigger={
                  <div className="bg-fill-neutral-default-default text-text-default font-designer-14b rounded-75 flex cursor-pointer items-center justify-center p-100">
                    프로필
                  </div>
                }
              />
            </div>
            <MarkdownContent
              content={studyDetail?.detailInfo.description}
              className={MARKDOWN_DESCRIPTION_CLASS}
            />
          </div>

          <div className="flex flex-col gap-200">
            <div className="flex items-center justify-between">
              <div className="font-designer-20b flex gap-100">
                <span>멘티 목록</span>
                <span className="text-text-subtlest">{`${avatarMembers.length}명`}</span>
              </div>
              {isLeader && (
                <div className="relative">
                  <Button
                    className="h-500 w-[80px] text-[16px] font-bold"
                    onClick={() =>
                      router.push(`/application-list/${groupStudyId}`)
                    }
                  >
                    관리하기
                  </Button>
                  {pendingCount > 0 && (
                    <span className="absolute -right-[6px] -top-[6px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-[3px] text-[11px] font-bold text-text-inverse">
                      {pendingCount}
                    </span>
                  )}
                </div>
              )}
            </div>

            <AvatarStack
              members={avatarMembers}
              guideText="프로필을 클릭하여 멘티들의 정보를 확인해보세요."
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-400">
        <SummaryStudyInfo data={studyDetail} />
        <CurriculumSummarySection
          curriculumSummary={studyDetail.curriculumSummary ?? []}
          canAccessAll={isMember || isLeader}
        />
      </div>
    </div>
  );
}
