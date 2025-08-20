'use client';

import ProfileDefault from '@/entities/user/ui/icon/profile-default.svg';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/shadcn/ui/avatar';

interface UserAvatarProps {
  image?: string;
  alt?: string;
  size?: number;
  accentColor?: string;
}

export default function UserAvatar({
  image,
  alt = 'user profile',
  size = 32,
  accentColor = '#FAB0D5',
  ...props
}: UserAvatarProps) {
  return (
    <Avatar {...props} style={{ width: size, height: size }}>
      {image ? (
        <AvatarImage src={image} alt={alt} />
      ) : (
        <AvatarFallback asChild>
          <ProfileDefault
            style={{ color: accentColor, width: size, height: size }}
            aria-label={alt}
          />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
