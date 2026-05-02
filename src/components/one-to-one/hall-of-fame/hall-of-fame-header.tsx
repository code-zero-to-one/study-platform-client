'use client';

import { Trophy } from 'lucide-react';
import React from 'react';
import SectionHeader from '@/components/common/ui/section-header';

export default function HallOfFameHeader() {
  return (
    <SectionHeader
      title="명예의 전당"
      icon={
        <Trophy className="text-text-warning h-8 w-8" fill="currentColor" />
      }
      description={
        <div className="flex flex-col gap-50">
          <p>제로원을 빛낸 열정적인 멤버들과 최고의 유저들을 소개합니다.</p>
          <p>
            꾸준한 스터디 그룹을 통해 제로원 명예의 전당에 이름을 올려보세요!
          </p>
        </div>
      }
    />
  );
}
