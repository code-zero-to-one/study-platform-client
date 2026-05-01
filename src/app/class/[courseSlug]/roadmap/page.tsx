import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CourseProgressPage } from '@/components/pages/class/_components/course-progress-page';
import { VIBE_COURSE } from '@/components/pages/class/_data/courses';

interface RoadmapRouteProps {
  params: Promise<{ courseSlug: string }>;
}

export default async function RoadmapRoute({ params }: RoadmapRouteProps) {
  const { courseSlug } = await params;

  if (courseSlug !== VIBE_COURSE.slug) {
    notFound();
  }

  return (
    <Suspense fallback={undefined}>
      <CourseProgressPage />
    </Suspense>
  );
}
