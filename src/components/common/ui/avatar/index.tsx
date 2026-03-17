'use client';

import {
  Avatar as RadixAvatar,
  AvatarFallback as RadixAvatarFallback,
  AvatarImage as RadixAvatarImage,
} from '@radix-ui/react-avatar';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '../(shadcn)/lib/utils';

interface UserAvatarProps {
  image: string | undefined;
  alt?: string;
  size?: number | string;
  className?: string;
  fallbackSrc?: string;
}

export default function Avatar({
  image,
  alt = 'profile-image',
  size = 32,
  className,
  fallbackSrc = '/profile-default.svg',
  ...props
}: UserAvatarProps) {
  const [isError, setIsError] = useState(false);
  const fallbackSize = typeof size === 'number' ? size : 32;

  // 유효하지 않은 이미지 URL 필터링 (LOCAL, 빈 문자열, 상대 경로만 있는 경우 등)
  const isValidImage =
    image &&
    typeof image === 'string' &&
    image.trim() !== '' &&
    image.toUpperCase() !== 'LOCAL' &&
    (image.startsWith('http://') ||
      image.startsWith('https://') ||
      image.startsWith('blob:') ||
      image.startsWith('data:') ||
      image.startsWith('/'));

  const showImage = isValidImage && !isError;

  return (
    <RadixAvatar
      {...props}
      className={cn(
        'inline-flex items-center justify-center overflow-hidden rounded-full',
        className,
      )}
      style={{
        width: size,
        height: size,
      }}
    >
      {showImage && (
        <RadixAvatarImage
          className="h-full w-full object-cover"
          src={image}
          alt={alt}
          onError={() => setIsError(true)}
        />
      )}

      <RadixAvatarFallback>
        <Image
          src={fallbackSrc}
          alt="error-image"
          width={fallbackSize}
          height={fallbackSize}
          className="h-full w-full object-cover"
        />
      </RadixAvatarFallback>
    </RadixAvatar>
  );
}
