'use client';

import {
  Avatar as RadixAvatar,
  AvatarFallback as RadixAvatarFallback,
  AvatarImage as RadixAvatarImage,
} from '@radix-ui/react-avatar';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cn } from '../(shadcn)/lib/utils';

const INVALID_AVATAR_SENTINEL = 'LOCAL';

const normalizeAvatarPath = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return '';
  }

  const normalizedValue = trimmedValue.replace(/\/+$/, '');

  return normalizedValue || '/';
};

const isKnownInvalidAvatarImage = (value: string) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return true;
  }

  if (trimmedValue.toUpperCase() === INVALID_AVATAR_SENTINEL) {
    return true;
  }

  if (trimmedValue.startsWith('/')) {
    return (
      normalizeAvatarPath(trimmedValue).toUpperCase() ===
      `/${INVALID_AVATAR_SENTINEL}`
    );
  }

  try {
    const parsedUrl = new URL(trimmedValue);

    return (
      normalizeAvatarPath(parsedUrl.pathname).toUpperCase() ===
      `/${INVALID_AVATAR_SENTINEL}`
    );
  } catch {
    return false;
  }
};

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

  useEffect(() => {
    setIsError(false);
  }, [image]);

  const isValidImage =
    image &&
    typeof image === 'string' &&
    !isKnownInvalidAvatarImage(image) &&
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
