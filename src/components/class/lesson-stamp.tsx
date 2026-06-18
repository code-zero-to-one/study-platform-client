'use client';

import { Users } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import type { LessonDisplayInfo } from './home-constants';

const LoginModal = dynamic(
  () => import('@/components/auth/modals/login-modal'),
);

interface LessonStampProps {
  lesson: LessonDisplayInfo;
  chapterNumber: number;
  isAuthenticated: boolean;
  onSelect: (lesson: LessonDisplayInfo) => void;
  shouldBlink?: boolean;
  learnerCount: number;
}

type StampVariant = 'active' | 'zero' | 'default' | 'default-zero';

const STAMP_VARIANTS: Record<
  StampVariant,
  {
    src: string;
    text: string;
  }
> = {
  // 홀수 챕터 완료 → 분홍(워니)
  active: {
    src: '/class/journey/stamp-active.png',
    text: 'top-[66%] font-designer-16b text-[#A11043]',
  },
  // 짝수 챕터 완료 → 검정(제로)
  zero: {
    src: '/class/journey/stamp-zero.png',
    text: 'top-[66%] font-designer-16b text-[#252B37]',
  },
  // 홀수 챕터 미완료 → 회색 워니
  default: {
    src: '/class/journey/stamp-default.png',
    text: 'top-[44%] font-designer-14b text-[#A4A7AE]',
  },
  // 짝수 챕터 미완료 → 회색 제로
  'default-zero': {
    src: '/class/journey/stamp-zero-default.png',
    text: 'top-[44%] font-designer-14b text-[#A4A7AE]',
  },
};

export function LessonStamp({
  lesson,
  chapterNumber,
  isAuthenticated,
  onSelect,
  shouldBlink = false,
  learnerCount,
}: LessonStampProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isCompleted = lesson.status === 'COMPLETED';
  const isLocked = lesson.status === 'LOCKED';
  const isBlinking = (lesson.isCurrent || shouldBlink) && !isCompleted;

  const isOddChapter = chapterNumber % 2 === 1;
  const variant: StampVariant = isCompleted
    ? isOddChapter
      ? 'active'
      : 'zero'
    : isOddChapter
      ? 'default'
      : 'default-zero';
  const stamp = STAMP_VARIANTS[variant];

  const lessonLabel = `Lesson ${String(lesson.order).padStart(2, '0')}`;

  const stampContent = (
    <div
      className={cn(
        'relative size-1250 shrink-0 md:size-1750',
        isBlinking && 'animate-[pulse_1.6s_ease-in-out_infinite]',
      )}
      onMouseEnter={() => !isCompleted && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Image
        src={stamp.src}
        alt=""
        aria-hidden="true"
        fill
        sizes="140px"
        className="object-contain"
      />
      {/* 레슨 번호 (동적) */}
      <span
        className={cn(
          'absolute left-1/2 -translate-x-1/2 whitespace-nowrap',
          stamp.text,
        )}
      >
        {lessonLabel}
      </span>
      <span className="sr-only">
        {lesson.title} —{' '}
        {isCompleted ? '완료' : isLocked ? '잠김' : '수강 가능'}
      </span>

      {showTooltip && (
        <div className="absolute left-1/2 top-full z-20 flex -translate-x-1/2 flex-col items-center">
          <svg aria-hidden="true" width="21" height="13" viewBox="0 0 21 13">
            <polygon points="10.5,0 0,13 21,13" className="fill-gray-800" />
          </svg>
          <div className="flex items-center gap-75 whitespace-nowrap rounded-100 bg-gray-800 px-150 py-75">
            <Users className="size-200 text-gray-0" />
            <span className="font-designer-14r text-gray-0">
              {learnerCount}명이 함께 달리는 중
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (lesson.accessible && !isLocked) {
    if (!isAuthenticated) {
      return (
        <LoginModal
          openTrigger={<button type="button">{stampContent}</button>}
        />
      );
    }
    return (
      <button type="button" onClick={() => onSelect(lesson)}>
        {stampContent}
      </button>
    );
  }

  return (
    <div aria-disabled="true" className="cursor-not-allowed">
      {stampContent}
    </div>
  );
}
