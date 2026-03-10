'use client';

import Link from 'next/link';
import Button from '@/components/common/ui/button';
import SurfacePanel from '@/components/common/ui/surface-panel';
import {
  buildMyNoteConsultationSummary,
  buildMyNoteConsultationItems,
  createMentorMap,
  buildMyMentoringItems,
} from '@/features/mentoring/model/my-mentoring-view';
import { useMentorDirectoryListQuery } from '@/features/mentoring/model/use-mentor-directory-query';
import MentoringStateBoundary from '@/features/mentoring/ui/common/mentoring-state-boundary';
import MyMentoringPage from '@/features/mentoring/ui/pages/my-mentoring-page';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';

function MentoringForbiddenState() {
  return (
    <SurfacePanel radius="lg" className="px-300 py-500 text-center">
      <h1 className="font-designer-24b text-text-default mb-100">
        멘토링 정보를 불러올 수 없습니다
      </h1>
      <p className="font-designer-14r text-text-subtle mb-250">
        로그인 상태를 확인한 뒤 다시 시도해주세요.
      </p>
      <Link href="/mentoring">
        <Button color="primary" size="large">
          멘토링 목록으로 이동
        </Button>
      </Link>
    </SurfacePanel>
  );
}

export default function MyMentoringPageClient() {
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
  const noteSummary = buildMyNoteConsultationSummary({
    memberId,
    requestsByMentor,
  });
  const noteItems = buildMyNoteConsultationItems({
    memberId,
    requestsByMentor,
    mentorMap,
  });

  const isReady =
    isAuthHydrated && mentorStoreHydrated && managementStoreHydrated;

  return (
    <MentoringStateBoundary
      state={!isReady ? 'loading' : memberId ? 'ready' : 'forbidden'}
      ready={
        <MyMentoringPage
          items={items}
          noteSummary={noteSummary}
          noteItems={noteItems}
        />
      }
      forbidden={<MentoringForbiddenState />}
    />
  );
}
