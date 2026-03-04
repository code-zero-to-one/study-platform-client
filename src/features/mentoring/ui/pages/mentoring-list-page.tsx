import MentorDirectoryHeader from '@/features/mentoring/ui/mentor-directory/mentor-directory-header';
import MentorProfileList from '@/features/mentoring/ui/mentor-directory/mentor-profile-list';
import PageContainer from '@/components/common/ui/page-container';

export default function MentoringListPage() {
  return (
    <PageContainer spacing="content">
      <MentorDirectoryHeader />
      <MentorProfileList />
    </PageContainer>
  );
}
