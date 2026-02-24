import { FlaskConical } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import MentorDirectoryHeader from '@/features/mentoring/ui/mentor-directory/mentor-directory-header';
import MentorProfileList from '@/features/mentoring/ui/mentor-profile-list';

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
    <div className="mx-auto w-full max-w-[1280px] px-200 py-400 sm:px-300 sm:py-500 xl:px-400 xl:py-600">
      <MentorDirectoryHeader actions={headerActions} />
      <MentorProfileList />
    </div>
  );
}
