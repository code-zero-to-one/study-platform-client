'use client';

import { BookOpen, Lock, LockOpen, Timer, Users } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  Dialog,
  DialogContent,
} from '@/components/common/ui/(shadcn)/ui/dialog';
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
      accessible: journeyLesson?.isAccessible ?? !l.locked,
      estimatedMinutes: l.estimatedMinutes,
    };
  });
}

interface LessonPreviewModalProps {
  open: boolean;
  onClose: () => void;
  lesson: LessonDisplayInfo;
  chapter: CourseCurriculumChapterResponse;
  learnerCount: number;
  onStart: () => void;
  onSkip: () => void;
}

function LessonPreviewModal({
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
          <div className="flex shrink-0 items-center gap-50 rounded-full border border-gray-200 bg-white px-375 py-150">
            <div className="flex items-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'size-300 rounded-full border border-background-brand-default bg-white',
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
            이 레슨에서 무엇을 배우는지 확인하고 시작해요.
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
            className="h-625 w-full rounded-100 bg-background-brand-default font-designer-14b text-white"
          >
            시작하기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LessonStamp({
  lesson,
  isAuthenticated,
  onSelect,
}: {
  lesson: LessonDisplayInfo;
  isAuthenticated: boolean;
  onSelect: (lesson: LessonDisplayInfo) => void;
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
        <div className="absolute -top-400 left-1/2 flex -translate-x-1/2 items-center gap-75 whitespace-nowrap rounded-100 bg-gray-900 px-150 py-75">
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
  const router = useRouter();
  const [visibleChapterCount, setVisibleChapterCount] = useState(2);
  const [selectedLesson, setSelectedLesson] = useState<{
    lesson: LessonDisplayInfo;
    chapter: CourseCurriculumChapterResponse;
  } | null>(null);

  const lessonStatusMap = buildLessonMap(journeyMap?.lessons ?? []);
  const chapters =
    curriculum?.chapters && curriculum.chapters.length > 0
      ? curriculum.chapters
      : FALLBACK_CHAPTERS;

  const completedLessons = progress?.completedLessons ?? 0;
  const totalLessons = progress?.totalLessons ?? 0;
  const progressRate = progress?.progressRate ?? 0;

  const nextAccessibleLesson = journeyMap?.lessons.find(
    (l) => l.status !== 'COMPLETED' && l.isAccessible,
  );

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

        {/* 안내창 — Variant A: free trial in progress */}
        {course?.viewerStatus === 'FREE_ENROLLED' &&
        completedLessons < (course.freeLessonCount ?? 0) ? (
          <div className="mt-300 flex flex-col gap-75 rounded-200 border border-gray-300 bg-gray-100 px-350 py-300">
            <p className="font-designer-20b text-gray-800">
              Chapter3까지 무료 코스! 마음껏 학습하세요.
            </p>
            <p className="font-designer-16m text-gray-800">
              이후 결제는 무료 온보딩을 하시고 결정하셔도 늦지 않습니다.
            </p>
          </div>
        ) : /* Variant B: free trial done → payment CTA */
        course?.viewerStatus === 'FREE_ENROLLED' &&
          completedLessons >= (course.freeLessonCount ?? 0) &&
          course?.canPurchase ? (
          <div className="mt-300 flex flex-col gap-150 rounded-200 border border-gray-300 bg-gray-100 px-350 py-300">
            <div className="flex flex-col gap-75">
              <p className="font-designer-20b text-gray-800">
                무료 온보딩을 완료했어요! 이제 전체 강의를 시작해보세요.
              </p>
              <p className="font-designer-16m text-gray-800">
                결제 후 모든 레슨에 바로 접근할 수 있어요.
              </p>
            </div>
            <Link
              href={`/payment/${courseId}?type=course&planCode=${course.plans?.[0]?.planCode ?? 'ALL_IN_ONE'}`}
              className="flex h-650 w-full items-center justify-center rounded-100 bg-background-brand-default font-designer-16b text-white"
            >
              결제하기
            </Link>
          </div>
        ) : /* Variant C: paid user → next lesson info */
        course?.viewerStatus === 'PAID' && nextAccessibleLesson ? (
          <div className="mt-300 flex items-center gap-300 rounded-200 border border-gray-300 bg-gray-100 px-350 py-300">
            <div className="flex shrink-0 flex-col items-center justify-center rounded-100 bg-background-brand-default px-150 py-75 text-white">
              <span className="font-designer-12b">Lesson</span>
              <span className="font-designer-12b">
                {String(nextAccessibleLesson.order).padStart(2, '0')}
              </span>
            </div>
            <div className="flex flex-col gap-50">
              <p className="font-designer-20b text-gray-800">
                NEXT → Lesson{' '}
                {String(nextAccessibleLesson.order).padStart(2, '0')} -{' '}
                {nextAccessibleLesson.title}
              </p>
              <p className="font-designer-16m text-gray-800">
                다음 레슨을 이어서 학습해보세요.
              </p>
            </div>
          </div>
        ) : null}

        {/* Journey map */}
        <div className="mt-500 flex flex-col items-center">
          {visibleChapters.map((chapter, index) => {
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
                <div className="relative z-10 mt-400 w-full">
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
                        index === 0 && ri === 0
                          ? 'mt-800'
                          : ri === 0
                            ? 'mt-300'
                            : '',
                      )}
                    >
                      {index === 0 && ri === 0 && (
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
                            {index === 0 && ri === 0 && li === 0 && (
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
                              onSelect={(l) =>
                                setSelectedLesson({
                                  lesson: l,
                                  chapter,
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>
                      {ri === rows.length - 1 &&
                        index < visibleChapters.length - 1 && (
                          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2">
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
                    {ri < rows.length - 1 && (
                      <div className="-mt-825 -mb-825 flex justify-center">
                        <Image
                          src="/class/vibe-intro/journey-load-reverse.svg"
                          alt=""
                          aria-hidden="true"
                          width={906}
                          height={319}
                          className={cn(ri % 2 === 0 && '-scale-x-100')}
                        />
                      </div>
                    )}
                  </div>
                ))}
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
                className="h-750 w-7125 rounded-100 border border-gray-400 font-designer-16r text-gray-800"
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
                  'flex h-550 w-1250 items-center justify-center rounded-100 font-designer-24b text-white',
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
                const isAccessible = journeyLesson?.isAccessible ?? !l.locked;
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

      {selectedLesson && (
        <LessonPreviewModal
          open={true}
          onClose={() => setSelectedLesson(null)}
          lesson={selectedLesson.lesson}
          chapter={selectedLesson.chapter}
          learnerCount={course?.learnerCount ?? 0}
          onStart={() => {
            router.push(
              `/class/vibe-intro/lesson/${selectedLesson.lesson.lessonId}`,
            );
            setSelectedLesson(null);
          }}
          onSkip={() => {
            const nextAccessible = journeyMap?.lessons.find(
              (l) =>
                l.lessonId !== selectedLesson.lesson.lessonId && l.isAccessible,
            );
            if (nextAccessible) {
              router.push(
                `/class/vibe-intro/lesson/${nextAccessible.lessonId}`,
              );
            }
            setSelectedLesson(null);
          }}
        />
      )}

      {/* Sticky payment CTA for free-enrolled users */}
      {course?.viewerStatus === 'FREE_ENROLLED' && course?.canPurchase && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-subtle bg-background-default px-600 py-300 shadow-3">
          <div className="mx-auto flex max-w-page items-center justify-between gap-300">
            <div className="flex flex-col gap-25">
              <p className="font-designer-16b text-gray-1000">
                전체 강의 무제한 수강
              </p>
              <p className="font-designer-14r text-gray-500">
                지금 결제하고 모든 레슨을 들어보세요
              </p>
            </div>
            <Link
              href={`/payment/${courseId}?type=course&planCode=${course.plans?.[0]?.planCode ?? 'ALL_IN_ONE'}`}
              className="shrink-0 rounded-100 bg-background-brand-default px-400 py-200 font-designer-16b text-text-inverse"
            >
              결제하기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
