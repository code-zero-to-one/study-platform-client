import MentoringManagementRequestsPageClient from '@/features/mentoring/ui/pages/mentoring-management-requests-page-client';

interface MentoringManagementRequestsPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function MentoringManagementRequestsPage({
  searchParams,
}: MentoringManagementRequestsPageProps) {
  const { id } = await searchParams;

  return <MentoringManagementRequestsPageClient initialRequestId={id} />;
}
