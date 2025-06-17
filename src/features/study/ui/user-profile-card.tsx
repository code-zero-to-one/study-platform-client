'use client';

import React from 'react';
import { usePatchAutoMatchingMutation } from '@/entities/user/model/use-user-profile-query';
import UserAvatar from '@/shared/ui/avatar';
import { ToggleSwitch } from '@/shared/ui/toggle';
import AccessTimeIcon from 'public/icons/access_time.svg';
import AssignmentIcon from 'public/icons/assignment.svg';
import CodeIcon from 'public/icons/code.svg';
import SettingIcon from 'public/icons/setting.svg';

interface UserProfileCardProps {
  memberId: number;
  name: string;
  imageUrl: string;
  matching: boolean;
  subject: string;
  time: string;
  techStacks: string;
}

export default function UserProfileCard({
  memberId,
  name,
  imageUrl,
  matching,
  subject,
  time,
  techStacks,
}: UserProfileCardProps) {
  const [enabled, setEnabled] = React.useState(matching);

  const { mutate: patchAutoMatching, isPending } =
    usePatchAutoMatchingMutation();

  const handleToggleChange = (checked: boolean) => {
    setEnabled(checked); // UI 즉시 반영 (낙관적 업데이트)

    patchAutoMatching(
      { memberId, autoMatching: checked },
      {
        onError: () => {
          // 실패 시 원상복구
          setEnabled(!checked);
        },
      },
    );
  };

  return (
    <section className="rounded-200 border-border-subtle bg-text-inverse flex flex-col items-start gap-200 border p-200">
      <div className="flex flex-row items-center gap-200">
        <div className="relative h-[64px] w-[64px] shrink-0">
          <UserAvatar size={64} image={imageUrl} />
          <div className="bg-background-accent-gray-strong absolute right-0 bottom-0 flex h-[24px] w-[24px] items-center justify-center rounded-full">
            <SettingIcon />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="font-designer-18b">{name}님</div>
          <div className="flex flex-row items-center gap-100">
            <span className="font-designer-14r text-gray-800">스터디 매칭</span>
            <ToggleSwitch.Provider
              size="md"
              checked={enabled}
              onCheckedChange={handleToggleChange}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      <div className="bg-background-alternative rounded-100 font-designer-15m text-text-default flex w-full flex-col gap-200 px-200 py-150">
        <div className="flex items-center gap-100">
          <AssignmentIcon />
          <span>{subject}</span>
        </div>
        <div className="flex items-center gap-100">
          <AccessTimeIcon />
          <span>{time}</span>
        </div>
        <div className="flex items-center gap-100">
          <CodeIcon />
          <span>{techStacks}</span>
        </div>
      </div>
    </section>
  );
}
