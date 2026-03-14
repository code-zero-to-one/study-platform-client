'use client';
import Link from 'next/link';
import Button from '@/components/common/ui/button';
import SurfacePanel from '@/components/common/ui/surface-panel';
import {
  buildMyNoteConsultationSummary,
  createMentorMap,
  buildMyMentoringItems,
} from '@/features/mentoring/model/my-mentoring-view';
import { useMentorDirectoryListQuery } from '@/features/mentoring/model/use-mentor-directory-query';
import { useMyMentoringDashboardQuery } from '@/features/mentoring/model/use-my-mentoring-dashboard-query';
import MentoringStateBoundary from '@/features/mentoring/ui/common/mentoring-state-boundary';
import MyMentoringPage from '@/features/mentoring/ui/pages/my-mentoring-page';
import { useAuthReady } from '@/hooks/common/use-auth';
function MentoringForbiddenState() {
  return (
    <SurfacePanel radius="lg" className="px-300 py-500 text-center">
      {' '}
      <h1 className="mb-100 font-designer-24b text-text-default">
        {' '}
        멘토링 정보를 불러올 수 없습니다{' '}
      </h1>{' '}
      <p className="mb-250 font-designer-14r text-text-subtle">
        {' '}
        로그인 상태를 확인한 뒤 다시 시도해주세요.{' '}
      </p>{' '}
      <Link href="/mentoring">
        {' '}
        <Button color="primary" size="large">
          {' '}
          멘토링 목록으로 이동{' '}
        </Button>{' '}
      </Link>{' '}
    </SurfacePanel>
  );
}
export default function MyMentoringPageClient() {
  const { isHydrated: isAuthHydrated, memberId } = useAuthReady();
  const mentorDirectoryQuery = useMentorDirectoryListQuery({
    page: 0,
    size: 100,
  });
  const dashboardQuery = useMyMentoringDashboardQuery({
    enabled: isAuthHydrated && Boolean(memberId),
    page: 0,
    size: 100,
  });
  const mentorMap = createMentorMap(mentorDirectoryQuery.data?.mentors ?? []);
  const items = buildMyMentoringItems({
    memberId,
    requestsByMentor: dashboardQuery.requestsByMentor,
    sessionsByMentor: dashboardQuery.sessionsByMentor,
    mentorMap,
  });
  const noteSummary = buildMyNoteConsultationSummary({
    memberId,
    requestsByMentor: dashboardQuery.requestsByMentor,
  });

  return (
    <MentoringStateBoundary
      state={
        !isAuthHydrated ||
        mentorDirectoryQuery.isLoading ||
        (memberId ? dashboardQuery.isLoading : false)
          ? 'loading'
          : memberId
            ? mentorDirectoryQuery.isError || dashboardQuery.isError
              ? 'error'
              : 'ready'
            : 'forbidden'
      }
      ready={<MyMentoringPage items={items} noteSummary={noteSummary} />}
      forbidden={<MentoringForbiddenState />}
    />
  );
}
