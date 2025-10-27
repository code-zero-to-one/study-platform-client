'use client';

import { useState } from 'react';
import {
  formatHHMM,
  formatKoreaRelativeTime,
  formatYYYYMMDD,
} from '@/shared/lib/time';
import { getCookie } from '@/shared/tanstack-query/cookie';

import UserAvatar from '@/shared/ui/avatar';
import MoreMenu from '@/shared/ui/dropdown/more-menu';
import BronzeRankIcon from 'public/icons/bronze-rank.svg';
import CaretDownIcon from 'public/icons/caret-down.svg';
import CaretUpIcon from 'public/icons/caret-up.svg';
import GoldRankIcon from 'public/icons/gold-rank.svg';
import SealCheckIcon from 'public/icons/seal-check.svg';
import SilverRankIcon from 'public/icons/silver-rank.svg';
import DeleteGroupStudyMemberModal from './delete-group-study-member';
import ProgressScoreModal from './progress-score-modal';
import WriteGreetingModal from './write-greeting-modal';
import {
  GroupStudyMember,
  ProgressHistoryItem,
} from '../api/group-study-types';

type GroupStudyMemberItemProps = GroupStudyMember & {
  groupStudyId: number;
  leaderId: number;
};

export default function GroupStudyMemberItem({
  groupStudyId,
  leaderId,
  ...member
}: GroupStudyMemberItemProps) {
  const [isProgressScoreModalOpen, setIsProgressScoreModalOpen] =
    useState<boolean>(false);
  const [isDeleteMemberModalOpen, setIsDeleteMemberModalOpen] =
    useState<boolean>(false);

  const [isProgressHistoryOpen, setIsProgressHistoryOpen] =
    useState<boolean>(false);

  const myId = Number(getCookie('memberId'));
  const isMe = member.id === myId;
  const isLeader = leaderId === myId;

  return (
    <li className="border-border-default rounded-150 flex border">
      <div
        className={`border-r-border-default flex flex-col items-center gap-200 border-r p-400 ${isMe ? 'bg-background-accent-rose-subtle' : 'bg-background-alternative'} rounded-tl-150 rounded-bl-150 w-[240px] shrink-0`}
      >
        {/* 사용자 프로필 */}
        <div className="relative inline-block">
          <UserAvatar
            image={member.profileImageUrl}
            alt={`${member.memberName} 프로필 이미지`}
            size={100}
            className="border-border-default bg-background-default rounded-full border object-cover"
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
          <span className="font-designer-14r text-text-subtlest">
            최근 접속 시간: {formatKoreaRelativeTime(member.lastAccessedAt)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-300 p-400">
        <div className="text-text-default flex flex-col gap-150">
          <div className="flex items-center justify-between">
            <span className="font-designer-16b">가입 인사</span>
            {isLeader && (
              <>
                <MoreMenu
                  iconSize={24}
                  options={[
                    {
                      label: '평가하기',
                      value: 'edit',
                      onMenuClick: () => {
                        setIsProgressScoreModalOpen(true);
                      },
                    },
                    {
                      label: '내보내기',
                      value: 'delete-member',
                      onMenuClick: () => {
                        setIsDeleteMemberModalOpen(true);
                      },
                    },
                  ]}
                />
                <ProgressScoreModal
                  isOpen={isProgressScoreModalOpen}
                  setIsOpen={setIsProgressScoreModalOpen}
                  groupStudyId={groupStudyId}
                  targetMemberId={member.id}
                />
                <DeleteGroupStudyMemberModal
                  isOpen={isDeleteMemberModalOpen}
                  setIsOpen={setIsDeleteMemberModalOpen}
                  groupStudyId={groupStudyId}
                  targetMemberId={member.id}
                />
              </>
            )}
          </div>

          <GreetingBox
            id={member.id}
            greeting={member.greeting}
            groupStudyId={groupStudyId}
          />
        </div>

        <div className="bg-border-subtle h-[1px] w-full" />

        <div>
          <div className="flex justify-between">
            <div>
              <span className="font-designer-16b text-text-default mr-100">
                스터디 진행도
              </span>
              <span className="font-designer-16b text-text-brand">
                {member.progress.score}%
              </span>
            </div>

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

          <ProgressBar value={member.progress.score} className="mt-200" />

          {isProgressHistoryOpen && (
            <ul className="mt-300 flex flex-col gap-300">
              {member.progress.progressHistory.map((history) => (
                <ProgressScoreItem key={history.id} {...history} />
              ))}
            </ul>
          )}
        </div>
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

const renderGradeIcon = (code: ProgressHistoryItem['grade']['code']) => {
  switch (code) {
    case 'A+':
    case 'A-':
      return (
        <div className="bg-background-success-default rounded-50 p-150">
          <SealCheckIcon className="text-text-inverse" width={24} height={24} />
        </div>
      );
    case 'B+':
    case 'B-':
      return (
        <div className="bg-fill-information-default-default rounded-50 p-150">
          <SealCheckIcon className="text-text-inverse" width={24} height={24} />
        </div>
      );
    case 'C+':
    case 'C-':
      return (
        <div className="bg-fill-warning-default-default rounded-50 p-150">
          <SealCheckIcon className="text-text-inverse" width={24} height={24} />
        </div>
      );
    default:
      return null;
  }
};

function ProgressScoreItem({
  grade,
  reason,
  acquiredAt,
  id,
}: ProgressHistoryItem) {
  return (
    <li
      className={`border-b-border-subtle flex items-center gap-200 border-b pb-300 last:border-b-0 last:pb-0`}
    >
      {renderGradeIcon(grade.code)}

      <div>
        <div className="font-designer-15m text-text-default mb-50 flex items-center gap-100">
          <span>
            {grade.code} : {grade.name} (
            {`${grade.score > 0 ? '+' : ''}${grade.score}`})
          </span>

          <div className="bg-border-subtle h-[12px] w-[1px]" />

          <p className="break-all">{reason}</p>
        </div>

        <span className="font-designer-13r text-text-subtlest">{`${formatYYYYMMDD(acquiredAt, 'dot')} ${formatHHMM(acquiredAt)}`}</span>
      </div>
    </li>
  );
}

function GreetingBox({
  id,
  greeting,
  groupStudyId,
}: Pick<GroupStudyMember, 'id' | 'greeting'> & {
  groupStudyId: number;
}) {
  // 가입인사를 작성한 경우
  if (greeting) {
    return <p className="font-designer-15r min-h-[64px]">{greeting}</p>;
  }

  // 가입인사를 작성하지 못한 경우
  const isMe = id === Number(getCookie('memberId'));

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
