import MentoringManagementRequestsPageClient from '@/features/mentoring/ui/pages/mentoring-management-requests-page-client';

interface MentoringManagementRequestsPageProps {
  searchParams: Promise<{ id?: string }>;
}

const parseHighlightRequestId = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
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
