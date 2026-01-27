'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface ProfileAvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  name?: string;
}

export const ProfileAvatar = ({
  src,
  alt,
  size = 'md',
  className = '',
  name,
}: ProfileAvatarProps) => {
  const px = { sm: 32, md: 48, lg: 80, xl: 120 }[size]; // 기존 명예의 전당 사이즈와 최대한 비슷하게 매핑 (sm:32px는 기존 row에 맞춤)
  const effectiveAlt = alt || name || 'profile';

  // src 정리(공백/이상한 상대경로 방지)
  const normalizedSrc = useMemo(() => {
    if (!src || typeof src !== 'string') return null;
    const s = src.trim();
    if (!s) return null;
    if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) return s;
    return `/${s}`;
  }, [src]);

  const [broken, setBroken] = useState(false);
  const finalSrc = !broken && normalizedSrc ? normalizedSrc : '/profile-default.svg';

  return (
    <Image
      src={finalSrc}
      alt={effectiveAlt}
      width={px}
      height={px}
      className={cn('shrink-0 rounded-full object-cover bg-fill-neutral-default-default shadow-1', className)}
      loading="eager"
      unoptimized
      onError={() => setBroken(true)}
    />
  );
};
