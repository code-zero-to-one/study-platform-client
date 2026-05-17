import AdminLessonDetailPageClient from '@/components/admin/courses/admin-lesson-detail-page-client';

export default async function AdminLessonDetailPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  return <AdminLessonDetailPageClient lessonId={Number(lessonId)} />;
}
