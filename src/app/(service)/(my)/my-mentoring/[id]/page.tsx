import MyMentoringDetailPageClient from '@/features/mentoring/ui/pages/my-mentoring-detail-page-client';

interface MyMentoringDetailRouteProps {
  params: Promise<{ id: string }>;
}

export default async function MyMentoringDetailRoute({
  params,
}: MyMentoringDetailRouteProps) {
  const { id } = await params;

  return <MyMentoringDetailPageClient requestId={id} />;
}
