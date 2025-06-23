'use client';

import { Avatar, AvatarImage } from '@/shared/shadcn/ui/avatar';

interface UserAvatarProps {
  image?: string;
  alt?: string;
  size?: number;
}

export default function UserAvatar({
  image,
  alt = 'user image',
  size = 32,
}: UserAvatarProps) {
  return (
    <Avatar style={{ width: size, height: size }}>
      {image ? (
        <AvatarImage src={image} alt={alt} />
      ) : (
        <AvatarImage src={'/profile-default.svg'} alt={alt} />
      )}
    </Avatar>
  );
}
