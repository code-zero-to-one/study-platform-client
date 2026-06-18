import ApplicantPage from '@/components/my-page/applicant-page';

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
