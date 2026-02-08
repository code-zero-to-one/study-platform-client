'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import MockProfileModal from '@/components/modals/mock-profile-modal';
import UserAvatar from '@/components/ui/avatar';
import AvatarStack from '@/components/ui/avatar/avatar-stack';
import Button from '@/components/ui/button';
import CurriculumSummaryCard from '@/components/ui/curriculum-card';
import FloatingInfoBar from '@/components/ui/floating-info-bar';
import { useApplicantsByStatusQuery } from '@/features/study/group/application/model/use-applicant-qeury';
import { MOCK_MISSIONS, MOCK_PARTICIPANTS } from '@/mocks/group-study-mock-data';
import { useIsLeader } from '@/stores/useLeaderStore';
import { useUserStore } from '@/stores/useUserStore';

import InquirySection from './inquiry-section';
import { GroupStudyFullResponse } from '../../features/study/group/api/group-study-types';

import SummaryStudyInfo from '../summary/study-info-summary';


interface PremiumStudyInfoSectionProps {
  study: GroupStudyFullResponse;
  onMissionClick?: (missionId: number) => void;
}

export default function PremiumStudyInfoSection({
  study: studyDetail,
  onMissionClick,
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

  // const applicants = approvedApplicants?.pages[0]?.content;

  // 프로토타입: 미가입 시 커리큘럼 잠금
  const isUserJoined = false;
  const [selectedParticipantId, setSelectedParticipantId] = useState<
    number | null
  >(null);

  const thumbnailSrc =
    studyDetail?.detailInfo?.image?.resizedImages?.[0]?.resizedImageUrl ||
    '/images/default-study-thumbnail.png';

  return (
    <div className="m-auto mt-500 flex w-[1164px] gap-600">
      <div className="flex flex-1 flex-col gap-500">
        <div className="relative h-[430px] w-full">
          <Image
            src={thumbnailSrc}
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
                    studyDetail.basicInfo.leader.profileImage?.resizedImages?.[0]
                      ?.resizedImageUrl ?? ''
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
              <div
                className="bg-fill-neutral-default-default text-text-default font-designer-14b rounded-75 flex cursor-pointer items-center justify-center p-100"
                onClick={() => setSelectedParticipantId(1)}
              >
                프로필
              </div>
            </div>
            <div className="font-designer-16r whitespace-pre-line text-[#535862]">
              {studyDetail?.detailInfo?.description}
            </div>
          </div>

          <div className="flex flex-col gap-200">
            <div className="flex items-center justify-between">
              <div className="font-designer-20b flex gap-100">
                <span>멘티 목록</span>
                <span className="text-[#A4A7AE]">10명</span>
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

            <p className="font-designer-14m text-text-subtle">
              프로필을 클릭하여 멘티들의 정보를 확인해보세요.
            </p>

            <div className="mb-300 mt-100">
              <AvatarStack
                participants={MOCK_PARTICIPANTS}
                maxVisible={5}
                size={60}
                showLeaderCrown={false}
                onProfileClick={(participantId) =>
                  setSelectedParticipantId(participantId)
                }
              />
            </div>
          </div>

          <div className="pt-500 border-t border-border-default">
            <InquirySection
              studyId={groupStudyId}
              studyTitle={studyDetail?.detailInfo?.title ?? ''}
              currentUserId={memberId}
              isMentor={isLeader}
              isAdmin={false}
              isEmbedded={true}
              isGroupStudy={false}
            />
          </div>
        </div>
      </div>

      <div className="flex w-[335px] flex-col gap-400">
        <FloatingInfoBar
          currentViewers={12}
          currentMembers={studyDetail.basicInfo.approvedCount ?? 0}
          maxMembers={studyDetail.basicInfo.maxMembersCount ?? 15}
        />

        <SummaryStudyInfo data={studyDetail} />

        <CurriculumSummaryCard
          missions={MOCK_MISSIONS}
          isLocked={!isUserJoined}
          onMissionClick={onMissionClick}
        />
      </div>

      {selectedParticipantId && (
        <MockProfileModal
          isOpen={true}
          onClose={() => setSelectedParticipantId(null)}
          participantId={selectedParticipantId}
        />
      )}
    </div>
  );
}
