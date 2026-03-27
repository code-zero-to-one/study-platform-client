'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useRef } from 'react';
import { GroupStudyFullResponseDto } from '@/api/openapi';
import ApplyGroupStudyModal from '@/components/common/modals/apply-group-study-modal';
import UserAvatar from '@/components/common/ui/avatar';
import AvatarStack from '@/components/common/ui/avatar-stack';
import type { AvatarStackMember } from '@/components/common/ui/avatar-stack';
import Button from '@/components/common/ui/button';
import CurriculumSummarySection from '@/components/section/curriculum-summary-section';
import { useApplicantsByStatusQuery } from '@/hooks/queries/use-applicant-query';

import SummaryStudyInfo from '../summary/study-info-summary';

const UserProfileModal = dynamic(
  () => import('@/components/common/modals/user-profile-modal'),
  { ssr: false },
);

interface StudyInfoSectionProps {
  study: GroupStudyFullResponseDto;
  isLeader: boolean;
  isMember?: boolean;
}

export default function StudyInfoSection({
  study: studyDetail,
  isLeader,
  isMember,
}: StudyInfoSectionProps) {
  const router = useRouter();
  const params = useParams();

  const groupStudyId = Number(params.id);
  const applyTriggerRef = useRef<HTMLButtonElement>(null);

  const handleLockedClick = () => {
    applyTriggerRef.current?.click();
  };

  const { data: approvedApplicants } = useApplicantsByStatusQuery({
    groupStudyId,
    status: 'APPROVED',
  });
  const applicants = useMemo(
    () => approvedApplicants?.pages[0]?.content ?? [],
    [approvedApplicants?.pages],
  );

  const avatarMembers = useMemo<AvatarStackMember[]>(() => {
    if (!applicants.length) return [];

    const leader = applicants.find((applicant) => applicant.role === 'LEADER');
    const participants = applicants.filter(
      (applicant) => applicant.role !== 'LEADER',
    );

    const sortedParticipants = [...participants].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    const sortedApplicants = leader
      ? [leader, ...sortedParticipants]
      : sortedParticipants;

    return sortedApplicants.map((data) => ({
      memberId: data.applicantInfo.memberId,
      nickname: data.applicantInfo.memberNickname || '익명',
      profileImageUrl:
        data.applicantInfo.profileImage?.resizedImages[0]?.resizedImageUrl ??
        '',
      isLeader: data.role === 'LEADER',
    }));
  }, [applicants]);

  return (
    <div className="m-auto mt-500 flex w-full max-w-study-content flex-col gap-600 px-400 lg:flex-row">
      <div className="flex flex-1 flex-col gap-500">
        <div className="relative h-[220px] w-full lg:h-[430px]">
          <Image
            src={
              studyDetail?.detailInfo?.image?.resizedImages[0]
                .resizedImageUrl ?? ''
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
                      <span>스터디 리더</span>
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
            <div className="font-designer-16r whitespace-pre-line text-text-subtle">
              {studyDetail?.detailInfo.description}
            </div>
          </div>

          <div className="flex flex-col gap-200">
            <div className="flex items-center justify-between">
              <div className="font-designer-20b flex gap-100">
                <span>참가자 목록</span>
                <span className="text-text-subtlest">{`${approvedApplicants?.pages[0]?.totalElements ?? 0}명`}</span>
              </div>
              {isLeader && (
                <Button
                  className="h-500 w-[80px] font-designer-16b"
                  onClick={() =>
                    router.push(`/application-list/${groupStudyId}`)
                  }
                >
                  관리하기
                </Button>
              )}
            </div>

            <AvatarStack
              members={avatarMembers}
              guideText="프로필을 클릭하여 스터디원들의 정보를 확인해보세요."
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-400">
        <SummaryStudyInfo data={studyDetail} />
        <CurriculumSummarySection
          curriculumSummary={studyDetail.curriculumSummary ?? []}
          canAccessAll={isMember || isLeader}
          onLockedClick={handleLockedClick}
        />
        {!isMember && !isLeader && (
          <ApplyGroupStudyModal
            groupStudyId={groupStudyId}
            title={studyDetail.detailInfo?.title ?? ''}
            questions={studyDetail.interviewPost?.interviewPost ?? []}
            trigger={
              <button
                type="button"
                ref={applyTriggerRef}
                className="sr-only"
                aria-hidden
                tabIndex={-1}
              />
            }
          />
        )}
      </div>
    </div>
  );
}
