'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import StartStudyModal from '@/components/common/modals/start-study-modal';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/common/ui/avatar';
import { ToggleSwitch } from '@/components/common/ui/toggle';
import StudyReviewModal from '@/components/common/modals/study-review-modal';
import { getSincerityPresetByLevelName } from '@/config/sincerity-temp-presets';
import { useReviewReminder } from '@/hooks/common/use-reminder-review';
import { usePatchAutoMatchingMutation } from '@/hooks/queries/use-user-profile-query';
import { SincerityTemp } from '@/types/api/user.types';
import AccessTimeIcon from 'public/icons/access_time.svg';
import AssignmentIcon from 'public/icons/assignment.svg';
import CodeIcon from 'public/icons/code.svg';
import SettingIcon from 'public/icons/setting.svg';

interface MyProfileCardProps {
  memberId: number;
  name?: string;
  nickname?: string;
  imageUrl?: string;
  matching: boolean;
  subject?: string;
  time?: string;
  techStacks?: string;
  studyApplied?: boolean;
  sincerityTemp: SincerityTemp;
}

export default function MyProfileCard({
  memberId,
  name,
  nickname,
  imageUrl,
  matching,
  subject,
  time,
  techStacks,
  studyApplied,
  sincerityTemp,
}: MyProfileCardProps) {
  const { showReviewReminder, setShowReviewReminder } =
    useReviewReminder(memberId);

  const [enabled, setEnabled] = useState(matching);
  const [isStartStudyModalOpen, setIsStartStudyModalOpen] = useState(false); // 모달 상태 추가
  const temperPreset = getSincerityPresetByLevelName(sincerityTemp.levelName);

  const { mutate: patchAutoMatching, isPending } =
    usePatchAutoMatchingMutation();

  const handleToggleChange = (checked: boolean) => {
    // 스터디 신청 안 했을 때 -> 신청 모달 열기 (여기서 본인인증 체크도 자동으로 됨)
    if (!studyApplied) {
      setIsStartStudyModalOpen(true);
      // 토글 상태는 바꾸지 않음 (신청 완료 후 바뀌도록 유도하거나 사용자가 다시 켜야 함)

      return;
    }

    setEnabled(checked);

    patchAutoMatching(
      { memberId, autoMatching: checked },
      {
        onError: () => {
          setEnabled(!checked);
        },
      },
    );
  };

  return (
    <>
      <StudyReviewModal
        open={showReviewReminder}
        onOpenChange={setShowReviewReminder}
      />
      {/* 스터디 신청 모달 (토글 클릭 시 실행됨) */}
      <StartStudyModal
        memberId={memberId}
        open={isStartStudyModalOpen}
        onOpenChange={setIsStartStudyModalOpen}
      />

      <section className="rounded-200 border-border-subtle bg-text-inverse flex flex-col items-start gap-200 border p-200">
        <div className="flex flex-row items-center gap-200">
          <div className="relative h-[64px] w-[64px] shrink-0">
            <UserAvatar size={64} image={imageUrl?.trim() || ''} />
            <Link
              href="my-page"
              className="bg-background-accent-gray-strong absolute right-0 bottom-0 flex h-[24px] w-[24px] items-center justify-center rounded-full"
            >
              <SettingIcon />
            </Link>
          </div>
          <div className="flex flex-col gap-75">
            <div className="flex flex-row items-center gap-50">
              <div className="font-designer-18b">
                {nickname?.trim() || '비회원'}님
              </div>
              <div
                className={cn(
                  'font-designer-13m rounded-full px-150 py-50',
                  temperPreset.bgClass,
                  temperPreset.textClass,
                )}
              >
                {sincerityTemp.temperature.toFixed(1)} ℃
              </div>
            </div>
            <div className="flex flex-row items-center gap-100">
              <span className="font-designer-14r text-gray-800">
                스터디 매칭
              </span>
              <ToggleSwitch.Root
                size="md"
                checked={enabled}
                onCheckedChange={handleToggleChange}
                disabled={isPending} // !studyApplied 제거
              />
            </div>
          </div>
        </div>
        <div className="bg-background-alternative rounded-100 font-designer-15m text-text-default flex w-full flex-col gap-200 px-200 py-150">
          <div className="flex items-center gap-100">
            <AssignmentIcon />
            <span>{subject?.trim() || '없음'}</span>
          </div>
          <div className="flex items-center gap-100">
            <AccessTimeIcon />
            <span>{time?.trim() || '없음'}</span>
          </div>
          <div className="flex items-center gap-100">
            <CodeIcon />
            <span>{techStacks?.trim() || '없음'}</span>
          </div>
        </div>
      </section>
    </>
  );
}
