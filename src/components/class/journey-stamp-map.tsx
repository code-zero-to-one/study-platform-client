'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Fragment } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import type {
  CourseCurriculumChapterResponse,
  CourseJourneyMapLessonResponse,
} from '@/types/api/course.types';
import { ChapterHeader } from './chapter-header';
import { type LessonDisplayInfo, mergeLessons } from './home-constants';
import { LessonStamp } from './lesson-stamp';

const LoginModal = dynamic(
  () => import('@/components/auth/modals/login-modal'),
);

const START_BUTTON = (
  <span className="flex h-450 w-1250 items-center justify-center rounded-100 bg-background-brand-default font-designer-20sb text-gray-0 md:w-1500">
    Start
  </span>
);

interface JourneyStampMapProps {
  slug: string;
  visibleChapters: CourseCurriculumChapterResponse[];
  lessonStatusMap: Map<number, CourseJourneyMapLessonResponse>;
  isAuthenticated: boolean;
  learnerCount: number;
  completedLessons: number;
  isCourseCompleted: boolean;
  hasMoreChapters: boolean;
  onShowMore: () => void;
  onSelectLesson: (
    lesson: LessonDisplayInfo,
    chapter: CourseCurriculumChapterResponse,
  ) => void;
}

function StartPill({
  slug,
  firstLessonId,
  isAuthenticated,
}: {
  slug: string;
  firstLessonId: number | null;
  isAuthenticated: boolean;
}) {
  return (
    <div className="absolute bottom-full left-1/2 z-10 flex -translate-x-1/2 flex-col items-center">
      {isAuthenticated && firstLessonId ? (
        <Link href={`/class/${slug}/lesson/${firstLessonId}`}>
          {START_BUTTON}
        </Link>
      ) : (
        <LoginModal
          openTrigger={<button type="button">{START_BUTTON}</button>}
        />
      )}
      <svg aria-hidden="true" width="21" height="24" viewBox="0 0 21 24">
        <polygon
          points="0,0 21,0 10.5,13"
          className="fill-background-brand-default"
        />
      </svg>
    </div>
  );
}

function FinishPill({ isCourseCompleted }: { isCourseCompleted: boolean }) {
  return (
    <div className="absolute left-1/2 top-full z-10 flex -translate-x-1/2 flex-col items-center">
      <svg aria-hidden="true" width="21" height="24" viewBox="0 0 21 24">
        <polygon
          points="10.5,0 0,13 21,13"
          className={cn(
            isCourseCompleted
              ? 'fill-background-brand-default'
              : 'fill-gray-300',
          )}
        />
      </svg>
      <button
        type="button"
        disabled={!isCourseCompleted}
        className={cn(
          'flex h-450 w-1250 items-center justify-center rounded-100 font-designer-20sb text-gray-0 md:w-1500',
          isCourseCompleted
            ? 'bg-background-brand-default'
            : 'cursor-not-allowed bg-gray-300',
        )}
      >
        Finish
      </button>
    </div>
  );
}

export function JourneyStampMap({
  slug,
  visibleChapters,
  lessonStatusMap,
  isAuthenticated,
  learnerCount,
  completedLessons,
  isCourseCompleted,
  hasMoreChapters,
  onShowMore,
  onSelectLesson,
}: JourneyStampMapProps) {
  const firstLessonId = visibleChapters[0]?.lessons[0]?.lessonId ?? null;

  return (
    <section className="relative w-full px-300 pb-600 pt-500 md:px-1000 md:pb-1500 md:pt-1750">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden bg-[url('/class/journey/dome.svg')] bg-[length:100%_100%] bg-no-repeat md:block"
      />

      {/* Stamp Challenge arc */}
      <div className="hidden justify-center md:flex">
        <svg
          viewBox="0 0 600 80"
          className="h-1000 w-7500 max-w-full"
          aria-hidden="true"
        >
          <defs>
            <path id="stamp-arc" d="M40 72 Q300 4 560 72" fill="none" />
          </defs>
          <text className="fill-gray-400 font-designer-16r tracking-[0.4em]">
            <textPath href="#stamp-arc" startOffset="50%" textAnchor="middle">
              Stamp Challenge
            </textPath>
          </text>
        </svg>
      </div>

      {/* Title */}
      <div className="mt-150 flex items-center justify-center gap-300">
        <span
          aria-hidden="true"
          className="hidden size-75 shrink-0 rounded-full bg-gray-300 md:block"
        />
        <h3 className="text-center font-designer-20b text-gray-800 md:font-designer-28b">
          레슨을 들으시면 제로와 워니의
          <br />
          <span className="text-rose-500">스탬프</span>를 채울 수 있어요!
        </h3>
        <span
          aria-hidden="true"
          className="hidden size-75 shrink-0 rounded-full bg-gray-300 md:block"
        />
      </div>

      <div className="mt-600 flex flex-col gap-1000">
        {visibleChapters.map((chapter, ci) => {
          const lessons = mergeLessons(chapter, lessonStatusMap);
          const isLastChapter = ci === visibleChapters.length - 1;

          return (
            <div
              key={chapter.order}
              className={cn(
                'flex flex-col gap-600',
                ci === 0 && 'gap-800 md:gap-600',
              )}
            >
              <ChapterHeader
                chapterNumber={chapter.chapterNumber}
                title={chapter.title}
              />
              <div className="flex justify-center">
                <div className="grid grid-cols-1 place-items-center gap-y-500 md:grid-cols-3 md:gap-x-1500 md:gap-y-1000">
                  {lessons.map((lesson, li) => {
                    const isFirstStamp = ci === 0 && li === 0;
                    const isLastStamp =
                      isLastChapter &&
                      li === lessons.length - 1 &&
                      !hasMoreChapters;

                    return (
                      <Fragment key={lesson.lessonId}>
                        <div
                          className={cn(
                            'relative',
                            !isFirstStamp &&
                              'before:absolute before:bottom-full before:left-1/2 before:h-500 before:w-0 before:-translate-x-1/2 before:border-l-2 before:border-dashed before:border-rose-200 before:content-[""] md:before:hidden',
                          )}
                        >
                          {isFirstStamp && (
                            <StartPill
                              slug={slug}
                              firstLessonId={firstLessonId}
                              isAuthenticated={isAuthenticated}
                            />
                          )}
                          <LessonStamp
                            lesson={lesson}
                            chapterNumber={chapter.chapterNumber}
                            isAuthenticated={isAuthenticated}
                            onSelect={(l) => onSelectLesson(l, chapter)}
                            shouldBlink={
                              completedLessons === 0 && ci === 0 && li === 0
                            }
                            learnerCount={learnerCount}
                          />
                          {isLastStamp && (
                            <FinishPill isCourseCompleted={isCourseCompleted} />
                          )}
                        </div>
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMoreChapters && (
        <div className="mt-1000 flex justify-center">
          <button
            type="button"
            onClick={onShowMore}
            className="h-750 w-full rounded-100 border border-gray-400 font-designer-16r text-gray-800 hover:bg-gray-50 active:bg-gray-50 md:w-7125"
          >
            더보기
          </button>
        </div>
      )}
    </section>
  );
}
