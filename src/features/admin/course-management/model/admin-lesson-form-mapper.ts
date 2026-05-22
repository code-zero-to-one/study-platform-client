import type {
  AdminLessonDetailResponse,
  AdminLessonUpsertRequest,
} from '@/features/admin/course-management/model/admin-course-management-contract';
import { normalizeAdminCourseMarkdownContent } from '@/features/admin/course-management/model/admin-course-markdown';

export const toAdminLessonForm = (
  lesson: AdminLessonDetailResponse,
): AdminLessonUpsertRequest => ({
  chapterNumber: lesson.chapterNumber,
  lessonNumber: lesson.lessonNumber,
  title: lesson.title,
  description: lesson.description ?? '',
  content: normalizeAdminCourseMarkdownContent(lesson.content),
  estimatedMinutes: lesson.estimatedMinutes,
  retrospectivePurpose: lesson.retrospectivePurpose,
  isFree: lesson.isFree,
  isPublished: lesson.isPublished,
});

export const toAdminLessonHydrationSnapshot = (
  lesson: AdminLessonDetailResponse,
) =>
  JSON.stringify({
    chapterNumber: lesson.chapterNumber,
    lessonNumber: lesson.lessonNumber,
    title: lesson.title,
    description: lesson.description ?? '',
    content: normalizeAdminCourseMarkdownContent(lesson.content),
    estimatedMinutes: lesson.estimatedMinutes,
    retrospectivePurpose: lesson.retrospectivePurpose,
    isFree: lesson.isFree,
    isPublished: lesson.isPublished,
  });
