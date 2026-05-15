'use client';

import { Timer } from 'lucide-react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  Dialog,
  DialogContent,
} from '@/components/common/ui/(shadcn)/ui/dialog';
import UserAvatar from '@/components/common/ui/avatar';
import type { CourseCurriculumChapterResponse } from '@/types/api/course.types';
import type { LessonDisplayInfo } from './home-constants';

interface LessonPreviewModalProps {
  open: boolean;
  onClose: () => void;
  lesson: LessonDisplayInfo;
  chapter: CourseCurriculumChapterResponse;
  learnerCount: number;
  onStart: () => void;
  onSkip: () => void;
}

export function LessonPreviewModal({
  open,
  onClose,
  lesson,
  chapter,
  learnerCount,
  onStart,
  onSkip,
}: LessonPreviewModalProps) {
  const isOptionBonus = lesson.title.toLowerCase().includes('option');

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-10500 sm:max-w-10500 gap-0 overflow-hidden rounded-200 border-0 bg-background-default p-0">
        {/* Header */}
        <div className="flex items-center gap-125 px-875 pt-750">
          <span className="shrink-0 rounded-full bg-gray-400 px-250 py-50 font-designer-18b text-gray-0">
            Chapter {String(chapter.chapterNumber).padStart(2, '0')}
          </span>
          <span className="whitespace-nowrap font-designer-18b text-gray-600">
            {chapter.title}
          </span>
          <div className="ml-auto flex shrink-0 items-center gap-50 text-gray-600">
            <Timer className="size-300" />
            <span className="whitespace-nowrap font-designer-16r">
              약 {lesson.estimatedMinutes}분 소요
            </span>
          </div>
        </div>
        {/* Divider */}
        <div className="mx-875 mt-375 border-t border-gray-200" />
        {/* Body: lesson type + title + together pill */}
        <div className="flex w-full items-start justify-between px-875 pt-375">
          <div className="flex flex-col gap-150">
            <p className="whitespace-nowrap font-designer-24b text-text-brand">
              {isOptionBonus
                ? 'Option Bonus'
                : `Lesson ${String(lesson.order).padStart(2, '0')}`}
            </p>
            <p className="whitespace-nowrap font-designer-24b text-gray-800">
              {lesson.title}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-50 rounded-full border border-gray-200 text-gray-0 px-375 py-150">
            <div className="flex items-center">
              {[0, 1, 2].map((i) => (
                <UserAvatar
                  key={i}
                  image={undefined}
                  size={24}
                  className={cn(
                    'border border-background-brand-default',
                    i > 0 && '-ml-75',
                  )}
                />
              ))}
              <div className="-ml-75 flex size-300 items-center justify-center rounded-full bg-gray-100">
                <span className="text-[10px] leading-none text-gray-400">
                  ···
                </span>
              </div>
            </div>
            <span className="whitespace-nowrap font-designer-14m text-gray-800">
              지금 <span className="text-text-brand">{learnerCount}</span>
              명이 함께 달리고 있어요!
            </span>
          </div>
        </div>
        {/* 학습 목표 */}
        <div className="flex flex-col gap-75 px-875 pt-375">
          <p className="font-designer-18b text-gray-800">학습 목표</p>
          <p className="font-designer-15r text-gray-800">
            {lesson.description ??
              '이 레슨에서 무엇을 배우는지 확인하고 시작해요.'}
          </p>
        </div>
        {/* CTAs */}
        <div className="flex flex-col gap-150 px-875 pb-875 pt-375">
          {isOptionBonus && (
            <button
              type="button"
              onClick={onSkip}
              className="h-625 w-full rounded-100 border border-background-brand-default font-designer-14b text-text-brand"
            >
              건너뛰기
            </button>
          )}
          <button
            type="button"
            onClick={onStart}
            className="h-625 w-full rounded-100 bg-background-brand-default font-designer-14b text-gray-0"
          >
            시작하기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
