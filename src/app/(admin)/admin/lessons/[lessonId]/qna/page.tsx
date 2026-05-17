import { notFound } from 'next/navigation';
import { AdminLessonQnaPageClient } from '@/components/admin/courses/admin-lesson-operations-page-client';

const getLessonManagementReturnHref = (courseId?: string) => {
  const parsedCourseId = Number(courseId);

  return Number.isInteger(parsedCourseId) && parsedCourseId > 0
    ? `/admin/courses/${parsedCourseId}/lessons`
    : '/admin/courses';
};

export default async function AdminLessonQnaPage({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ courseId?: string }>;
}) {
  const [{ lessonId }, { courseId }] = await Promise.all([
    params,
    searchParams,
  ]);
  const parsedLessonId = Number(lessonId);
  if (!Number.isInteger(parsedLessonId) || parsedLessonId < 1) {
    notFound();
  }

  return (
    <AdminLessonQnaPageClient
      lessonId={parsedLessonId}
      returnHref={getLessonManagementReturnHref(courseId)}
    />
  );
}
