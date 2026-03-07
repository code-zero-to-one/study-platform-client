import { redirect } from 'next/navigation';

interface InquiryDetailPageProps {
  params: Promise<{ questionId: string }>;
  searchParams: Promise<{ groupStudyId?: string; studyType?: string }>;
}
export default async function InquiryDetailPage({
  params,
  searchParams,
}: InquiryDetailPageProps) {
  const { questionId } = await params;
  const { groupStudyId, studyType } = await searchParams;

  if (!groupStudyId) {
    redirect('/group-study');
  }

  const studyPath = studyType === 'premium' ? 'premium-study' : 'group-study';
  redirect(
    `/${studyPath}/${groupStudyId}?tab=inquiry&questionId=${questionId}`,
  );
}
