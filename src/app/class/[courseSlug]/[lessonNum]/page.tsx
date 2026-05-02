import { notFound } from 'next/navigation';
import { LessonDetailPage } from '@/components/pages/class/_components/lesson-detail-page';
import {
  VIBE_COURSE,
  VIBE_LESSONS,
} from '@/components/pages/class/_data/courses';

interface LessonRouteProps {
  params: Promise<{ courseSlug: string; lessonNum: string }>;
}

export default async function LessonRoute({ params }: LessonRouteProps) {
  const { courseSlug, lessonNum } = await params;

  if (courseSlug !== VIBE_COURSE.slug) {
    notFound();
  }

  const num = Number.parseInt(lessonNum, 10);
  if (!Number.isFinite(num) || !VIBE_LESSONS.some((l) => l.num === num)) {
    notFound();
  }

  return <LessonDetailPage lessonNum={num} />;
}
