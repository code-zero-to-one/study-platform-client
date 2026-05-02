import { notFound } from 'next/navigation';
import { CelebratePage } from '@/components/pages/class/_components/celebrate-page';
import { VIBE_COURSE } from '@/components/pages/class/_data/courses';

interface CelebrateRouteProps {
  params: Promise<{ courseSlug: string }>;
}

export default async function CelebrateRoute({ params }: CelebrateRouteProps) {
  const { courseSlug } = await params;

  if (courseSlug !== VIBE_COURSE.slug) {
    notFound();
  }

  return <CelebratePage />;
}
