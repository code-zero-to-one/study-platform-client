'use client';

import { BookOpen, Lock, LockOpen, Timer, Users } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useAuth } from '@/features/auth/model/use-auth';
import {
  useGetCourseCurriculum,
  useGetCourseDetail,
  useGetCourseJourneyMap,
  useGetCourseProgress,
} from '@/hooks/queries/course/course-api';
import type {
  CourseCurriculumChapterResponse,
  CourseJourneyMapLessonResponse,
  LessonProgressStatus,
} from '@/types/api/course.types';

const LoginModal = dynamic(
  () => import('@/components/auth/modals/login-modal'),
);

const COURSE_SLUG = 'vibe-intro';

const FALLBACK_CHAPTERS: CourseCurriculumChapterResponse[] = [
  {
    chapterId: -1,
    order: 1,
    chapterNumber: 1,
    title: '시작하기',
    description: null,
    estimatedMinutes: 0,
    lessons: [
      {
        lessonId: -1,
        order: 1,
        title: 'Lesson 01',
        description: null,
        isFree: true,
        locked: false,
        estimatedMinutes: 18,
      },
      {
        lessonId: -2,
        order: 2,
        title: 'Lesson 02',
        description: null,
        isFree: true,
        locked: false,
        estimatedMinutes: 18,
      },
      {
        lessonId: -3,
        order: 3,
        title: 'Lesson 03',
        description: null,
        isFree: true,
        locked: false,
        estimatedMinutes: 18,
      },
    ],
  },
  {
    chapterId: -2,
    order: 2,
    chapterNumber: 2,
    title: '심화하기',
    description: null,
    estimatedMinutes: 0,
    lessons: [
      {
        lessonId: -4,
        order: 4,
        title: 'Lesson 04',
        description: null,
        isFree: false,
        locked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -5,
        order: 5,
        title: 'Lesson 05',
        description: null,
        isFree: false,
        locked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -6,
        order: 6,
        title: 'Lesson 06',
        description: null,
        isFree: false,
        locked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -7,
        order: 7,
        title: 'Lesson 07',
        description: null,
        isFree: false,
        locked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -8,
        order: 8,
        title: 'Lesson 08',
        description: null,
        isFree: false,
        locked: true,
        estimatedMinutes: 18,
      },
    ],
  },
  {
    chapterId: -3,
    order: 3,
    chapterNumber: 3,
    title: '완성하기',
    description: null,
    estimatedMinutes: 0,
    lessons: [
      {
        lessonId: -9,
        order: 9,
        title: 'Lesson 09',
        description: null,
        isFree: false,
        locked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -10,
        order: 10,
        title: 'Lesson 10',
        description: null,
        isFree: false,
        locked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -11,
        order: 11,
        title: 'Lesson 11',
        description: null,
        isFree: false,
        locked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -12,
        order: 12,
        title: 'Lesson 12',
        description: null,
        isFree: false,
        locked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -13,
        order: 13,
        title: 'Lesson 13',
        description: null,
        isFree: false,
        locked: true,
        estimatedMinutes: 18,
      },
    ],
  },
];

interface LessonDisplayInfo {
  lessonId: number;
  order: number;
  title: string;
  isFree: boolean;
  status: LessonProgressStatus;
  accessible: boolean;
  estimatedMinutes: number;
}

function buildLessonMap(
  journeyLessons: CourseJourneyMapLessonResponse[],
): Map<number, CourseJourneyMapLessonResponse> {
  const map = new Map<number, CourseJourneyMapLessonResponse>();
  journeyLessons.forEach((l) => map.set(l.lessonId, l));
  return map;
}

function mergeLessons(
  chapter: CourseCurriculumChapterResponse,
  journeyMap: Map<number, CourseJourneyMapLessonResponse>,
): LessonDisplayInfo[] {
  return chapter.lessons.map((l) => {
    const journeyLesson = journeyMap.get(l.lessonId);
    return {
      lessonId: l.lessonId,
      order: l.order,
      title: l.title,
      isFree: l.isFree,
      status: journeyLesson?.status ?? (l.locked ? 'LOCKED' : 'IN_PROGRESS'),
      accessible: journeyLesson?.accessible ?? !l.locked,
      estimatedMinutes: l.estimatedMinutes,
    };
  });
}

