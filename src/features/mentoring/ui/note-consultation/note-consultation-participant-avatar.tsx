'use client';

import dynamic from 'next/dynamic';
import UserAvatar from '@/components/common/ui/avatar';

const UserProfileModal = dynamic(
  () => import('@/components/common/modals/user-profile-modal'),
);

interface NoteConsultationParticipantAvatarProps {
  name: string;
  imageUrl?: string;
  memberId?: number;
  size?: number;
}

export default function NoteConsultationParticipantAvatar({
  name,
  imageUrl,
  memberId,
  size = 44,
}: NoteConsultationParticipantAvatarProps) {
  const avatar = (
    <UserAvatar
      image={imageUrl}
      alt={`${name} 프로필 이미지`}
      size={size}
      className="shrink-0"
    />
  );

  if (!memberId) {
    return avatar;
  }

  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <UserProfileModal
        memberId={memberId}
        trigger={
          <span className="ring-border-subtle hover:ring-fill-brand-default-default inline-flex rounded-full ring-1 ring-transparent ring-inset transition-shadow">
            {avatar}
          </span>
        }
      />
    </div>
  );
}
