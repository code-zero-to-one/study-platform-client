'use client';

import Link from 'next/link';
import Button from '@/components/common/ui/button';
import SurfacePanel from '@/components/common/ui/surface-panel';
import {
  buildMyMentoringItems,
  createMentorMap,
} from '@/features/mentoring/model/my-mentoring-view';
import { useMentorDirectoryListQuery } from '@/features/mentoring/model/use-mentor-directory-query';
import MentoringStateBoundary from '@/features/mentoring/ui/common/mentoring-state-boundary';
import MyMentoringDetailPage from '@/features/mentoring/ui/pages/my-mentoring-detail-page';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';

interface MyMentoringDetailPageClientProps {
  requestId: string;
}

function MyMentoringDetailFallback({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <SurfacePanel radius="lg" className="px-300 py-500 text-center">
      <h1 className="font-designer-24b text-text-default mb-100">{title}</h1>
      <p className="font-designer-14r text-text-subtle mb-250">{description}</p>
      <Link href="/my-mentoring">
        <Button color="primary" size="large">
          나의 멘토링으로 이동
        </Button>
      </Link>
    </SurfacePanel>
  );
}

export default function MyMentoringDetailPageClient({
  requestId,
}: MyMentoringDetailPageClientProps) {
  const { isHydrated: isAuthHydrated, memberId } = useAuthReady();
  const mentorStoreHydrated = useMentorDirectoryStore(
    (state) => state.hasHydrated,
  );
  const createdMentors = useMentorDirectoryStore(
    (state) => state.createdMentors,
  );
  const managementStoreHydrated = useMentoringManagementStore(
    (state) => state.hasHydrated,
  );
  const requestsByMentor = useMentoringManagementStore(
    (state) => state.requestsByMentor,
  );
  const sessionsByMentor = useMentoringManagementStore(
    (state) => state.sessionsByMentor,
  );
  const mentorDirectoryQuery = useMentorDirectoryListQuery({
    page: 0,
    size: 100,
  });

  const mentorMap = createMentorMap([
    ...(mentorDirectoryQuery.data?.mentors ?? []),
    ...createdMentors,
  ]);
  const items = buildMyMentoringItems({
    memberId,
    requestsByMentor,
    sessionsByMentor,
    mentorMap,
  });
  const mentoring = items.find((item) => item.id === requestId);

  const isReady =
    isAuthHydrated && mentorStoreHydrated && managementStoreHydrated;

  return (
    <MentoringStateBoundary
      state={!isReady ? 'loading' : memberId ? 'ready' : 'forbidden'}
      ready={
        mentoring ? (
          <MyMentoringDetailPage mentoring={mentoring} />
        ) : (
          <MyMentoringDetailFallback
            title="멘토링 정보를 찾을 수 없습니다"
            description="선택한 멘토링이 없거나 이미 종료되어 목록에서 내려갔습니다."
          />
        )
      }
      forbidden={
        <MyMentoringDetailFallback
          title="멘토링 정보를 불러올 수 없습니다"
          description="로그인 상태를 확인한 뒤 다시 시도해주세요."
        />
      }
    />
  );
}
