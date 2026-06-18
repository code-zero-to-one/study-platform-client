'use client';

import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  LockIcon,
  LockOpenIcon,
  TimerIcon,
} from '@/components/common/ui/icons/course-icons';
import type {
  CourseCurriculumChapterResponse,
  CourseJourneyMapLessonResponse,
} from '@/types/api/course.types';
import { type LessonDisplayInfo, mergeLessons } from './home-constants';

interface JourneyChapterListProps {
  chapters: CourseCurriculumChapterResponse[];
  lessonStatusMap: Map<number, CourseJourneyMapLessonResponse>;
  hasMoreChapters: boolean;
  onShowMore: () => void;
  onSelectLesson: (
    lesson: LessonDisplayInfo,
    chapter: CourseCurriculumChapterResponse,
  ) => void;
}

function LessonStatusBadge({ lesson }: { lesson: LessonDisplayInfo }) {
  if (lesson.isFree) {
    return (
      <span className="flex h-250 w-525 items-center justify-center rounded-50 bg-rose-400 font-designer-12r text-text-inverse">
        무료
      </span>
    );
  }
  if (!lesson.accessible) {
    return (
      <span className="flex h-250 w-525 items-center justify-center rounded-50 bg-gray-400">
        <LockIcon className="size-200 text-gray-0" aria-label="잠금" />
      </span>
    );
  }
  return (
    <span className="flex h-250 w-525 items-center justify-center rounded-50 border border-gray-300 bg-gray-0">
      <LockOpenIcon className="size-200 text-gray-400" aria-label="잠금 해제" />
    </span>
  );
}

export function JourneyChapterList({
  chapters,
  lessonStatusMap,
  hasMoreChapters,
  onShowMore,
  onSelectLesson,
}: JourneyChapterListProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="mt-800">
      <h2 className="font-designer-28b text-gray-800">Chapter 목록</h2>
      <div className="mt-400 flex flex-col gap-375">
        {chapters.map((chapter, ci) => {
          const isOpen = expanded.has(ci);
          const lessons = mergeLessons(chapter, lessonStatusMap);

          return (
            <div
              key={chapter.order}
              className={cn(
                'overflow-hidden rounded-200 border bg-gray-50',
                isOpen ? 'border-rose-200' : 'border-gray-300',
              )}
            >
              <button
                type="button"
                onClick={() => toggle(ci)}
                aria-expanded={isOpen}
                className="flex w-full items-start gap-250 p-300 text-left"
              >
                <div
                  className={cn(
                    'flex shrink-0 flex-col items-center justify-center rounded-100 px-200 py-100',
                    isOpen ? 'bg-rose-500' : 'bg-gray-400',
                  )}
                >
                  <span className="font-designer-12r text-gray-0">Chapter</span>
                  <span className="font-designer-20b text-gray-0">
                    {String(chapter.chapterNumber).padStart(2, '0')}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-designer-18b text-gray-600">
                    {chapter.title}
                  </p>
                  {chapter.description && (
                    <p className="mt-75 font-designer-16r text-gray-600">
                      {chapter.description}
                    </p>
                  )}
                </div>
              </button>

              {isOpen && lessons.length > 0 && (
                <div className="px-300 pb-300">
                  <div className="border-t border-gray-200" />
                  <div className="mt-300 flex flex-col gap-300">
                    {lessons.map((lesson) => {
                      const row = (
                        <div className="flex items-center justify-between gap-200">
                          <div className="flex min-w-0 flex-1 flex-col gap-100">
                            <div className="flex items-center gap-150">
                              <span className="shrink-0 font-designer-16b text-rose-500">
                                LESSON {String(lesson.order).padStart(2, '0')}
                              </span>
                              <span className="truncate font-designer-16b text-gray-600">
                                {lesson.title}
                              </span>
                            </div>
                            <LessonStatusBadge lesson={lesson} />
                          </div>
                          <div className="flex shrink-0 items-center gap-25 text-rose-500">
                            <TimerIcon className="size-300" />
                            <span className="whitespace-nowrap font-designer-14r">
                              약 {lesson.estimatedMinutes} 분 소요
                            </span>
                          </div>
                        </div>
                      );

                      if (lesson.accessible && lesson.lessonId > 0) {
                        return (
                          <button
                            key={lesson.lessonId}
                            type="button"
                            className="w-full text-left"
                            onClick={() => onSelectLesson(lesson, chapter)}
                          >
                            {row}
                          </button>
                        );
                      }
                      return (
                        <div key={lesson.lessonId ?? lesson.order}>{row}</div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {hasMoreChapters && (
        <button
          type="button"
          onClick={onShowMore}
          className="mt-400 flex h-650 w-full items-center justify-center rounded-100 border border-gray-300 bg-gray-0 font-designer-16b text-gray-600"
        >
          더보기
        </button>
      )}
    </div>
  );
}
