'use client';

import { useMemo, useState } from 'react';
import ProfileDefault from '@/entities/user/ui/icon/profile-default.svg';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/shadcn/ui/avatar';

type ProfileImageSrc = string | undefined;

function getValidImageUrl(src: ProfileImageSrc) {
  const s = (src ?? '').trim();
  if (!s || s.toLowerCase() === 'default') return undefined;

  return s;
}

interface UserAvatarProps {
  image?: ProfileImageSrc;
  alt?: string;
  size?: number;
  accentColor?: string;
  className?: string;
}

export default function UserAvatar({
  image,
  alt = 'user profile',
  size = 32,
  accentColor = '#FAB0D5',
  className,
  ...props
}: UserAvatarProps) {
  const [isImageError, setImageError] = useState(false);

  const resolvedImageUrl = useMemo(() => {
    setImageError(false);

    return getValidImageUrl(image);
  }, [image]);

  const showImage = !!resolvedImageUrl && !isImageError;

  return (
    <Avatar
      key={showImage ? resolvedImageUrl : 'fallback'}
      {...props}
      className={className}
      style={{ width: size, height: size }}
    >
      {showImage && (
        <AvatarImage
          src={resolvedImageUrl!}
          alt={alt}
          onError={() => setImageError(true)}
        />
      )}

      <AvatarFallback>
        <ProfileDefault
          className="h-full w-full"
          style={{ color: accentColor }}
          aria-label={alt}
        />
      </AvatarFallback>
    </Avatar>
  );
}
