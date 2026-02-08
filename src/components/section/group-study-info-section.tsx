'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { GroupStudyFullResponseDto } from '@/api/openapi';
import MockProfileModal from '@/components/modals/mock-profile-modal';
import UserAvatar from '@/components/ui/avatar';
import AvatarStack from '@/components/ui/avatar/avatar-stack';
import Button from '@/components/ui/button';
import CurriculumSummaryCard from '@/components/ui/curriculum-card';
import FloatingInfoBar from '@/components/ui/floating-info-bar';
import { useApplicantsByStatusQuery } from '@/features/study/group/application/model/use-applicant-qeury';
import { useAuth } from '@/hooks/common/use-auth';
import {
  MOCK_MISSIONS,
  MOCK_PARTICIPANTS,
} from '@/mocks/group-study-mock-data';
import { useIsLeader } from '@/stores/useLeaderStore';
import { useUserStore } from '@/stores/useUserStore';

import InquirySection from './inquiry-section';
import SummaryStudyInfo from '../summary/study-info-summary';

interface StudyInfoSectionProps {
  study: GroupStudyFullResponseDto;
  onMissionClick?: (missionId: number) => void;
}

export default function StudyInfoSection({
  study: studyDetail,
  onMissionClick,
}: StudyInfoSectionProps) {
  const router = useRouter();
  const params = useParams();
  const { data: authData } = useAuth();
  const memberId = useUserStore((state) => state.memberId);
  const isLeader = useIsLeader(memberId);

  const groupStudyId = Number(params.id);

  const { data: approvedApplicants } = useApplicantsByStatusQuery({
    groupStudyId,
    status: 'APPROVED',
  });
  const applicants = approvedApplicants?.pages[0]?.content;

  // 프로토타입 데이터
  const isUserJoined = false; // 가입 여부 (프로토타입)

  // 프로필 모달 상태
  const [selectedParticipantId, setSelectedParticipantId] = useState<
    number | null
  >(null);

  return (
    // todo: 스터디 공지 모달 추가
    // <GroupStudyNoticeModal groupStudyId={groupStudyId} />
    <div className="m-auto mt-500 flex w-[1164px] gap-600">
      <div className="flex flex-1 flex-col gap-500">
        <div className="relative h-[430px] w-full">
          <Image
            src="/images/default-study-thumbnail.png"
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
              <div
                className="bg-fill-neutral-default-default text-text-default font-designer-14b rounded-75 flex cursor-pointer items-center justify-center p-100"
                onClick={() => setSelectedParticipantId(1)}
              >
                프로필
              </div>
            </div>
            <div className="font-designer-16r whitespace-pre-line text-[#535862]">
              {studyDetail?.detailInfo.description}
            </div>
          </div>

          <div className="flex flex-col gap-200">
            <div className="flex items-center justify-between">
              <div className="font-designer-20b flex gap-100">
                <span>참가자 목록</span>
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

            {/* 안내 문구 */}
            <p className="font-designer-14m text-text-subtle">
              프로필을 클릭하여 스터디원들의 정보를 확인해보세요.
            </p>

            {/* Avatar Stack (프로토타입) */}
            <div className="mt-100 mb-300">
              <AvatarStack
                participants={MOCK_PARTICIPANTS}
                maxVisible={5}
                size={60}
                onProfileClick={(participantId) =>
                  setSelectedParticipantId(participantId)
                }
              />
            </div>
          </div>

          {/* 문의 게시판 (스터디 소개 하단) */}
          <div className="border-border-default border-t pt-500">
            <InquirySection
              studyId={groupStudyId}
              studyTitle={studyDetail.detailInfo.title}
              currentUserId={memberId}
              isMentor={isLeader}
              isAdmin={false}
              isEmbedded={true}
            />
          </div>
        </div>
      </div>

      {/* 우측 사이드바 */}
      <div className="flex w-[335px] flex-col gap-400">
        {/* 플로팅 정보 바 (최상단) */}
        <FloatingInfoBar
          currentViewers={12}
          currentMembers={studyDetail.basicInfo.approvedCount ?? 0}
          maxMembers={studyDetail.basicInfo.maxMembersCount}
        />

        {/* 스터디 정보 카드 */}
        <SummaryStudyInfo data={studyDetail} />

        {/* 커리큘럼 요약 카드 (하단) */}
        <CurriculumSummaryCard
          missions={MOCK_MISSIONS}
          isLocked={!isUserJoined}
          onMissionClick={onMissionClick}
        />
      </div>

      {/* 프로필 모달 */}
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
