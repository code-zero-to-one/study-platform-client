import MentoringManagementRequestsPageClient from '@/components/pages/mentoring-management-requests-page-client';

interface MentoringManagementRequestsPageProps {
  searchParams: Promise<{ id?: string }>;
}

const parseHighlightRequestId = (value: string | undefined) => {
  return value ?? undefined;
};

export default async function MentoringManagementRequestsPage({
  searchParams,
}: MentoringManagementRequestsPageProps) {
  const { id } = await searchParams;

  return (
    <MentoringManagementRequestsPageClient
      initialRequestId={parseHighlightRequestId(id)}
    />
  );
}
