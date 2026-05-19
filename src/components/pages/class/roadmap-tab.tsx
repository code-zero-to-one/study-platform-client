'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import FloatingClassActionButtons from '@/components/common/ui/floating-class-action-buttons';
import {
  LockIcon,
  LockOpenIcon,
  TimerIcon,
} from '@/components/common/ui/icons/course-icons';
import { useAuth } from '@/features/auth/model/use-auth';
import {
  useGetCourseCurriculum,
  useGetCourseDetail,
  useGetCourseJourneyMap,
  useGetCourseProgress,
} from '@/hooks/queries/course/course-api';
import { useToastStore } from '@/stores/use-toast-store';
import type { CourseCurriculumChapterResponse } from '@/types/api/course.types';
import { ChapterHeader } from './chapter-header';
import {
  FALLBACK_CHAPTERS,
  buildLessonMap,
  mergeLessons,
  type LessonDisplayInfo,
} from './home-constants';
import { LessonPreviewModal } from './lesson-preview-modal';
import { LessonStamp } from './lesson-stamp';
import { PlanSelectionModal } from './plan-selection-modal';

const LoginModal = dynamic(
  () => import('@/components/auth/modals/login-modal'),
);

export function RoadmapTab({ slug }: { slug: string }) {
  const { isAuthenticated } = useAuth();
  const { data: course } = useGetCourseDetail(slug);
  const courseId = course?.courseId ?? 0;

  const { data: curriculum, isLoading } = useGetCourseCurriculum(slug);
  const { data: journeyMap } = useGetCourseJourneyMap(courseId);
  const { data: progress } = useGetCourseProgress(courseId);
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const [blinkLessonId, setBlinkLessonId] = useState<number | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [visibleChapterCount, setVisibleChapterCount] = useState(1);

  useEffect(() => {
    if (!blinkLessonId) return;
    const t = setTimeout(() => setBlinkLessonId(null), 5000);
    return () => clearTimeout(t);
  }, [blinkLessonId]);
  const [visibleLessonCount, setVisibleLessonCount] = useState(5);
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

  const nextLessonDescription =
    chapters
      .flatMap((c) => c.lessons)
      .find((l) => l.lessonId === nextAccessibleLesson?.lessonId)
      ?.description ?? null;

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
        {/* Flag + Course badge */}
        <div className="flex flex-col items-center gap-150">
          <svg
            viewBox="0 0 56 56"
            className="size-700 text-rose-400"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 8C10 9.5 9.33333 10.6458 8 11.4375V51C8 51.2708 7.90104 51.5052 7.70313 51.7031C7.50521 51.901 7.27083 52 7 52H5C4.72917 52 4.49479 51.901 4.29688 51.7031C4.09896 51.5052 4 51.2708 4 51V11.4375C2.66667 10.6458 2 9.5 2 8C2 6.89583 2.39063 5.95312 3.17188 5.17188C3.95313 4.39062 4.89583 4 6 4C7.10417 4 8.04688 4.39062 8.82813 5.17188C9.60938 5.95312 10 6.89583 10 8ZM56 10V33.8438C56 34.3646 55.8698 34.7656 55.6094 35.0469C55.349 35.3281 54.9375 35.6146 54.375 35.9062C49.8958 38.3229 46.0521 39.5312 42.8438 39.5312C41.5729 39.5312 40.2865 39.3021 38.9844 38.8438C37.6823 38.3854 36.5521 37.8854 35.5938 37.3438C34.6354 36.8021 33.4323 36.3021 31.9844 35.8438C30.5365 35.3854 29.0521 35.1562 27.5313 35.1562C23.5313 35.1562 18.6979 36.6771 13.0313 39.7188C12.6771 39.9062 12.3333 40 12 40C11.4583 40 10.9896 39.8021 10.5938 39.4062C10.1979 39.0104 10 38.5417 10 38V14.8125C10 14.1458 10.3229 13.5729 10.9688 13.0938C11.4063 12.8021 12.2292 12.3542 13.4375 11.75C18.3542 9.25 22.7396 8 26.5938 8C28.8229 8 30.9063 8.30208 32.8438 8.90625C34.7813 9.51042 37.0625 10.4271 39.6875 11.6562C40.4792 12.0521 41.3958 12.25 42.4375 12.25C43.5625 12.25 44.7865 12.0312 46.1094 11.5938C47.4323 11.1562 48.5781 10.6667 49.5469 10.125C50.5156 9.58333 51.4323 9.09375 52.2969 8.65625C53.1615 8.21875 53.7292 8 54 8C54.5417 8 55.0104 8.19792 55.4063 8.59375C55.8021 8.98958 56 9.45833 56 10Z" />
          </svg>
          <span className="rounded-full bg-rose-300 px-250 py-125 font-designer-20b text-gray-0">
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
              src={`/class/${slug}/chapter-progress.svg`}
              alt="진도 표시"
              width={173}
              height={61}
            />
            <p className="absolute left-1/2 top-2/5 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center font-designer-16sb text-text-brand">
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

        {/* 안내창 — State 1: 최초 접속 (no progress yet) */}
        {course?.viewerStatus === 'FREE_ENROLLED' && completedLessons === 0 ? (
          <div className="mt-300 flex flex-col gap-75 rounded-200 border border-gray-300 bg-gray-100 px-350 py-300">
            <p className="font-designer-20b text-gray-800">
              Chapter3까지 무료 코스! 마음껏 학습하세요.
            </p>
            <p className="font-designer-16m text-gray-800">
              이후 결제는 무료 온보딩을 하시고 결정하셔도 늦지 않습니다.
            </p>
          </div>
        ) : /* State 2: free lessons exhausted → payment CTA */
        course?.viewerStatus === 'FREE_ENROLLED' &&
          completedLessons >= (course.freeLessonCount ?? 0) &&
          course?.canPurchase ? (
          <div className="mt-300 flex flex-col gap-150 rounded-200 border border-gray-300 bg-gray-100 px-350 py-300">
            <div className="flex flex-col gap-75">
              <p className="font-designer-20b text-gray-800">
                Chapter3까지 재미있게 따라 오셨나요? 이어서 공부를 원하시면
                결제를 진행해주세요.
              </p>
              <p className="font-designer-16m text-gray-800">
                얼리버드 가격으로 39,900원에 만나실 수 있어요! 놓치지 마세요!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPlanModal(true)}
              className="flex h-650 w-full items-center justify-center rounded-100 bg-background-brand-default font-designer-16b text-gray-0"
            >
              결제하기
            </button>
          </div>
        ) : /* State 3: mid-progress free or paid → next lesson info */
        nextAccessibleLesson &&
          (course?.viewerStatus === 'PAID' ||
            (course?.viewerStatus === 'FREE_ENROLLED' &&
              completedLessons > 0 &&
              completedLessons < (course.freeLessonCount ?? 0))) ? (
          <div className="mt-300 flex items-center gap-300 rounded-200 border border-gray-300 bg-gray-100 px-350 py-300">
            <div className="flex shrink-0 flex-col items-center justify-center rounded-100 bg-background-brand-default px-150 py-75 text-gray-0">
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
                {nextLessonDescription ?? '다음 레슨을 이어서 학습해보세요.'}
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
                <div
                  className={cn(
                    'relative z-10 w-full',
                    index === 0 ? 'mt-400' : 'mt-1125',
                  )}
                >
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
                        ri === 0 ? 'mt-800' : '',
                      )}
                    >
                      {index === 0 && ri === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Image
                            src={`/class/${slug}/journey-1st-load.svg`}
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
                                        ? `/class/${slug}/lesson/${chapters[0].lessons[0].lessonId}`
                                        : '#'
                                    }
                                    className="flex h-450 w-1250 items-center justify-center rounded-100 bg-background-brand-default font-designer-20sb text-gray-0"
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
                              shouldBlink={
                                (completedLessons === 0 &&
                                  index === 0 &&
                                  ri === 0 &&
                                  li === 0) ||
                                lesson.lessonId === blinkLessonId
                              }
                              learnerCount={
                                journeyMap?.learnerCount ??
                                course?.learnerCount ??
                                0
                              }
                              slug={slug}
                            />
                          </div>
                        ))}
                      </div>
                      {ri === rows.length - 1 &&
                        index < visibleChapters.length - 1 && (
                          <div className="pointer-events-none absolute right-0 top-1/2">
                            <Image
                              src={`/class/${slug}/journey-load.svg`}
                              alt=""
                              aria-hidden="true"
                              width={906}
                              height={398}
                              className={cn(
                                'max-w-none!',
                                rows.length % 2 === 0 && '-scale-x-100',
                              )}
                            />
                          </div>
                        )}
                      {ri < rows.length - 1 && (
                        <div className="pointer-events-none absolute right-0 top-1/2">
                          <Image
                            src={`/class/${slug}/journey-load-reverse.svg`}
                            alt=""
                            aria-hidden="true"
                            width={906}
                            height={319}
                            className={cn(
                              'max-w-none!',
                              ri % 2 === 1 && '-scale-x-100',
                            )}
                          />
                        </div>
                      )}
                    </div>
                    {ri < rows.length - 1 && <div className="h-2337" />}
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
            <div className="mt-400 flex justify-center">
              <div className="relative">
                <svg
                  aria-hidden="true"
                  width="21"
                  height="24"
                  viewBox="0 0 21 24"
                  className="absolute bottom-full left-1/2 -translate-x-1/2"
                >
                  <polygon
                    points="10.5,0 0,13 21,13"
                    className={cn(
                      progress?.isCourseCompleted
                        ? 'fill-background-brand-default'
                        : 'fill-gray-300',
                    )}
                  />
                </svg>
                <button
                  type="button"
                  disabled={!progress?.isCourseCompleted}
                  className={cn(
                    'flex h-550 w-1250 items-center justify-center rounded-100 font-designer-20b text-gray-0',
                    progress?.isCourseCompleted
                      ? 'bg-background-brand-default'
                      : 'cursor-not-allowed bg-gray-300',
                  )}
                >
                  Finish
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lesson card list */}
        {(() => {
          const allLessons = chapters.flatMap((ch) => ch.lessons);
          const visibleLessons = allLessons.slice(0, visibleLessonCount);
          const hasMoreLessons = visibleLessonCount < allLessons.length;

          return (
            <div className="mt-800">
              <h2 className="font-designer-28b text-gray-800">레슨 목록</h2>
              <div className="mt-400 flex flex-col gap-200">
                {visibleLessons.map((l) => {
                  const journeyLesson = lessonStatusMap.get(l.lessonId);
                  const isAccessible =
                    journeyLesson?.isAccessible ?? !l.isLocked;
                  const isCompleted = journeyLesson?.status === 'COMPLETED';

                  const card = (
                    <div
                      className={cn(
                        'flex h-1250 items-center justify-between rounded-200 border px-500 transition-colors',
                        isAccessible
                          ? 'group cursor-pointer border-gray-300 bg-gray-50 hover:border-border-brand hover:text-border-brand'
                          : 'cursor-not-allowed border-gray-300 bg-gray-50 opacity-60',
                      )}
                    >
                      <div className="flex items-center gap-300">
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
                        <div className="flex flex-col gap-50">
                          <p
                            className={cn(
                              'font-designer-16b',
                              isCompleted ? 'text-text-brand' : 'text-gray-800',
                            )}
                          >
                            {l.title}
                          </p>
                          <div className="flex items-center gap-75">
                            {l.isFree && (
                              <span className="flex h-250 w-525 items-center justify-center rounded-50 bg-rose-400 font-designer-12r text-gray-0">
                                무료
                              </span>
                            )}
                            {!l.isFree && !isAccessible && (
                              <span
                                role="img"
                                aria-label="잠금"
                                className="flex h-250 w-525 items-center justify-center rounded-50 bg-gray-400"
                              >
                                <LockIcon className="size-200 text-gray-0" />
                              </span>
                            )}
                            {!l.isFree && isAccessible && (
                              <span
                                role="img"
                                aria-label="잠금 해제"
                                className="flex h-250 w-525 items-center justify-center rounded-50 border border-gray-300 bg-gray-0"
                              >
                                <LockOpenIcon className="size-200 text-gray-400" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-25 text-gray-400 group-hover:text-border-brand">
                        <TimerIcon className="size-300" />
                        <span className="font-designer-14r">
                          약 {l.estimatedMinutes}분 소요
                        </span>
                      </div>
                    </div>
                  );

                  if (isAccessible && l.lessonId > 0) {
                    return (
                      <Link
                        key={l.lessonId}
                        href={`/class/${slug}/lesson/${l.lessonId}`}
                      >
                        {card}
                      </Link>
                    );
                  }

                  return <div key={l.lessonId ?? l.order}>{card}</div>;
                })}
              </div>
              {hasMoreLessons && (
                <div className="mt-400 flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleLessonCount((prev) =>
                        Math.min(prev + 10, allLessons.length),
                      )
                    }
                    className="h-750 w-7125 rounded-100 border border-gray-400 font-designer-16r text-gray-800"
                  >
                    더보기
                  </button>
                </div>
              )}
            </div>
          );
        })()}
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
              `/class/${slug}/lesson/${selectedLesson.lesson.lessonId}`,
            );
            setSelectedLesson(null);
          }}
          onSkip={() => {
            const lessons = journeyMap?.lessons
              ? [...journeyMap.lessons].sort((a, b) => a.order - b.order)
              : [];
            const nextRequired = lessons.find(
              (l) =>
                l.order > selectedLesson.lesson.order &&
                !l.title.toLowerCase().includes('option'),
            );
            setBlinkLessonId(nextRequired?.lessonId ?? null);
            if (nextRequired) {
              showToast('다음 레슨으로 이어가세요');
            }
            setSelectedLesson(null);
          }}
        />
      )}

      <FloatingClassActionButtons />

      {showPlanModal && course?.plans?.[0] && (
        <PlanSelectionModal
          plan={course.plans[0]}
          earlyBirdEndsAt={course?.earlyBirdEndsAt ?? null}
          onClose={() => setShowPlanModal(false)}
          slug={slug}
        />
      )}

      {/* Sticky payment CTA for free-enrolled users */}
      {course?.viewerStatus === 'FREE_ENROLLED' &&
        course?.canPurchase &&
        course?.plans?.[0]?.planCode && (
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
              <button
                type="button"
                onClick={() => setShowPlanModal(true)}
                className="shrink-0 rounded-100 bg-background-brand-default px-400 py-200 font-designer-16b text-text-inverse"
              >
                결제하기
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
