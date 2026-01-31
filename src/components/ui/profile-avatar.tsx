'use client';

import Image from 'next/image';
import React, { useMemo, useState } from 'react';
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
    // 유효하지 않은 값 필터링 (LOCAL, null 등)
    if (s.toUpperCase() === 'LOCAL' || s === 'null' || s === 'undefined')
      return null;
    // LOCAL/로 시작하는 경우 처리 (예: LOCAL/https:/picsum.photos/202)
    if (s.toUpperCase().startsWith('LOCAL/')) {
      const afterLocal = s.substring(6); // 'LOCAL/'.length = 6
      // LOCAL/ 뒤에 실제 URL이 있는 경우
      if (
        afterLocal.startsWith('http://') ||
        afterLocal.startsWith('https://')
      ) {
        return afterLocal;
      }

      // LOCAL/ 뒤에 유효하지 않은 값인 경우
      return null;
    }
    if (
      s.startsWith('http://') ||
      s.startsWith('https://') ||
      s.startsWith('/')
    )
      return s;

    return `/${s}`;
  }, [src]);

  const [broken, setBroken] = useState(false);
  const finalSrc =
    !broken && normalizedSrc ? normalizedSrc : '/profile-default.svg';

  return (
    <Image
      src={finalSrc}
      alt={effectiveAlt}
      width={px}
      height={px}
      className={cn(
        'bg-fill-neutral-default-default shadow-1 shrink-0 rounded-full object-cover',
        className,
      )}
      loading="eager"
      unoptimized
      onError={() => setBroken(true)}
    />
  );
};
