import { notFound } from 'next/navigation';
import MyMentoringDetailPage from '@/features/mentoring/ui/pages/my-mentoring-detail-page';
import { getMyMentoringById } from '@/mocks/my-mentoring-mock-data';

interface MyMentoringDetailRouteProps {
  params: Promise<{ id: string }>;
}

export default async function MyMentoringDetailRoute({
  params,
}: MyMentoringDetailRouteProps) {
  const { id } = await params;
  const mentoringId = Number(id);

  if (!Number.isInteger(mentoringId) || mentoringId <= 0) {
    notFound();
  }

  const mentoring = getMyMentoringById(mentoringId);

  if (!mentoring) {
    notFound();
  }

  return <MyMentoringDetailPage mentoring={mentoring} />;
}
