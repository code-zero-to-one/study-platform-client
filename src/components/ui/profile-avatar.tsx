'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
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

  const imageCandidates = useMemo(() => {
    if (!src || typeof src !== 'string') return [] as string[];
    const s = src.trim();
    if (!s) return [];
    if (s.toUpperCase() === 'LOCAL' || s === 'null' || s === 'undefined')
      return [];
    if (s.toUpperCase().startsWith('LOCAL/')) {
      const afterLocal = s.substring(6);
      if (
        afterLocal.startsWith('http://') ||
        afterLocal.startsWith('https://')
      ) {
        return [afterLocal];
      }

      return [];
    }

    if (s.startsWith('http://') || s.startsWith('https://')) return [s];

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
    const candidates: string[] = [];

    const addCandidate = (path: string) => {
      if (apiBase) candidates.push(`${apiBase}${path}`);
      candidates.push(path);
    };

    if (s.startsWith('/')) {
      addCandidate(s);

      return candidates;
    }

    if (s.includes('/')) {
      addCandidate(`/${s}`);

      return candidates;
    }

    const filename = s;
    addCandidate(`/${filename}`);
    addCandidate(`/images/profile-image/${filename}`);
    addCandidate(`/profile-image/${filename}`);
    addCandidate(`/files/images/profile-image/${filename}`);
    addCandidate(`/MEMBER_PROFILE_IMAGE/images/profile-image/${filename}`);

    return candidates;
  }, [src]);

  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [imageCandidates]);

  const finalSrc = imageCandidates[candidateIndex] ?? '/profile-default.svg';

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
      onError={() => {
        setCandidateIndex((prev) =>
          prev < imageCandidates.length ? prev + 1 : prev,
        );
      }}
    />
  );
};
