import StudyDetailPage from '@/features/study/group/ui/group-study-detail-page';

export default async function Page({ params }: { params: { id: string } }) {
  const id = Number(params.id);

  return <StudyDetailPage id={id} />;
}
