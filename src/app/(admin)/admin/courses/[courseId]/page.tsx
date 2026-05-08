import { notFound } from 'next/navigation';
import AdminCourseDetailPageClient from '@/components/admin/courses/admin-course-detail-page-client';

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  if (courseId === 'new') {
    return <AdminCourseDetailPageClient />;
  }

  const parsedCourseId = Number(courseId);
  if (!Number.isInteger(parsedCourseId) || parsedCourseId < 1) {
    notFound();
  }

  return <AdminCourseDetailPageClient courseId={parsedCourseId} />;
}
