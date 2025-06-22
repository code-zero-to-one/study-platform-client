'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/shared/shadcn/ui/avatar';
import DefaultUserIcon from 'public/profile-default.svg';

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