function LessonStamp({
  lesson,
  isAuthenticated,
}: {
  lesson: LessonDisplayInfo;
  isAuthenticated: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isCompleted = lesson.status === 'COMPLETED';
  const isLocked = lesson.status === 'LOCKED';
  const isCurrent = lesson.status === 'IN_PROGRESS' && lesson.accessible;

  const stampContent = (
    <div
      className="relative flex size-1650 shrink-0 flex-col items-center justify-center"
      onMouseEnter={() => !isCompleted && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Image
        src="/class/vibe-intro/lesson-stamp.svg"
        alt=""
        aria-hidden="true"
        width={132}
        height={132}
        className={cn(
          'absolute inset-0',
          isCompleted && 'brightness-110 saturate-150',
          isCurrent && 'animate-pulse',
        )}
      />
      <div className="relative z-10 flex flex-col items-center">
        {lesson.isFree && !isCompleted && !isLocked && (
          <p className="mb-25 font-designer-16m text-gray-500">무료 온보딩</p>
        )}
        {isLocked && <Lock className="mb-25 size-300 text-gray-500" />}
        {isCompleted && (
          <p className="mb-25 font-designer-12b text-text-brand">완료</p>
        )}
        <p
          className={cn(
            'font-designer-18b',
            isCompleted ? 'text-text-brand' : 'text-gray-500',
          )}
        >
          Lesson
        </p>
        <p
          className={cn(
            'font-designer-18b',
            isCompleted ? 'text-text-brand' : 'text-gray-500',
          )}
        >
          {String(lesson.order).padStart(2, '0')}
        </p>
      </div>
      {showTooltip && (
        <div className="absolute -top-400 left-1/2 flex -translate-x-1/2 items-center gap-75 rounded-100 bg-gray-900 px-150 py-75">
          <Users className="size-200 text-gray-0" />
          <span className="font-designer-12r text-gray-0">학습 중</span>
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
      <Link href={`/class/vibe-intro/lesson/${lesson.lessonId}`}>
        {stampContent}
      </Link>
    );
  }

  return (
    <div aria-disabled="true" className="cursor-not-allowed">
      {stampContent}
    </div>
  );
}

function ChapterHeader({
  chapterNumber,
  title,
}: {
  chapterNumber: number;
  title: string;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-250">
      <div className="relative flex w-full items-center">
        <div className="h-px flex-1 bg-rose-500" />
        <div className="mx-0 flex items-center gap-125 rounded-full border border-rose-500 bg-background-default px-250 py-125">
          <BookOpen className="h-300 w-300 text-text-brand" />
          <p className="font-designer-24b text-text-brand">
            Chapter {String(chapterNumber).padStart(2, '0')}
          </p>
        </div>
        <div className="h-px flex-1 bg-rose-500" />
      </div>
      <p className="font-designer-20b text-text-brand">{title}</p>
    </div>
  );
}

export default function JourneyMapPage() {
  const { isAuthenticated } = useAuth();
  const { data: course } = useGetCourseDetail(COURSE_SLUG);
  const courseId = course?.courseId ?? 0;

  const { data: curriculum, isLoading } = useGetCourseCurriculum(COURSE_SLUG);
  const { data: journeyMap } = useGetCourseJourneyMap(courseId);
  const { data: progress } = useGetCourseProgress(courseId);
  const [visibleChapterCount, setVisibleChapterCount] = useState(2);

  const lessonStatusMap = buildLessonMap(journeyMap?.lessons ?? []);
  const chapters =
    curriculum?.chapters && curriculum.chapters.length > 0
      ? curriculum.chapters
      : FALLBACK_CHAPTERS;

  const completedLessons = progress?.completedLessons ?? 0;
  const totalLessons = progress?.totalLessons ?? 0;
  const progressRate = progress?.progressRate ?? 0;

  const visibleChapters = chapters.slice(0, visibleChapterCount);
  const hasMoreChapters = visibleChapterCount < chapters.length;

  if (isLoading) {
    return (
      <div className="flex min-h-5000 items-center justify-center">
        <p className="font-designer-16r text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-800">
      <div className="mx-auto max-w-page px-600 pt-500">
        {/* Course badge */}
        <div className="flex justify-center">
          <span className="rounded-full bg-rose-300 px-250 py-125 font-designer-20b text-white">
            {course?.title ?? ''}
          </span>
        </div>

        {/* Title */}
        <div className="mt-300 flex flex-col items-center gap-125 text-center text-gray-800">
          <h1 className="font-designer-36b">
            한 레슨씩, 순서대로 따라와주세요.
          </h1>
          <p className="font-designer-20r">
            매 레슨을 완료하면 다음 길이 열려요.
          </p>
        </div>

        {/* Progress */}
        <div className="mt-300 flex items-center gap-300">
          <div className="relative shrink-0">
            <Image
              src="/class/vibe-intro/chapter-progress.svg"
              alt="진도 표시"
              width={173}
              height={61}
            />
            <p className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center font-designer-20b text-text-brand">
              {completedLessons === 0
                ? `Chapter 01  시작!`
                : `${completedLessons}개 완료!`}
            </p>
          </div>
          <div className="flex-1">
            <div className="relative h-250 overflow-hidden rounded-full bg-gray-200">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-background-brand-default transition-all"
                style={{ width: `${progressRate}%` }}
              />
            </div>
          </div>
          <p className="shrink-0 font-designer-24b text-gray-1000">
            {completedLessons} / {totalLessons || 20}
          </p>
        </div>

        {/* Free trial callout */}
        {course?.freeLessonCount && course.freeLessonCount > 0 ? (
          <div className="mt-300 flex flex-col gap-75 rounded-200 border border-border-default bg-gray-100 px-350 py-300">
            <p className="font-designer-20b text-gray-800">
              Chapter3까지 무료 코스! 마음껏 학습하세요.
            </p>
            <p className="font-designer-16m text-gray-800">
              이후 결제는 무료 온보딩을 하시고 결정하셔도 늦지 않습니다.
            </p>
          </div>
        ) : null}

        {/* Journey map */}
        <div className="mt-500 flex flex-col items-center">
          {visibleChapters.map((chapter, ci) => {
            const lessons = mergeLessons(chapter, lessonStatusMap);

            const rows: LessonDisplayInfo[][] = [];
            for (let i = 0; i < lessons.length; i += 3) {
              rows.push(lessons.slice(i, i + 3));
            }

            return (
              <div
                key={chapter.order}
                className="flex w-full flex-col items-center"
              >
                <div className="mt-400 w-full">
                  <ChapterHeader
                    chapterNumber={chapter.chapterNumber}
                    title={chapter.title}
                  />
                </div>

                {rows.map((row, ri) => (
                  <div key={ri} className="flex w-full flex-col items-center">
                    <div
                      className={cn(
                        'relative flex items-center justify-center',
                        ci === 0 && ri === 0 ? 'mt-800' : 'mt-300',
                      )}
                    >
                      {ci === 0 && ri === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Image
                            src="/class/vibe-intro/journey-1st-load.svg"
                            alt=""
                            aria-hidden="true"
                            width={795}
                            height={10}
                          />
                        </div>
                      )}
                      <div
                        className={cn(
                          'relative z-10 flex items-center justify-center gap-2500',
                          ri % 2 === 1 && 'flex-row-reverse',
                        )}
                      >
                        {row.map((lesson, li) => (
                          <div key={lesson.lessonId} className="relative">
                            {ci === 0 && ri === 0 && li === 0 && (
                              <div className="absolute bottom-full left-1/2 flex -translate-x-1/2 flex-col items-center">
                                {isAuthenticated ? (
                                  <Link
                                    href={
                                      chapters[0]?.lessons[0]
                                        ? `/class/vibe-intro/lesson/${chapters[0].lessons[0].lessonId}`
                                        : '#'
                                    }
                                    className="flex h-450 w-1250 items-center justify-center rounded-100 bg-background-brand-default font-designer-24b text-gray-0"
                                  >
                                    Start
                                  </Link>
                                ) : (
                                  <LoginModal
                                    openTrigger={
                                      <button
                                        type="button"
                                        className="flex h-450 w-1250 items-center justify-center rounded-100 bg-background-brand-default font-designer-24b text-gray-0"
                                      >
                                        Start
                                      </button>
                                    }
                                  />
                                )}
                                <svg
                                  aria-hidden="true"
                                  width="21"
                                  height="24"
                                  viewBox="0 0 21 24"
                                >
                                  <polygon
                                    points="0,0 21,0 10.5,13"
                                    className="fill-background-brand-default"
                                  />
                                </svg>
                              </div>
                            )}
                            <LessonStamp
                              lesson={lesson}
                              isAuthenticated={isAuthenticated}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    {ri < rows.length - 1 && (
                      <div className="flex justify-center">
                        {ri % 2 === 0 ? (
                          <Image
                            src="/class/vibe-intro/journey-load.svg"
                            alt=""
                            aria-hidden="true"
                            width={906}
                            height={388}
                          />
                        ) : (
                          <Image
                            src="/class/vibe-intro/journey-load-reverse.svg"
                            alt=""
                            aria-hidden="true"
                            width={906}
                            height={319}
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {ci < visibleChapters.length - 1 && (
                  <div className="flex justify-center">
                    <Image
                      src="/class/vibe-intro/journey-load.svg"
                      alt=""
                      aria-hidden="true"
                      width={906}
                      height={388}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {hasMoreChapters ? (
            <div className="mt-500">
              <button
                type="button"
                onClick={() =>
                  setVisibleChapterCount((prev) =>
                    Math.min(prev + 2, chapters.length),
                  )
                }
                className="rounded-100 border border-gray-400 px-400 py-200 font-designer-16r text-gray-800"
              >
                더보기
              </button>
            </div>
          ) : (
            <div className="mt-400">
              <button
                type="button"
                disabled={!progress?.isCourseCompleted}
                className={cn(
                  'flex h-450 w-1250 items-center justify-center rounded-100 font-designer-24b text-white',
                  progress?.isCourseCompleted
                    ? 'bg-background-brand-default'
                    : 'cursor-not-allowed bg-gray-300',
                )}
              >
                Finish
              </button>
            </div>
          )}
        </div>

        {/* Lesson card list */}
        <div className="mt-800">
          <h2 className="font-designer-28b text-gray-800">레슨 목록</h2>
          <div className="mt-400 flex flex-col gap-200">
            {chapters.flatMap((chapter) =>
              chapter.lessons.map((l) => {
                const journeyLesson = lessonStatusMap.get(l.lessonId);
                const isAccessible = journeyLesson?.accessible ?? !l.locked;
                const isCompleted = journeyLesson?.status === 'COMPLETED';

                const card = (
                  <div
                    className={cn(
                      'flex h-1250 items-center gap-300 rounded-200 border px-500 transition-colors',
                      isAccessible
                        ? 'cursor-pointer border-gray-300 bg-gray-50 hover:border-border-brand'
                        : 'cursor-not-allowed border-gray-300 bg-gray-50 opacity-60',
                    )}
                  >
                    <div
                      className={cn(
                        'flex size-550 shrink-0 items-center justify-center rounded-50 font-designer-16b text-gray-0',
                        isCompleted
                          ? 'bg-background-brand-default'
                          : 'bg-gray-400',
                      )}
                    >
                      {String(l.order).padStart(2, '0')}
                    </div>
                    <div className="flex flex-1 flex-col gap-50">
                      <p
                        className={cn(
                          'font-designer-16b',
                          isCompleted ? 'text-text-brand' : 'text-gray-800',
                        )}
                      >
                        {l.title}
                      </p>
                      <div className="flex items-center gap-150">
                        {l.isFree && (
                          <span className="rounded-50 bg-rose-100 px-150 py-25 font-designer-12b text-text-brand">
                            무료
                          </span>
                        )}
                        <span className="flex items-center gap-50 font-designer-12r text-gray-500">
                          <Timer className="size-200" />
                          {l.estimatedMinutes}분
                        </span>
                      </div>
                    </div>
                    {isCompleted ? (
                      <LockOpen className="size-300 shrink-0 text-text-brand" />
                    ) : isAccessible ? (
                      <LockOpen className="size-300 shrink-0 text-gray-400" />
                    ) : (
                      <Lock className="size-300 shrink-0 text-gray-400" />
                    )}
                  </div>
                );

                if (isAccessible && l.lessonId > 0) {
                  return (
                    <Link
                      key={l.lessonId}
                      href={`/class/vibe-intro/lesson/${l.lessonId}`}
                    >
                      {card}
                    </Link>
                  );
                }

                return <div key={l.lessonId ?? l.order}>{card}</div>;
              }),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
