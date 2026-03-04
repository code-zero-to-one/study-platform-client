'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { GroupStudyFullResponseDto } from '@/api/openapi';
import UserProfileModal from '@/components/common/modals/user-profile-modal';
import UserAvatar from '@/components/common/ui/avatar';
import AvatarStack from '@/components/common/ui/avatar-stack';
import type { AvatarStackMember } from '@/components/common/ui/avatar-stack';
import Button from '@/components/common/ui/button';
import StudyActiveTicker from '@/components/common/ui/study-active-ticker';
import CurriculumSummarySection from '@/components/section/curriculum-summary-section';
import { useApplicantsByStatusQuery } from '@/hooks/queries/use-applicant-qeury';
import { CurriculumSummaryItem } from '@/types/api/group-study.types';

import SummaryStudyInfo from '../summary/study-info-summary';

interface StudyInfoSectionProps {
  study: GroupStudyFullResponseDto;
  isLeader: boolean;
}

export default function StudyInfoSection({
  study: studyDetail,
  isLeader,
}: StudyInfoSectionProps) {
  const router = useRouter();
  const params = useParams();

  const groupStudyId = Number(params.id);

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
    <div className="m-auto mt-500 flex w-[1164px] gap-600">
      <div className="flex flex-1 flex-col gap-500">
        <div className="relative h-[430px] w-full">
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
                      <span className="h-100 w-px bg-[#E9EAEB]" />
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
            <div className="font-designer-16r whitespace-pre-line text-[#535862]">
              {studyDetail?.detailInfo.description}
            </div>
          </div>

          <div className="flex flex-col gap-200">
            <div className="flex items-center justify-between">
              <div className="font-designer-20b flex gap-100">
                <span>참가자 목록</span>
                <span className="text-[#A4A7AE]">{`${approvedApplicants?.pages[0]?.totalElements ?? 0}명`}</span>
              </div>
              {isLeader && (
                <Button
                  className="h-500 w-[80px] text-[16px] font-bold"
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
      <div className="flex flex-col gap-300">
        <StudyActiveTicker
          approvedCount={studyDetail.basicInfo.approvedCount}
          maxMembersCount={studyDetail.basicInfo.maxMembersCount}
          startDate={studyDetail.basicInfo.startDate}
        />
        <SummaryStudyInfo data={studyDetail} />
        <CurriculumSummarySection
          curriculumSummary={
            (
              studyDetail as GroupStudyFullResponseDto & {
                curriculumSummary?: CurriculumSummaryItem[];
              }
            ).curriculumSummary ?? []
          }
        />
      </div>
    </div>
  );
}
