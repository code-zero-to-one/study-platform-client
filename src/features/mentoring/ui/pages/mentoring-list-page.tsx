import { FlaskConical } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import PageContainer from '@/components/ui/page-container';
import MentorDirectoryHeader from '@/features/mentoring/ui/mentor-directory/mentor-directory-header';
import MentorProfileList from '@/features/mentoring/ui/mentor-directory/mentor-profile-list';

export default function MentoringListPage() {
  const headerActions = (
    <Link href="/mentoring/temp">
      <Button
        color="outlined"
        size="small"
        icon={<FlaskConical className="h-14 w-14" />}
      >
        임시 검증 페이지
      </Button>
    </Link>
  );

  return (
    <PageContainer spacing="content">
      <MentorDirectoryHeader actions={headerActions} />
      <MentorProfileList />
    </PageContainer>
  );
}
