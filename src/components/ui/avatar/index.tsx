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
  size?: number;
  className?: string;
}

export default function Avatar({
  image,
  alt = 'profile-image',
  size = 32,
  className,
  ...props
}: UserAvatarProps) {
  const [isError, setIsError] = useState(false);

  const showImage = !!image && !isError;

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
          src="/profile-default.svg"
          alt="error-image"
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      </RadixAvatarFallback>
    </RadixAvatar>
  );
}
