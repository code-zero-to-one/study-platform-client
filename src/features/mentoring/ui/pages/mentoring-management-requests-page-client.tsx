'use client';

import {
  ArrowLeft,
  ClipboardList,
  GraduationCap,
  SquareArrowOutUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import Button from '@/components/common/ui/button';
import SurfacePanel from '@/components/common/ui/surface-panel';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { getMentorSettings } from '@/features/mentoring/model/mentor-profile-utils';
import MentoringStateBoundary from '@/features/mentoring/ui/common/mentoring-state-boundary';
import MentoringRequestPanel from '@/features/mentoring/ui/management/mentoring-request-panel';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import type { MentorProfile } from '@/types/mentoring/domain';

const getMethodDurations = (mentor: MentorProfile) => {
  const settings = getMentorSettings(mentor);

  return {
    note: 0,
    simple: 15,
    deep: settings.deepDurationMinutes,
    offline: settings.offlineDurationMinutes,
  } as const;
};

interface MentoringManagementRequestsPageClientProps {
  initialRequestId?: string;
}

export default function MentoringManagementRequestsPageClient({
  initialRequestId,
}: MentoringManagementRequestsPageClientProps) {
  const { memberId } = useAuthReady();
  const highlightRequestId = initialRequestId;

  const hasHydrated = useMentorDirectoryStore((state) => state.hasHydrated);
  const mentorIdByMember = useMentorDirectoryStore(
    (state) => state.mentorIdByMember,
  );
  const createdMentors = useMentorDirectoryStore(
    (state) => state.createdMentors,
  );

  const myMentorId = memberId ? mentorIdByMember[memberId] : undefined;
  const myMentorProfile = createdMentors.find((m) => m.id === myMentorId);

  const methodDurations = useMemo(
    () => (myMentorProfile ? getMethodDurations(myMentorProfile) : null),
    [myMentorProfile],
  );

  return (
    <MentoringStateBoundary
      state={hasHydrated ? 'ready' : 'loading'}
      loading={
        <div className="flex flex-col gap-300">
          <div className="rounded-100 bg-background-alternative h-[32px] w-[120px] animate-pulse" />
          <div className="rounded-200 bg-background-alternative h-[80px] animate-pulse" />
          <div className="rounded-200 bg-background-alternative h-[480px] animate-pulse" />
        </div>
      }
      ready={
        <div className="flex flex-col gap-300">
          {/* 뒤로가기 */}
          <Link
            href="/mentoring-management"
            className="font-designer-14m text-text-subtle hover:text-text-default inline-flex w-fit items-center gap-75 transition-colors"
          >
            <ArrowLeft className="h-14 w-14" />
            일정 관리
          </Link>

          {/* 페이지 타이틀 */}
          <div className="text-center">
            <div className="mb-100 inline-flex items-center gap-100">
              <ClipboardList className="text-text-brand h-24 w-24" />
              <h1 className="font-designer-24b text-text-default">
                {highlightRequestId ? '신청 상세' : '신청 목록'}
              </h1>
            </div>
            <p className="font-designer-14r text-text-subtle">
              {highlightRequestId
                ? '해당 신청을 검토하고 수락하거나 거절하세요.'
                : '멘티의 신청을 검토하고 수락하거나 거절하세요.'}
            </p>
          </div>

          {myMentorProfile && memberId && methodDurations ? (
            <MentoringRequestPanel
              mentorId={myMentorProfile.id}
              methodDurations={methodDurations}
              initialExpandedId={highlightRequestId}
              filterRequestId={highlightRequestId}
            />
          ) : (
            <SurfacePanel
              radius="lg"
              className="flex min-h-[420px] flex-col items-center justify-center px-300 py-500 text-center"
            >
              <div className="bg-fill-brand-subtle-default rounded-500 mb-200 flex h-[72px] w-[72px] items-center justify-center">
                <GraduationCap className="text-text-brand h-32 w-32" />
              </div>
              <h2 className="font-designer-24b text-text-default mb-75">
                등록된 멘토 프로필이 없습니다
              </h2>
              <p className="font-designer-14r text-text-subtle mb-250">
                멘토링을 먼저 등록해야 신청 내역을 관리할 수 있어요.
              </p>
              <Link href="/mentoring/become-mentor">
                <Button color="primary" size="large">
                  멘토링 만들기
                </Button>
              </Link>
              <Link
                href="/mentoring-management"
                className="font-designer-14m text-text-subtle mt-150 inline-flex items-center gap-50"
              >
                돌아가기
                <SquareArrowOutUpRight className="h-14 w-14" />
              </Link>
            </SurfacePanel>
          )}
        </div>
      }
    />
  );
}
