'use client';

import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
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

const COURSE_SLUG = 'vibe-intro';

// Fallback chapter structure used when backend has no data yet (404).
const FALLBACK_CHAPTERS: CourseCurriculumChapterResponse[] = [
  {
    chapterId: -1,
    order: 1,
    chapterNumber: 1,
    title: '시작하기',
    estimatedMinutes: 0,
    lessons: [
      {
        lessonId: -1,
        order: 1,
        title: 'Lesson 01',
        isFree: true,
        locked: false,
        estimatedMinutes: 18,
      },
      {
        lessonId: -2,
        order: 2,
        title: 'Lesson 02',
        isFree: true,
        locked: false,
        estimatedMinutes: 18,
      },
      {
        lessonId: -3,
        order: 3,
        title: 'Lesson 03',
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
    estimatedMinutes: 0,
    lessons: [
      {
        lessonId: -4,
        order: 4,
        title: 'Lesson 04',
        isFree: false,
        locked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -5,
        order: 5,
        title: 'Lesson 05',
        isFree: false,
        locked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -6,
        order: 6,
        title: 'Lesson 06',
        isFree: false,
        locked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -7,
        order: 7,
        title: 'Lesson 07',
        isFree: false,
        locked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -8,
        order: 8,
        title: 'Lesson 08',
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
    estimatedMinutes: 0,
    lessons: [
      {
        lessonId: -9,
        order: 9,
        title: 'Lesson 09',
        isFree: false,
        locked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -10,
        order: 10,
        title: 'Lesson 10',
        isFree: false,
        locked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -11,
        order: 11,
        title: 'Lesson 11',
        isFree: false,
        locked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -12,
        order: 12,
        title: 'Lesson 12',
        isFree: false,
        locked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -13,
        order: 13,
        title: 'Lesson 13',
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
    };
  });
}

function LessonStamp({ lesson }: { lesson: LessonDisplayInfo }) {
  const isCompleted = lesson.status === 'COMPLETED';
  const isInProgress = lesson.status === 'IN_PROGRESS';

  const content = (
    <div className="relative flex h-[172px] w-[172px] shrink-0 flex-col items-center justify-center">
      <Image
        src="/class/vibe-intro/lesson-stamp.svg"
        alt=""
        aria-hidden="true"
        width={172}
        height={172}
        className={cn(
          'absolute inset-0',
          isCompleted && 'brightness-110 saturate-150',
          isInProgress && 'animate-pulse',
        )}
      />
      <div className="relative z-10 flex flex-col items-center">
        {lesson.isFree && !isCompleted && (
          <p className="mb-25 font-designer-16m text-gray-500">무료 온보딩</p>
        )}
        {!lesson.isFree && lesson.status === 'LOCKED' && (
          <Image
            src="/class/vibe-intro/lesson-lock.svg"
            alt="잠금"
            width={24}
            height={24}
            className="mb-25"
          />
        )}
        {isCompleted && (
          <p className="mb-25 font-designer-12b text-text-brand">완료</p>
        )}
        <p
          className={cn(
            'font-designer-24b',
            isCompleted ? 'text-text-brand' : 'text-gray-500',
          )}
        >
          Lesson
        </p>
        <p
          className={cn(
            'font-designer-24b',
            isCompleted ? 'text-text-brand' : 'text-gray-500',
          )}
        >
          {String(lesson.order).padStart(2, '0')}
        </p>
      </div>
    </div>
  );

  if (lesson.accessible) {
    return (
      <Link href={`/class/vibe-intro/lesson/${lesson.lessonId}`}>
        {content}
      </Link>
    );
  }

  return (
    <div aria-disabled="true" className="cursor-not-allowed">
      {content}
    </div>
  );
}

function ChapterHeader({ chapterNumber }: { chapterNumber: number }) {
  return (
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
  );
}

export default function JourneyMapPage() {
  const { data: course } = useGetCourseDetail(COURSE_SLUG);
  const courseId = course?.courseId ?? 0;

  const { data: curriculum, isLoading } = useGetCourseCurriculum(COURSE_SLUG);
  const { data: journeyMap } = useGetCourseJourneyMap(courseId);
  const { data: progress } = useGetCourseProgress(courseId);

  const lessonStatusMap = buildLessonMap(journeyMap?.lessons ?? []);
  const chapters =
    curriculum?.chapters && curriculum.chapters.length > 0
      ? curriculum.chapters
      : FALLBACK_CHAPTERS;
  const completedLessons = progress?.completedLessons ?? 0;
  const totalLessons = progress?.totalLessons ?? 0;
  const progressRate = progress?.progressRate ?? 0;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
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
            바이브 코딩 입문자 코스
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
            <p className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-designer-20b text-center text-text-brand">
              {completedLessons === 0
                ? `Chapter 01  시작!`
                : `${completedLessons}개 완료!`}
            </p>
          </div>
          <div className="flex-1">
            <div className="relative h-[20px] overflow-hidden rounded-full bg-gray-200">
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
        <div className="mt-300 flex flex-col gap-75 rounded-200 border border-border-default bg-gray-100 px-350 py-300">
          <p className="font-designer-20b text-gray-800">
            Lesson 03까지 무료로 온보딩을 하실 수 있어요! 무료로 즐겨보세요!
          </p>
          <p className="font-designer-16m text-gray-800">
            이후 결제는 무료 온보딩을 하시고 결정하셔도 늦지 않습니다.
          </p>
        </div>

        {/* Journey map */}
        <div className="mt-500 flex flex-col items-center">
          <Link
            href={
              chapters[0]?.lessons[0]
                ? `/class/vibe-intro/lesson/${chapters[0].lessons[0].lessonId}`
                : '#'
            }
            className="flex h-[44px] w-[100px] items-center justify-center rounded-100 bg-background-brand-default font-designer-24b text-white"
          >
            Start
          </Link>

          {chapters.map((chapter, ci) => {
            const lessons = mergeLessons(chapter, lessonStatusMap);
            const rows: LessonDisplayInfo[][] = [];
            for (let i = 0; i < lessons.length; i += 3) {
              rows.push(lessons.slice(i, i + 3));
            }

            return (
              <div
                key={chapter.chapterId}
                className="flex w-full flex-col items-center"
              >
                <div className="mt-400 w-full max-w-[1060px]">
                  <ChapterHeader chapterNumber={chapter.chapterNumber} />
                </div>

                {rows.map((row, ri) => (
                  <div key={ri} className="flex w-full flex-col items-center">
                    {(ci > 0 || ri > 0) && (
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
                    {ci === 0 && ri === 0 && (
                      <div className="mt-300 flex justify-center">
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
                        'mt-300 flex items-center justify-center gap-[200px]',
                        ri % 2 === 1 && 'flex-row-reverse',
                      )}
                    >
                      {row.map((lesson) => (
                        <LessonStamp key={lesson.lessonId} lesson={lesson} />
                      ))}
                    </div>
                  </div>
                ))}

                {ci < chapters.length - 1 && (
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

          <div className="mt-400">
            <button
              type="button"
              disabled={!progress?.isCourseCompleted}
              className={cn(
                'flex h-[44px] w-[100px] items-center justify-center rounded-100 font-designer-24b text-white',
                progress?.isCourseCompleted
                  ? 'bg-background-brand-default'
                  : 'cursor-not-allowed bg-gray-300',
              )}
            >
              Finish
            </button>
          </div>
        </div>

        {/* Lesson card list */}
        <div className="mt-800">
          <h2 className="font-designer-28b text-gray-800">전체 레슨 목록</h2>
          <div className="mt-400 flex flex-col gap-200">
            {chapters.flatMap((chapter) =>
              chapter.lessons.map((l) => {
                const journeyLesson = lessonStatusMap.get(l.lessonId);
                const isAccessible = journeyLesson?.accessible ?? !l.locked;
                const isCompleted = journeyLesson?.status === 'COMPLETED';

                const card = (
                  <div
                    className={cn(
                      'flex items-center gap-300 rounded-200 border bg-background-default p-300 transition-colors',
                      isAccessible
                        ? 'cursor-pointer border-border-default hover:border-border-brand'
                        : 'cursor-not-allowed border-border-subtle opacity-60',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full font-designer-16b',
                        isCompleted
                          ? 'bg-background-brand-default text-white'
                          : 'bg-gray-200 text-gray-500',
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
                      <div className="flex items-center gap-200">
                        {l.isFree && (
                          <span className="rounded-full bg-rose-100 px-150 py-25 font-designer-12b text-text-brand">
                            무료
                          </span>
                        )}
                        <span className="font-designer-14r text-gray-500">
                          약 {l.estimatedMinutes}분
                        </span>
                        {isCompleted && (
                          <span className="font-designer-14b text-text-brand">
                            완료
                          </span>
                        )}
                        {!isAccessible && (
                          <span className="font-designer-14r text-gray-400">
                            잠김
                          </span>
                        )}
                      </div>
                    </div>
                    {isAccessible && (
                      <BookOpen className="h-300 w-300 shrink-0 text-gray-400" />
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
