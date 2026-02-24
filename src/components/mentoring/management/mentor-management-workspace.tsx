'use client';

import dayjs from 'dayjs';
import { CalendarDays, ClockAlert } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import MentoringStateBoundary from '@/components/mentoring/common/mentoring-state-boundary';
import SurfacePanel from '@/components/ui/surface-panel';
import { getMentorSettings } from '@/mocks/mentoring-mock-data';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import type { MentorManagementWorkspaceProps } from '@/types/mentoring-management-ui';
import MentoringSchedulePanel from './mentoring-schedule-panel';

export default function MentorManagementWorkspace({
  memberId,
  mentor,
}: MentorManagementWorkspaceProps) {
  const ensureDemoRequests = useMentoringManagementStore(
    (state) => state.ensureDemoRequests,
  );
  const hasHydrated = useMentoringManagementStore((state) => state.hasHydrated);
  const requests = useMentoringManagementStore(
    (state) => state.requestsByMentor[mentor.id] ?? [],
  );
  const sessions = useMentoringManagementStore(
    (state) => state.sessionsByMentor[mentor.id] ?? [],
  );

  useEffect(() => {
    ensureDemoRequests(memberId, mentor.id);
  }, [ensureDemoRequests, memberId, mentor.id]);

  const mentorSettings = useMemo(() => getMentorSettings(mentor), [mentor]);

  const methodDurations = useMemo(
    () =>
      ({
        note: 0,
        phone: 15,
        online: mentorSettings.onlineDurationMinutes,
        offline: mentorSettings.offlineDurationMinutes,
      }) as const,
    [mentorSettings.offlineDurationMinutes, mentorSettings.onlineDurationMinutes],
  );

  const dashboardStats = useMemo(() => {
    const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
    const acceptedCount = requests.filter((r) => r.status === 'ACCEPTED').length;
    const today = dayjs().format('YYYY-MM-DD');
    const todaySessionCount = sessions.filter(
      (s) =>
        s.status === 'SCHEDULED' &&
        dayjs(s.startsAt).format('YYYY-MM-DD') === today,
    ).length;
    const scheduledCount = sessions.filter(
      (s) => s.status === 'SCHEDULED',
    ).length;
    const upcomingCount = sessions.filter(
      (s) => s.status === 'SCHEDULED' && dayjs(s.startsAt).isAfter(dayjs()),
    ).length;

    return { pendingCount, acceptedCount, todaySessionCount, scheduledCount, upcomingCount };
  }, [requests, sessions]);

  return (
    <MentoringStateBoundary
      state={hasHydrated ? 'ready' : 'loading'}
      ready={(
        <section className="flex flex-col gap-200">
          {/* 주요 통계 2개 */}
          <div className="grid grid-cols-2 gap-100">
            {/* 처리 대기 — 클릭 시 신청 처리 페이지로 이동 */}
            <Link href="/mentoring-management/requests">
              <SurfacePanel
                as="div"
                radius="md"
                className={`h-full px-200 py-150 transition-colors hover:bg-background-alternative ${
                  dashboardStats.pendingCount > 0
                    ? 'border-border-warning'
                    : 'border-border-subtle'
                }`}
              >
                <p className="font-designer-12m text-text-subtle mb-75 inline-flex items-center gap-50">
                  <ClockAlert
                    className={`h-14 w-14 ${dashboardStats.pendingCount > 0 ? 'text-text-warning' : ''}`}
                  />
                  처리 대기
                </p>
                <p
                  className={`font-designer-24b ${
                    dashboardStats.pendingCount > 0
                      ? 'text-text-warning'
                      : 'text-text-default'
                  }`}
                >
                  {dashboardStats.pendingCount}건
                </p>
                <p
                  className={`font-designer-11m mt-50 ${
                    dashboardStats.pendingCount > 0
                      ? 'text-text-warning'
                      : 'text-text-subtlest'
                  }`}
                >
                  {dashboardStats.pendingCount > 0
                    ? '확인이 필요합니다 →'
                    : '신청 처리 보기 →'}
                </p>
              </SurfacePanel>
            </Link>

            {/* 확정 일정 */}
            <Link href="/mentoring-management">
              <SurfacePanel
                as="div"
                radius="md"
                className={`h-full px-200 py-150 transition-colors hover:bg-background-alternative ${
                  dashboardStats.scheduledCount > 0
                    ? 'border-border-information'
                    : 'border-border-subtle'
                }`}
              >
                <p className="font-designer-12m text-text-subtle mb-75 inline-flex items-center gap-50">
                  <CalendarDays
                    className={`h-14 w-14 ${dashboardStats.scheduledCount > 0 ? 'text-text-information' : ''}`}
                  />
                  확정 일정
                </p>
                <p
                  className={`font-designer-24b ${
                    dashboardStats.scheduledCount > 0
                      ? 'text-text-information'
                      : 'text-text-default'
                  }`}
                >
                  {dashboardStats.scheduledCount}건
                </p>
                <p
                  className={`font-designer-11m mt-50 ${
                    dashboardStats.todaySessionCount > 0
                      ? 'text-text-information'
                      : 'text-text-subtlest'
                  }`}
                >
                  {dashboardStats.todaySessionCount > 0
                    ? `오늘 ${dashboardStats.todaySessionCount}건 예정 →`
                    : '일정 관리 보기 →'}
                </p>
              </SurfacePanel>
            </Link>
          </div>

          {/* 일정 관리 패널 */}
          <MentoringSchedulePanel
            mentorId={mentor.id}
            methodDurations={methodDurations}
          />
        </section>
      )}
    />
  );
}
