import { parseAdminMentoringMentorFilterSearchParams } from '@/features/admin/mentoring/model/admin-mentoring-contract';
import MentorApplicationsPageClient from '@/features/admin/mentoring/ui/mentor-applications-page-client';

interface MentorApplicationsPageProps {
  searchParams: Promise<{ mentorId?: string }>;
}

export default async function MentorApplicationsPage({
  searchParams,
}: MentorApplicationsPageProps) {
  const parsedSearchParams = parseAdminMentoringMentorFilterSearchParams(
    await searchParams,
  );

  return (
    <MentorApplicationsPageClient
      initialMentorId={parsedSearchParams.mentorId}
    />
  );
}
