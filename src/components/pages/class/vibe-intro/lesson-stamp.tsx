'use client';

import { Lock, Users } from 'lucide-react';
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
  isAuthenticated: boolean;
  onSelect: (lesson: LessonDisplayInfo) => void;
  shouldBlink?: boolean;
  learnerCount: number;
}

export function LessonStamp({
  lesson,
  isAuthenticated,
  onSelect,
  shouldBlink = false,
  learnerCount,
}: LessonStampProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isCompleted = lesson.status === 'COMPLETED';
  const isLocked = lesson.status === 'LOCKED' && !lesson.accessible;
  const isActive = lesson.isCurrent || shouldBlink;

  const stampContent = (
    <div
      className="relative flex size-1650 shrink-0 flex-col items-center justify-center"
      onMouseEnter={() => !isCompleted && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Image
        src={
          isActive
            ? '/class/vibe-intro/lesson-stamp-active.svg'
            : '/class/vibe-intro/lesson-stamp.svg'
        }
        alt=""
        aria-hidden="true"
        width={132}
        height={132}
        className={cn(
          'absolute inset-0',
          isCompleted && 'brightness-110 saturate-150',
          isActive &&
            'animate-[pulse_1.6s_ease-in-out_infinite] drop-shadow-[0px_3.07px_11.512px_#fecdd6]',
        )}
      />
      <div className="relative z-10 flex flex-col items-center">
        {lesson.isFree && !isCompleted && !isLocked && (
          <p
            className={cn(
              'mb-25 font-designer-16m',
              isActive ? 'text-rose-50' : 'text-gray-500',
            )}
          >
            무료 온보딩
          </p>
        )}
        {isLocked && <Lock className="mb-25 size-300 text-gray-500" />}
        {isCompleted && (
          <p className="mb-25 font-designer-12b text-text-brand">완료</p>
        )}
        <p
          className={cn(
            'font-designer-18b',
            isCompleted
              ? 'text-text-brand'
              : isActive
                ? 'text-gray-0'
                : 'text-gray-500',
          )}
        >
          Lesson
        </p>
        <p
          className={cn(
            'font-designer-18b',
            isCompleted
              ? 'text-text-brand'
              : isActive
                ? 'text-gray-0'
                : 'text-gray-500',
          )}
        >
          {String(lesson.order).padStart(2, '0')}
        </p>
      </div>
      {showTooltip && (
        <div className="absolute -top-400 left-1/2 flex -translate-x-1/2 items-center gap-75 whitespace-nowrap rounded-100 bg-gray-900 px-150 py-75">
          <Users className="size-200 text-gray-0" />
          <span className="font-designer-12r text-gray-0">
            {learnerCount}명이 함께 달리는 중
          </span>
        </div>
      )}
    </div>
  );

  if (lesson.accessible) {
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
