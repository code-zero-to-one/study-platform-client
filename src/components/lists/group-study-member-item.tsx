'use client';

import { useState } from 'react';
import UserProfileModal from '@/components/common/modals/user-profile-modal';
import UserAvatar from '@/components/common/ui/avatar';
import Button from '@/components/common/ui/button';
import DiscretionGradeHistoryList from '@/components/lists/discretion-grade-history-list';
import MissionProgressHistoryList from '@/components/lists/mission-progress-history-list';
import DeleteGroupStudyMemberModal from '@/components/common/modals/delete-group-study-member';
import DiscretionaryEvaluationModal from '@/components/common/modals/discretionary-evaluation-modal';
import EndGroupStudyModal from '@/components/common/modals/end-group-study';
import WriteGreetingModal from '@/components/common/modals/write-greeting-modal';

import { useAuthReady } from '@/hooks/common/use-auth';
import type { GroupStudyMember } from '@/types/api/group-study.types';
import BronzeRankIcon from 'public/icons/bronze-rank.svg';
import CaretDownIcon from 'public/icons/caret-down.svg';
import CaretUpIcon from 'public/icons/caret-up.svg';
import GoldRankIcon from 'public/icons/gold-rank.svg';

import SilverRankIcon from 'public/icons/silver-rank.svg';

type GroupStudyMemberItemProps = GroupStudyMember & {
  groupStudyId: number;
  leaderId: number;
};

export default function GroupStudyMemberItem({
  groupStudyId,
  leaderId,
  ...member
}: GroupStudyMemberItemProps) {
  const { memberId: myId, isAuthReady } = useAuthReady();

  const [isProgressHistoryOpen, setIsProgressHistoryOpen] =
    useState<boolean>(false);
  const [isDeleteMemberModalOpen, setIsDeleteMemberModalOpen] =
    useState<boolean>(false);

  const isMe = member.id === myId;
  const isLeader = isAuthReady && leaderId === myId;

  // 재량 평가 받은 횟수 (3번까지만 받을 수 있음)
  const discretionCount = member.progress.discretionGradeHistory.length;

  return (
    <li className="border-border-default rounded-150 flex border">
      <div
        className={`flex flex-col items-center gap-200 px-300 py-400 ${isMe ? 'bg-background-accent-rose-subtle' : 'bg-background-alternative'} rounded-tl-150 rounded-bl-150 w-[240px] shrink-0`}
      >
        {/* 사용자 프로필 */}
        <div className="relative inline-block">
          <UserProfileModal
            memberId={member.id}
            trigger={
              <UserAvatar
                image={member.profileImageUrl}
                alt={`${member.memberName} 프로필 이미지`}
                size={100}
                className="border-border-default bg-background-default rounded-full border object-cover"
              />
            }
          />

          {/* 랭크 아이콘 */}
          {[1, 2, 3].includes(member.ranking) && (
            <div className="absolute right-0 bottom-0">
              {member.ranking === 1 && <GoldRankIcon />}
              {member.ranking === 2 && <SilverRankIcon />}
              {member.ranking === 3 && <BronzeRankIcon />}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-50">
          <span className="text-text-default font-designer-20b">
            {member.memberName}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-300 p-400">
        <div className="text-text-default flex flex-col gap-150">
          <div className="flex items-center justify-between">
            <span className="font-designer-16b">가입 인사</span>
            {isLeader &&
              member.id !== myId &&
              (discretionCount < EVALUATION_COUNT ? (
                <DiscretionaryEvaluationModal
                  key={discretionCount}
                  groupStudyId={groupStudyId}
                  memberId={member.id}
                />
              ) : (
                <span className="font-designer-13r text-text-subtlest">
                  재량 평가 {EVALUATION_COUNT}회 모두 완료
                </span>
              ))}
          </div>

          <GreetingBox
            id={member.id}
            greeting={member.greeting}
            groupStudyId={groupStudyId}
          />
        </div>

        <div className="flex flex-col gap-200">
          <div className="flex justify-between">
            <span className="font-designer-16b text-text-default mr-100">
              획득한 경험치
            </span>

            <button
              aria-label={`${member.memberName} 스터디 진행도 열기`}
              onClick={() => setIsProgressHistoryOpen((prev) => !prev)}
            >
              {isProgressHistoryOpen ? (
                <CaretUpIcon className="text-icon-secondary" />
              ) : (
                <CaretDownIcon className="text-icon-secondary" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-200">
            <div className="bg-background-alternative rounded-100 flex w-[120px] shrink-0 flex-col items-center justify-center gap-200 p-100">
              <span className="font-designer-14m text-text-subtle">
                총 획득 경험치
              </span>
              <span className="font-designer-18b text-text-strong">
                {member.progress.score} 점 / {member.progress.maxScore} 점
              </span>
            </div>

            <ProgressBar value={member.progress.score} className="mt-200" />
          </div>
        </div>

        {isProgressHistoryOpen && (
          <DiscretionGradeHistoryList
            discretionGradeHistory={member.progress.discretionGradeHistory}
          />
        )}

        {isProgressHistoryOpen && (
          <MissionProgressHistoryList
            missionProgressHistory={member.progress.missionProgressHistory}
          />
        )}

        {isProgressHistoryOpen && (
          <>
            {!isLeader && (
              <EndGroupStudyModal
                groupStudyId={groupStudyId}
                targetMemberId={member.id}
              />
            )}

            {isLeader && member.id !== myId && (
              <Button
                color="outlined"
                className="border-border-error text-text-error font-designer-14r w-fit"
                size="small"
                onClick={() => setIsDeleteMemberModalOpen(true)}
              >
                내보내기
              </Button>
            )}

            <DeleteGroupStudyMemberModal
              open={isDeleteMemberModalOpen}
              onChangeOpen={setIsDeleteMemberModalOpen}
              groupStudyId={groupStudyId}
              targetMemberId={member.id}
            />
          </>
        )}
      </div>
    </li>
  );
}

function ProgressBar({
  value,
  className = '',
}: {
  value: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`bg-background-neutral-subtle relative h-100 overflow-hidden rounded-full`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
      >
        {/* 진행률 표시 영역 */}
        <div
          className={`bg-icon-brand absolute top-0 bottom-0 left-0 rounded-tl-full rounded-bl-full transition-[width] duration-300 ease-in-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

function GreetingBox({
  id,
  greeting,
  groupStudyId,
}: Pick<GroupStudyMember, 'id' | 'greeting'> & {
  groupStudyId: number;
}) {
  const { memberId: authMemberId, isAuthReady } = useAuthReady();

  // 가입인사를 작성한 경우
  if (greeting) {
    return <p className="font-designer-15r min-h-[64px]">{greeting}</p>;
  }

  // 가입인사를 작성하지 못한 경우
  const isMe = isAuthReady && id === authMemberId;

  if (isMe) {
    return (
      <div className="rounded-100 bg-background-alternative border-border-default flex h-[130px] w-full items-center justify-center border-[1.5px] border-dashed">
        <WriteGreetingModal groupStudyId={groupStudyId} />
      </div>
    );
  }

  return (
    <div className="rounded-100 bg-background-alternative border-border-default text-icon-subtlest font-designer-15r flex h-[130px] w-full items-center justify-center border-[1.5px] border-dashed p-[10px]">
      가입 인사를 작성하지 않았습니다.
    </div>
  );
}
