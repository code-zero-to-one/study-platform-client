'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import type {
  CourseDrawerChapterResponse,
  CourseDrawerLessonResponse,
} from '@/types/api/course.types';

interface Props {
  open: boolean;
  onClose: () => void;
  courseTitle: string;
  chapters: CourseDrawerChapterResponse[];
  expandedChapters: Set<number>;
  onToggleChapter: (chapterId: number) => void;
  currentLessonId: number;
}

const ASSET = '/class/vibe-intro/curriculum';

function LessonBadge({ lesson }: { lesson: CourseDrawerLessonResponse }) {
  const accessible = !lesson.isLocked;

  if (lesson.isFree) {
    return (
      <div
        className={cn(
          'flex h-[20px] w-[40px] shrink-0 items-center justify-center rounded-50',
          accessible
            ? 'bg-rose-300'
            : 'border border-gray-300 bg-background-default',
        )}
      >
        <span
          className={cn(
            'font-designer-12b',
            accessible ? 'text-text-inverse' : 'text-gray-400',
          )}
        >
          무료
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-[20px] w-[40px] shrink-0 items-center justify-center rounded-50',
        accessible
          ? 'border border-gray-300 bg-gray-300'
          : 'border border-gray-300 bg-background-default',
      )}
    >
      <Image
        src={`${ASSET}/${accessible ? 'lock-open.svg' : 'lesson-lock-icon.svg'}`}
        alt={accessible ? '잠금 해제' : '잠금'}
        width={14}
        height={14}
      />
    </div>
  );
}

function ChapterHeader({
  chapter,
  allCompleted,
  expanded,
  onToggle,
}: {
  chapter: CourseDrawerChapterResponse;
  allCompleted: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between border-b border-gray-200 bg-gray-100 px-[30px] py-[20px]"
    >
      <div className="flex items-center gap-[11px]">
        <Image
          src={`${ASSET}/${allCompleted ? 'edit-note.svg' : 'chapter-lock.svg'}`}
          alt=""
          aria-hidden="true"
          width={42}
          height={42}
          className="shrink-0"
        />
        <div className="flex flex-col items-start gap-[2px]">
          <p className="font-designer-14b text-text-brand">
            Chapter {String(chapter.order).padStart(2, '0')}
          </p>
          <p className="font-designer-18b text-gray-800">{chapter.title}</p>
        </div>
      </div>
      <Image
        src={`${ASSET}/chevron-up.svg`}
        alt=""
        aria-hidden="true"
        width={24}
        height={24}
        className={cn('transition-transform', !expanded && 'rotate-180')}
      />
    </button>
  );
}

function ChapterLessons({
  lessons,
  currentLessonId,
}: {
  lessons: CourseDrawerLessonResponse[];
  currentLessonId: number;
}) {
  return (
    <div className="relative bg-background-default pb-[20px] pt-[30px]">
      <div
        className="absolute bottom-[20px] top-[10px] w-px bg-gray-300"
        style={{ left: 50 }}
      />
      <ul className="flex flex-col">
        {lessons.map((lesson) => {
          const isCurrent = lesson.lessonId === currentLessonId;
          const lessonNumber = `Lesson ${String(lesson.order).padStart(2, '0')}`;
          const titleText = lesson.title.replace(/^Lesson\s*0?\d+\.?\s*/i, '');
          return (
            <li key={lesson.lessonId} className="h-[51px]">
              <Link
                href={`/class/vibe-intro/lesson/${lesson.lessonId}`}
                className="relative flex h-full items-center gap-[10px]"
                style={{ paddingLeft: 44 }}
              >
                <Image
                  src={`${ASSET}/${isCurrent ? 'marker-active.svg' : 'marker-default.svg'}`}
                  alt=""
                  aria-hidden="true"
                  width={12}
                  height={12}
                  className="relative z-10 shrink-0"
                />
                <LessonBadge lesson={lesson} />
                <div
                  className={cn(
                    'flex items-center gap-100 whitespace-nowrap',
                    isCurrent
                      ? 'font-designer-14b text-text-brand'
                      : 'font-designer-14r text-gray-400',
                  )}
                >
                  <span>{lessonNumber}</span>
                  <span>{titleText}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CurriculumDrawer({
  open,
  onClose,
  courseTitle,
  chapters,
  expandedChapters,
  onToggleChapter,
  currentLessonId,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex h-full w-[400px] flex-col bg-background-default shadow-2">
        <div className="relative px-[30px] pb-[24px] pt-[30px]">
          <p className="font-designer-24b text-gray-800">커리큘럼</p>
          <p className="mt-[24px] font-designer-20b text-gray-800">
            {courseTitle}
          </p>
          <p className="mt-[6px] font-designer-14r text-gray-800">
            수강기한 무제한
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="커리큘럼 닫기"
            className="absolute right-[30px] top-[30px] flex h-[30px] w-[30px] items-center justify-center text-gray-800"
          >
            <X className="h-[24px] w-[24px]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chapters.map((chapter) => {
            const allCompleted = chapter.lessons.every(
              (l) => l.status === 'COMPLETED',
            );
            const expanded = expandedChapters.has(chapter.chapterId);
            return (
              <div key={chapter.chapterId}>
                <ChapterHeader
                  chapter={chapter}
                  allCompleted={allCompleted}
                  expanded={expanded}
                  onToggle={() => onToggleChapter(chapter.chapterId)}
                />
                {expanded && (
                  <ChapterLessons
                    lessons={chapter.lessons}
                    currentLessonId={currentLessonId}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        aria-label="커리큘럼 닫기"
        onClick={onClose}
        className="flex-1 bg-gray-1000/40"
      />
    </div>
  );
}
