import { parseAdminMentoringMentorFilterSearchParams } from '@/features/admin/mentoring/model/admin-mentoring-contract';
import MentorOperationsPageClient from '@/features/admin/mentoring/ui/mentor-operations-page-client';

interface MentorOperationsPageProps {
  searchParams: Promise<{ mentorId?: string }>;
}

export default async function MentorOperationsPage({
  searchParams,
}: MentorOperationsPageProps) {
  const parsedSearchParams = parseAdminMentoringMentorFilterSearchParams(
    await searchParams,
  );

  return (
    <MentorOperationsPageClient initialMentorId={parsedSearchParams.mentorId} />
  );
}
