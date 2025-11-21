import ApplicantPage from '@/features/my-page/ui/applicant-page';

export default async function ApplicationListPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const { studyId } = await params;

  return (
    <>
      <ApplicantPage studyId={studyId} />
    </>
  );
}
