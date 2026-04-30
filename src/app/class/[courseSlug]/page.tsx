import { notFound } from 'next/navigation';
import { ClassDetailPage } from '@/components/pages/class/_components/class-detail-page';
import { VIBE_COURSE } from '@/components/pages/class/_data/courses';

interface ClassDetailRouteProps {
  params: Promise<{ courseSlug: string }>;
}

export default async function ClassDetailRoute({
  params,
}: ClassDetailRouteProps) {
  const { courseSlug } = await params;

  if (courseSlug !== VIBE_COURSE.slug) {
    notFound();
  }

  return <ClassDetailPage />;
}
