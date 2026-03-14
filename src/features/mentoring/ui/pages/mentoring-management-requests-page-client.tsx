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
import {
  getMentoringMethodFlowMeta,
  MENTORING_DISCORD_INVITE_URL,
} from '@/features/mentoring/model/mentoring-flow-policy';
import { useMyMentorProfileQuery } from '@/features/mentoring/model/use-mentor-directory-query';
import MentoringStateBoundary from '@/features/mentoring/ui/common/mentoring-state-boundary';
import MentoringRequestPanel from '@/features/mentoring/ui/management/mentoring-request-panel';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import type { MentorProfile } from '@/types/mentoring/domain';

const REQUEST_CHECKLIST = [
  '예약형: 수락 시 시간·채널 함께 남기기',
  '쪽지상담: 수락 후 첫 답변까지 보내기',
  '결제 확인: 현재는 조회 전용이며 별도 확인 처리는 추후 연결됩니다.',
] as const;

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
  const myMentorProfileQuery = useMyMentorProfileQuery(
    hasHydrated && Boolean(memberId),
  );
  const myMentorProfile = myMentorProfileQuery.mentor;

  const methodDurations = useMemo(
    () => (myMentorProfile ? getMethodDurations(myMentorProfile) : null),
    [myMentorProfile],
  );

  return (
    <MentoringStateBoundary
      state={
        !hasHydrated || myMentorProfileQuery.isLoading
          ? 'loading'
          : myMentorProfileQuery.isError
            ? 'error'
            : 'ready'
      }
      loading={
        <div className="flex flex-col gap-300">
          <div className="rounded-100 bg-background-alternative h-[32px] w-[120px] animate-pulse" />
          <div className="rounded-200 bg-background-alternative h-[80px] animate-pulse" />
          <div className="rounded-200 bg-background-alternative h-[480px] animate-pulse" />
        </div>
      }
      error={
        <SurfacePanel radius="lg" className="p-300 text-center">
          <h2 className="font-designer-20b text-text-default mb-75">
            멘토 신청 정보를 불러오지 못했어요
          </h2>
          <p className="font-designer-14r text-text-subtle">
            잠시 후 다시 시도해주세요.
          </p>
        </SurfacePanel>
      }
      ready={
        <div className="flex flex-col gap-300">
          {/* 뒤로가기 */}
          <Link
            href="/mentoring-management"
            className="font-designer-14m text-text-subtle hover:text-text-default inline-flex w-fit items-center gap-75 transition-colors"
          >
            <ArrowLeft className="h-14 w-14" />
            운영 관리
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
                ? '선택한 신청을 처리하세요.'
                : '들어온 신청을 처리하세요.'}
            </p>
          </div>

          <SurfacePanel radius="lg" className="p-250">
            <div className="flex flex-col gap-200 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-125">
                <div>
                  <h2 className="font-designer-18b text-text-default">
                    처리 전 체크
                  </h2>
                  <p className="font-designer-13r text-text-subtle mt-50">
                    바로 필요한 기준만 모았습니다.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-125 md:grid-cols-3">
                  {REQUEST_CHECKLIST.map((item) => (
                    <article
                      key={item}
                      className="rounded-150 border-border-subtle bg-background-alternative border p-200"
                    >
                      <p className="font-designer-14m text-text-default">
                        {item}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
              <Button asChild color="outlined" size="medium">
                <a
                  href={MENTORING_DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  디스코드 입장
                  <SquareArrowOutUpRight className="h-16 w-16" />
                </a>
              </Button>
            </div>
          </SurfacePanel>

          <SurfacePanel radius="lg" className="p-250">
            <div className="mb-150">
              <h2 className="font-designer-18b text-text-default">
                상담 방식별 핵심
              </h2>
              <p className="font-designer-13r text-text-subtle mt-50">
                방식별 처리 기준만 정리했습니다.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-125 md:grid-cols-2">
              {(
                [
                  ['note', '쪽지상담'],
                  ['simple', '간편상담'],
                  ['deep', '심층상담'],
                  ['offline', '대면상담'],
                ] as const
              ).map(([method, label]) => {
                const flowMeta = getMentoringMethodFlowMeta(method);

                return (
                  <article
                    key={method}
                    className="rounded-150 border-border-subtle bg-background-alternative border p-200"
                  >
                    <p className="font-designer-14b text-text-default">
                      {label}
                    </p>
                    <p className="font-designer-13r text-text-subtle mt-50 leading-relaxed">
                      {flowMeta.mentorAction}
                    </p>
                  </article>
                );
              })}
            </div>
          </SurfacePanel>

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
                멘토링을 먼저 등록해야 신청을 관리할 수 있어요.
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
