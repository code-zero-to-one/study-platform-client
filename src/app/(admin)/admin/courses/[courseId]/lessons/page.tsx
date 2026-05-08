import { notFound } from 'next/navigation';
import AdminLessonManagementPageClient from '@/components/admin/courses/admin-lesson-management-page-client';

export default async function AdminCourseLessonsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const parsedCourseId = Number(courseId);
  if (!Number.isInteger(parsedCourseId) || parsedCourseId < 1) {
    notFound();
  }

  return <AdminLessonManagementPageClient courseId={parsedCourseId} />;
}
