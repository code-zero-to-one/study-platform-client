'use client';

import React from 'react';
import UserAvatar from '@/shared/ui/avatar';
<<<<<<< Updated upstream:src/features/study/ui/user-profile-card.tsx
import { ToggleSwitch } from '@/shared/ui/toggle';
import AccessTimeIcon from 'public/icons/access_time.svg'
import AssignmentIcon from 'public/icons/assignment.svg'
import CodeIcon from 'public/icons/code.svg'
import SettingIcon from 'public/icons/setting.svg'
=======
import { Toggle } from '@/shared/ui/toggle/index';
import AccessTimeIcon from 'public/icons/access_time.svg';
import AssignmentIcon from 'public/icons/assignment.svg';
import CodeIcon from 'public/icons/code.svg';
import SettingIcon from 'public/icons/setting.svg';
>>>>>>> Stashed changes:src/features/home/user-profile-card.tsx

interface UserProfileCardProps {
  name: string;
  imageUrl: string;
  matching: boolean;
  subject: string;
  time: string;
  techStacks: string;
}

export default function UserProfileCard({
  name,
  imageUrl,
  matching,
  subject,
  time,
  techStacks,
}: UserProfileCardProps) {
  const [enabled, setEnabled] = React.useState(matching);

<<<<<<< Updated upstream:src/features/study/ui/user-profile-card.tsx
   return (
      <section className='p-200 rounded-200 border border-border-subtle bg-text-inverse flex flex-col items-start gap-200'>
         <div className='flex flex-row gap-200 items-center'>
            <div className="relative w-[64px] h-[64px] shrink-0">
               <UserAvatar size={64} image={imageUrl} />
               <div className="absolute bottom-0 right-0 w-[24px] h-[24px] bg-background-accent-gray-strong rounded-full flex items-center justify-center">
                  <SettingIcon />
               </div>
            </div>
            <div className='flex flex-col'>
               <div className='font-designer-18b'>{name}님</div>
               <div className='flex flex-row gap-100 items-center'>
                  <span className='font-designer-14r text-gray-800'>스터디 매칭</span>
                  <ToggleSwitch.Provider
                     size="md"
                     checked={enabled}
                     onCheckedChange={setEnabled}
                  />
               </div>
            </div>
         </div>
=======
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
            <Toggle.Provider
              color="primary"
              size="md"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
        </div>
      </div>
>>>>>>> Stashed changes:src/features/home/user-profile-card.tsx

      <div className="bg-background-alternative rounded-100 font-designer-15m flex w-full flex-col gap-200 px-200 py-150">
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
