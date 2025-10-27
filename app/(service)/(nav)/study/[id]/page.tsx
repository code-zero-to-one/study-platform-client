import StudyDetailPage from '@/features/study/group/ui/group-study-detail-page';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <StudyDetailPage id={Number(id)} />;
}
