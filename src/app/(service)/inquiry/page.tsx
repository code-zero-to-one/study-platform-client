import { redirect } from 'next/navigation';

export default async function InquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ groupStudyId?: string; studyType?: string }>;
}) {
  const { groupStudyId, studyType } = await searchParams;

  if (!groupStudyId) {
    redirect('/group-study');
  }

  const studyPath =
    studyType === 'premium' ? 'premium-study' : 'group-study';
  redirect(`/${studyPath}/${groupStudyId}?tab=inquiry`);
}
