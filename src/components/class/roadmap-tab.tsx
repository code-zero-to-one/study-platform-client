'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/features/auth/model/use-auth';
import {
  useGetCourseCurriculum,
  useGetCourseDetail,
  useGetCourseJourneyMap,
  useGetCourseProgress,
} from '@/hooks/queries/course/course-queries';
import type { CourseCurriculumChapterResponse } from '@/types/api/course.types';
import {
  hasCourseFullAccess,
  isAdminViewer,
  isCourseFreeEnrolled,
  isCoursePaidEnrolled,
} from './course-viewer-status';
import {
  buildLessonMap,
  FALLBACK_CHAPTERS,
  type LessonDisplayInfo,
} from './home-constants';
import { JourneyChapterList } from './journey-chapter-list';
import { JourneyStampMap } from './journey-stamp-map';
import { LessonPreviewModal } from './lesson-preview-modal';
import { PlanSelectionModal } from './plan-selection-modal';

const ASSET_SLUG_OVERRIDE: Record<string, string> = {
  'vibe-intro-claude-code': 'vibe-intro',
};

export function RoadmapTab({ slug }: { slug: string }) {
  const { isAuthenticated } = useAuth();
  const { data: course } = useGetCourseDetail(slug);
  const courseId = course?.courseId ?? 0;

  const { data: curriculum, isLoading } = useGetCourseCurriculum(slug);
  const { data: journeyMap } = useGetCourseJourneyMap(courseId);
  const { data: progress } = useGetCourseProgress(courseId);
  const router = useRouter();
  const assetSlug = ASSET_SLUG_OVERRIDE[slug] ?? slug;
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [visibleChapterCount, setVisibleChapterCount] = useState(3);
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

  const displayTotalLessons = totalLessons || 20;
  const progressPercent = Math.min(
    100,
    (completedLessons / displayTotalLessons) * 100,
  );
  const isFreeEnrolled = isCourseFreeEnrolled(course);
  const isPaidEnrolled = isCoursePaidEnrolled(course);
  const hasFullAccess = hasCourseFullAccess(course);
  const isAdminPreview =
    isAdminViewer(course) && !isFreeEnrolled && !isPaidEnrolled;

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
  const handleShowMore = () =>
    setVisibleChapterCount((prev) => Math.min(prev + 3, chapters.length));

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
            <path d="M10 8C10 9.5 9.33 10.65 8 11.44V51C8 51.27 7.9 51.51 7.7 51.7C7.51 51.9 7.27 52 7 52H5C4.73 52 4.49 51.9 4.3 51.7C4.1 51.51 4 51.27 4 51V11.44C2.67 10.65 2 9.5 2 8C2 6.9 2.39 5.95 3.17 5.17C3.95 4.39 4.9 4 6 4C7.1 4 8.05 4.39 8.83 5.17C9.61 5.95 10 6.9 10 8ZM56 10V33.84C56 34.36 55.87 34.77 55.61 35.05C55.35 35.33 54.94 35.61 54.38 35.91C49.9 38.32 46.05 39.53 42.84 39.53C41.57 39.53 40.29 39.3 38.98 38.84C37.68 38.39 36.55 37.89 35.59 37.34C34.64 36.8 33.43 36.3 31.98 35.84C30.54 35.39 29.05 35.16 27.53 35.16C23.53 35.16 18.7 36.68 13.03 39.72C12.68 39.91 12.33 40 12 40C11.46 40 10.99 39.8 10.59 39.41C10.2 39.01 10 38.54 10 38V14.81C10 14.15 10.32 13.57 10.97 13.09C11.41 12.8 12.23 12.35 13.44 11.75C18.35 9.25 22.74 8 26.59 8C28.82 8 30.91 8.3 32.84 8.91C34.78 9.51 37.06 10.43 39.69 11.66C40.48 12.05 41.4 12.25 42.44 12.25C43.56 12.25 44.79 12.03 46.11 11.59C47.43 11.16 48.58 10.67 49.55 10.13C50.52 9.58 51.43 9.09 52.3 8.66C53.16 8.22 53.73 8 54 8C54.54 8 55.01 8.2 55.41 8.59C55.8 8.99 56 9.46 56 10Z" />
          </svg>
          <span className="rounded-full bg-rose-300 px-250 py-125 font-designer-20b text-text-inverse">
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
          {isAdminPreview ? (
            <p className="font-designer-16m text-text-brand">
              관리자 권한으로 미리보기 중
            </p>
          ) : null}
        </div>

        <div className="mt-300 flex items-end gap-300 pr-700 md:pr-0">
          <div className="min-w-0 flex-1">
            <div
              className="relative w-fit transition-all [--bubble-scale:0.72] md:[--bubble-scale:1]"
              style={{
                left: `${progressPercent}%`,
                transform: `translateX(-70px) scale(var(--bubble-scale))`,
                transformOrigin: '70px bottom',
              }}
            >
              <Image
                src={`/class/${assetSlug}/chapter-progress.svg`}
                alt="진도 표시"
                width={147}
                height={62}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.visibility = 'hidden';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center pb-175">
                <p className="whitespace-nowrap px-50 text-center font-designer-16sb text-text-brand">
                  {completedLessons === 0
                    ? `Chapter 01  시작!`
                    : `${completedLessons}개 완료!`}
                </p>
              </div>
            </div>
            <div className="relative mt-350 h-250 overflow-hidden rounded-full bg-gray-200 md:mt-250">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-background-brand-default transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <p className="shrink-0 translate-y-100 font-designer-24b text-gray-1000">
            {completedLessons} / {displayTotalLessons}
          </p>
        </div>

        {/* 안내창 — State 1: 최초 접속 (no progress yet) */}
        {isFreeEnrolled && !hasFullAccess && completedLessons === 0 ? (
          <div className="mt-300 flex flex-col gap-75 rounded-200 border border-gray-300 bg-gray-100 px-350 py-300">
            <p className="font-designer-20b text-gray-800">
              Chapter3까지 무료 코스! 마음껏 학습하세요.
            </p>
            <p className="font-designer-16m text-gray-800">
              이후 결제는 무료 온보딩을 하시고 결정하셔도 늦지 않습니다.
            </p>
          </div>
        ) : /* State 2: free lessons exhausted → payment CTA */
        isFreeEnrolled &&
          !hasFullAccess &&
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
          (hasFullAccess ||
            (isFreeEnrolled &&
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

        {/* Journey stamp map */}
        <div className="mt-300 md:mt-500">
          <JourneyStampMap
            slug={slug}
            visibleChapters={visibleChapters}
            lessonStatusMap={lessonStatusMap}
            isAuthenticated={isAuthenticated}
            learnerCount={journeyMap?.learnerCount ?? course?.learnerCount ?? 0}
            completedLessons={completedLessons}
            isCourseCompleted={progress?.isCourseCompleted ?? false}
            hasMoreChapters={hasMoreChapters}
            onShowMore={handleShowMore}
            onSelectLesson={(lesson, chapter) =>
              setSelectedLesson({ lesson, chapter })
            }
          />
        </div>

        {/* Chapter 목록 (accordion) */}
        <JourneyChapterList
          chapters={visibleChapters}
          lessonStatusMap={lessonStatusMap}
          hasMoreChapters={hasMoreChapters}
          onShowMore={handleShowMore}
          onSelectLesson={(lesson, chapter) =>
            setSelectedLesson({ lesson, chapter })
          }
        />
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
        />
      )}

      {showPlanModal && course?.plans?.[0] && (
        <PlanSelectionModal
          plan={course.plans[0]}
          earlyBirdEndsAt={course?.earlyBirdEndsAt ?? null}
          onClose={() => setShowPlanModal(false)}
          slug={slug}
        />
      )}

      {/* Sticky payment CTA for free-enrolled users */}
      {isFreeEnrolled &&
        !hasFullAccess &&
        course?.canPurchase &&
        course?.plans?.[0]?.planCode && (
          <div
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-subtle bg-background-default px-600 pt-300 shadow-3"
            style={{
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
            }}
          >
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
