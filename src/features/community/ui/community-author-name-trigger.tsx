'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/common/ui/avatar';

const UserProfileModal = dynamic(
  () => import('@/components/common/modals/user-profile-modal'),
  { ssr: false },
);

interface CommunityAuthorNameTriggerProps {
  memberId?: number;
  name: string;
  className?: string;
  image?: string;
  imageSize?: number;
}

export default function CommunityAuthorNameTrigger({
  memberId,
  name,
  className,
  image,
  imageSize = 20,
}: CommunityAuthorNameTriggerProps) {
  if (typeof memberId !== 'number') {
    if (!image) return <span className={cn(className)}>{name}</span>;
    return (
      <span className="flex items-center gap-75">
        <UserAvatar image={image} size={imageSize} />
        <span className={cn(className)}>{name}</span>
      </span>
    );
  }

  const trigger = image ? (
    <button
      type="button"
      aria-label={`${name} 프로필 보기`}
      className="flex cursor-pointer items-center gap-75 rounded-50 transition-colors hover:opacity-80 focus-visible:outline-none"
    >
      <UserAvatar image={image} size={imageSize} />
      <span className={cn(className)}>{name}</span>
    </button>
  ) : (
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
  );

  return <UserProfileModal memberId={memberId} trigger={trigger} />;
}
