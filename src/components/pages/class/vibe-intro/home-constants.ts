import type {
  CourseCurriculumChapterResponse,
  CourseJourneyMapLessonResponse,
  LessonProgressStatus,
} from '@/types/api/course.types';

export const COURSE_SLUG = 'vibe-intro';

export const FALLBACK_CHAPTERS: CourseCurriculumChapterResponse[] = [
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
        isLocked: false,
        estimatedMinutes: 18,
      },
      {
        lessonId: -2,
        order: 2,
        title: 'Lesson 02',
        description: null,
        isFree: true,
        isLocked: false,
        estimatedMinutes: 18,
      },
      {
        lessonId: -3,
        order: 3,
        title: 'Lesson 03',
        description: null,
        isFree: true,
        isLocked: false,
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
        isLocked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -5,
        order: 5,
        title: 'Lesson 05',
        description: null,
        isFree: false,
        isLocked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -6,
        order: 6,
        title: 'Lesson 06',
        description: null,
        isFree: false,
        isLocked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -7,
        order: 7,
        title: 'Lesson 07',
        description: null,
        isFree: false,
        isLocked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -8,
        order: 8,
        title: 'Lesson 08',
        description: null,
        isFree: false,
        isLocked: true,
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
        isLocked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -10,
        order: 10,
        title: 'Lesson 10',
        description: null,
        isFree: false,
        isLocked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -11,
        order: 11,
        title: 'Lesson 11',
        description: null,
        isFree: false,
        isLocked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -12,
        order: 12,
        title: 'Lesson 12',
        description: null,
        isFree: false,
        isLocked: true,
        estimatedMinutes: 18,
      },
      {
        lessonId: -13,
        order: 13,
        title: 'Lesson 13',
        description: null,
        isFree: false,
        isLocked: true,
        estimatedMinutes: 18,
      },
    ],
  },
];

export interface LessonDisplayInfo {
  lessonId: number;
  order: number;
  title: string;
  description: string | null;
  isFree: boolean;
  status: LessonProgressStatus;
  accessible: boolean;
  estimatedMinutes: number;
  isCurrent: boolean;
}

export function buildLessonMap(
  journeyLessons: CourseJourneyMapLessonResponse[],
): Map<number, CourseJourneyMapLessonResponse> {
  const map = new Map<number, CourseJourneyMapLessonResponse>();
  journeyLessons.forEach((l) => map.set(l.lessonId, l));
  return map;
}

export function mergeLessons(
  chapter: CourseCurriculumChapterResponse,
  journeyMap: Map<number, CourseJourneyMapLessonResponse>,
): LessonDisplayInfo[] {
  return chapter.lessons.map((l) => {
    const journeyLesson = journeyMap.get(l.lessonId);
    return {
      lessonId: l.lessonId,
      order: l.order,
      title: l.title,
      description: l.description,
      isFree: l.isFree,
      status: journeyLesson?.status ?? (l.isLocked ? 'LOCKED' : 'IN_PROGRESS'),
      accessible: journeyLesson?.isAccessible ?? !l.isLocked,
      estimatedMinutes: l.estimatedMinutes,
      isCurrent:
        journeyLesson !== undefined &&
        journeyLesson.status === 'IN_PROGRESS' &&
        journeyLesson.isAccessible,
    };
  });
}
