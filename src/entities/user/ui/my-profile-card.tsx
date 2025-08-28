'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { usePatchAutoMatchingMutation } from '@/entities/user/model/use-user-profile-query';
import { useReviewReminder } from '@/features/study/lib/use-reminder-review';
import StudyReviewModal from '@/features/study/ui/study-review-modal';
import UserAvatar from '@/shared/ui/avatar';
import { ToggleSwitch } from '@/shared/ui/toggle';
import AccessTimeIcon from 'public/icons/access_time.svg';
import AssignmentIcon from 'public/icons/assignment.svg';
import CodeIcon from 'public/icons/code.svg';
import SettingIcon from 'public/icons/setting.svg';

interface MyProfileCardProps {
  memberId: number;
  name?: string;
  imageUrl?: string;
  matching: boolean;
  subject?: string;
  time?: string;
  techStacks?: string;
  studyApplied?: boolean;
}

export default function MyProfileCard({
  memberId,
  name,
  imageUrl,
  matching,
  subject,
  time,
  techStacks,
  studyApplied,
}: MyProfileCardProps) {
  const { showReviewReminder, setShowReviewReminder } = useReviewReminder();

  const [enabled, setEnabled] = useState(matching);

  const { mutate: patchAutoMatching, isPending } =
    usePatchAutoMatchingMutation();

  const handleToggleChange = (checked: boolean) => {
    if (!studyApplied) return;

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
          <div className="flex flex-col">
            <div className="font-designer-18b">
              {name?.trim() || '비회원'}님
            </div>
            <div className="flex flex-row items-center gap-100">
              <span className="font-designer-14r text-gray-800">
                스터디 매칭
              </span>
              <ToggleSwitch.Root
                size="md"
                checked={enabled}
                onCheckedChange={handleToggleChange}
                disabled={isPending || !studyApplied}
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
