'use client';

import { ChevronUp, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@/components/common/ui/(shadcn)/ui/drawer';
import {
  LockIcon,
  LockOpenIcon,
} from '@/components/common/ui/icons/course-icons';
import { Skeleton } from '@/components/common/ui/loading-skeleton';
import { useMediaQuery } from '@/hooks/use-media-query';
import type {
  CourseDrawerChapterResponse,
  CourseDrawerLessonResponse,
} from '@/types/api/course.types';

interface Props {
  open: boolean;
  onClose: () => void;
  courseTitle: string;
  courseSlug: string;
  chapters: CourseDrawerChapterResponse[];
  expandedChapters: Set<number>;
  onToggleChapter: (chapterId: number) => void;
  isLoading?: boolean;
}

const ASSET = '/class/curriculum';

function LessonBadge({ lesson }: { lesson: CourseDrawerLessonResponse }) {
  const accessible = !lesson.isLocked;

  if (lesson.isFree) {
    return (
      <div
        className={cn(
          'flex h-250 w-500 shrink-0 items-center justify-center rounded-50',
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
        'flex h-250 w-500 shrink-0 items-center justify-center rounded-50',
        accessible
          ? 'border border-gray-300 bg-gray-300'
          : 'border border-gray-300 bg-background-default',
      )}
    >
      {accessible ? (
        <LockOpenIcon
          className="size-250 text-gray-400"
          aria-label="잠금 해제"
        />
      ) : (
        <LockIcon className="size-250 text-gray-400" aria-label="잠금" />
      )}
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
      className="flex w-full items-center justify-between border-b border-gray-200 bg-gray-100 px-375 py-250"
    >
      <div className="flex min-w-0 items-center gap-150">
        {allCompleted ? (
          <div className="flex shrink-0 size-525 items-center justify-center overflow-hidden rounded-100 bg-rose-300">
            <Image
              src={`${ASSET}/edit-note.svg`}
              alt=""
              aria-hidden="true"
              width={32}
              height={26}
            />
          </div>
        ) : (
          <LockIcon className="size-525 shrink-0" />
        )}
        <div className="flex min-w-0 flex-col items-start gap-25">
          <p className="font-designer-14b text-text-brand">
            Chapter {String(chapter.order).padStart(2, '0')}
          </p>
          <p className="break-words font-designer-18b text-gray-800">
            {chapter.title}
          </p>
        </div>
      </div>
      <ChevronUp
        aria-hidden="true"
        className={cn(
          'size-300 shrink-0 text-gray-800 transition-transform',
          !expanded && 'rotate-180',
        )}
      />
    </button>
  );
}

function ChapterLessons({
  lessons,
  courseSlug,
}: {
  lessons: CourseDrawerLessonResponse[];
  courseSlug: string;
}) {
  return (
    <div className="relative bg-background-default pb-250 pt-375">
      <div className="absolute bottom-250 left-625 top-0 w-px bg-gray-300" />
      <ul className="flex flex-col">
        {lessons.map((lesson) => {
          const isCurrent = lesson.isCurrentLesson;
          const lessonNumber = `Lesson ${String(lesson.order).padStart(2, '0')}`;
          const titleText = lesson.title.replace(/^Lesson\s*0?\d+\.?\s*/i, '');
          return (
            <li key={lesson.lessonId}>
              <Link
                href={`/class/${courseSlug}/lesson/${lesson.lessonId}`}
                className="relative flex min-w-0 items-center gap-200 py-175 pl-550"
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
                    'min-w-0 flex-1',
                    isCurrent
                      ? 'font-designer-14b text-text-brand'
                      : 'font-designer-14r text-gray-400',
                  )}
                >
                  <span className="mr-100">{lessonNumber}</span>
                  <span className="break-words">{titleText}</span>
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
  courseSlug,
  chapters,
  expandedChapters,
  onToggleChapter,
  isLoading = false,
}: Props) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const direction = isDesktop ? 'left' : 'bottom';

  return (
    <Drawer
      open={open}
      onOpenChange={(o) => !o && onClose()}
      direction={direction}
      // remount on breakpoint cross so vaul re-evaluates the drag axis
      key={direction}
    >
      <DrawerContent
        className={cn(
          'flex flex-col border-0 bg-background-default p-0 shadow-2',
          isDesktop ? 'h-full w-5250 max-w-none rounded-none' : 'h-[85vh]',
        )}
      >
        <DrawerDescription className="sr-only">
          코스 챕터별 레슨 목록
        </DrawerDescription>
        <div className="relative px-375 pb-300 pt-375">
          <DrawerTitle className="font-designer-24b text-gray-800">
            커리큘럼
          </DrawerTitle>
          {isLoading ? (
            <Skeleton className="mt-400 h-375 w-4000" />
          ) : (
            <p className="mt-400 font-designer-20b text-gray-800">
              {courseTitle}
            </p>
          )}
          <p className="mt-50 font-designer-14r text-gray-800">
            수강기한 무제한
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="커리큘럼 닫기"
            className="absolute right-375 top-375 flex size-375 items-center justify-center text-gray-800"
          >
            <X className="size-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-375 py-250"
                >
                  <div className="flex items-center gap-150">
                    <Skeleton className="size-525 shrink-0" />
                    <div className="flex flex-col gap-25">
                      <Skeleton className="h-200 w-1250" />
                      <Skeleton className="h-250 w-3000" />
                    </div>
                  </div>
                  <Skeleton className="size-300 shrink-0" />
                </div>
              ))
            : chapters.map((chapter) => {
                const isCompleted = chapter.lessons.every(
                  (l) => l.status === 'COMPLETED',
                );
                const expanded = expandedChapters.has(chapter.chapterId);
                return (
                  <div key={chapter.chapterId}>
                    <ChapterHeader
                      chapter={chapter}
                      allCompleted={isCompleted}
                      expanded={expanded}
                      onToggle={() => onToggleChapter(chapter.chapterId)}
                    />
                    {expanded && (
                      <ChapterLessons
                        lessons={chapter.lessons}
                        courseSlug={courseSlug}
                      />
                    )}
                  </div>
                );
              })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
