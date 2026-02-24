import { parseAdminMentoringMentorFilterSearchParams } from '@/features/admin/mentoring/model/admin-mentoring-contract';
import SessionOperationsContainer from '@/features/admin/mentoring/ui/session-operations-container';

interface SessionOperationsPageProps {
  searchParams: Promise<{ mentorId?: string }>;
}

export default async function SessionOperationsPage({
  searchParams,
}: SessionOperationsPageProps) {
  const parsedSearchParams = parseAdminMentoringMentorFilterSearchParams(
    await searchParams,
  );

  return (
    <SessionOperationsContainer initialMentorId={parsedSearchParams.mentorId} />
  );
}
