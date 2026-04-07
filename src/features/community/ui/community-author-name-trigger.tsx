'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

const UserProfileModal = dynamic(
  () => import('@/components/common/modals/user-profile-modal'),
  { ssr: false },
);

interface CommunityAuthorNameTriggerProps {
  memberId?: number;
  name: string;
  className?: string;
}

export default function CommunityAuthorNameTrigger({
  memberId,
  name,
  className,
}: CommunityAuthorNameTriggerProps) {
  if (typeof memberId !== 'number') {
    return <span className={cn(className)}>{name}</span>;
  }

  return (
    <UserProfileModal
      memberId={memberId}
      trigger={
        <button
          type="button"
          aria-label={`${name} 프로필 보기`}
          className={cn(
            'cursor-pointer rounded-50 text-left transition-colors hover:text-text-brand focus-visible:text-text-brand focus-visible:outline-none',
            className,
          )}
        >
          {name}
        </button>
      }
    />
  );
}
