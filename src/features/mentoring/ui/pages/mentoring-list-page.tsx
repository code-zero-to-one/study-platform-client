import PageContainer from '@/components/ui/page-container';
import MentorDirectoryHeader from '@/features/mentoring/ui/mentor-directory/mentor-directory-header';
import MentorProfileList from '@/features/mentoring/ui/mentor-directory/mentor-profile-list';

export default function MentoringListPage() {
  return (
    <PageContainer spacing="content">
      <MentorDirectoryHeader />
      <MentorProfileList />
    </PageContainer>
  );
}
