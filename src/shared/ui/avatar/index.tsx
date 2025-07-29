'use client';

import { forwardRef } from 'react';
import { Avatar, AvatarImage } from '@/shared/shadcn/ui/avatar';

interface UserAvatarProps {
  image?: string;
  alt?: string;
  size?: number;
}

const UserAvatar = forwardRef<HTMLSpanElement, UserAvatarProps>(
  (
    { image, alt = 'user profile', size = 32, ...props }: UserAvatarProps,
    forwardedRef,
  ) => {
    return (
      <Avatar
        {...props}
        ref={forwardedRef}
        style={{ width: size, height: size }}
      >
        {image ? (
          <AvatarImage src={image} alt={alt} />
        ) : (
          <AvatarImage src={'/profile-default.svg'} alt={alt} />
        )}
      </Avatar>
    );
  },
);

UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;
