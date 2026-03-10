'use client';

import dayjs from 'dayjs';
import {
  CalendarDays,
  CircleDollarSign,
  ClockAlert,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import SurfacePanel from '@/components/common/ui/surface-panel';
import {
  getMentorSettings,
  getMethodLabel,
} from '@/features/mentoring/model/mentor-profile-utils';
import MentoringStateBoundary from '@/features/mentoring/ui/common/mentoring-state-boundary';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import type { MentoringRequest } from '@/types/mentoring/management-domain';
import type { MentorManagementWorkspaceProps } from '@/types/mentoring/management-view';
import MentoringSchedulePanel from './mentoring-schedule-panel';

const hasMentorFirstReply = (request: MentoringRequest) => {
  return request.conversation.some((message) => message.sender === 'MENTOR');
};

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
        simple: 15,
        deep: mentorSettings.deepDurationMinutes,
        offline: mentorSettings.offlineDurationMinutes,
      }) as const,
    [mentorSettings.offlineDurationMinutes, mentorSettings.deepDurationMinutes],
  );

  const dashboardStats = useMemo(() => {
    const pendingRequests = requests.filter((r) => r.status === 'PENDING');
    const pendingCount = pendingRequests.length;
    const today = dayjs().format('YYYY-MM-DD');
    const overduePendingCount = pendingRequests.filter((request) => {
      return dayjs().diff(dayjs(request.requestedAt), 'hour') >= 24;
    }).length;
    const paymentPendingCount = pendingRequests.filter((request) => {
      return (
        request.paymentMode === 'MANUAL_TRANSFER' &&
        request.paymentStatus === 'PENDING_TRANSFER'
      );
    }).length;
    const noteFirstReplyCount = requests.filter((request) => {
      return (
        request.method === 'note' &&
        request.status === 'ACCEPTED' &&
        !hasMentorFirstReply(request)
      );
    }).length;
    const todaySessionCount = sessions.filter(
      (s) =>
        s.status === 'SCHEDULED' &&
        dayjs(s.startsAt).format('YYYY-MM-DD') === today,
    ).length;
    const scheduledCount = sessions.filter(
      (s) => s.status === 'SCHEDULED',
    ).length;
    const followUpCount = sessions.filter((session) => {
      return (
        session.issueType !== undefined &&
        session.issueType !== 'NONE' &&
        (session.refundStatus === 'PENDING' || session.status === 'CANCELLED')
      );
    }).length;

    return {
      pendingCount,
      overduePendingCount,
      paymentPendingCount,
      noteFirstReplyCount,
      todaySessionCount,
      scheduledCount,
      followUpCount,
    };
  }, [requests, sessions]);

  const exceptionBreakdown = useMemo(() => {
    return [
      {
        key: 'mentor-cancelled',
        label: '멘토 취소',
        count: sessions.filter(
          (session) => session.issueType === 'MENTOR_CANCELLED',
        ).length,
        description:
          '멘토 사정으로 취소된 건입니다. 후속 안내와 환불 상태를 같이 확인하세요.',
      },
      {
        key: 'mentee-cancelled',
        label: '멘티 취소',
        count: sessions.filter(
          (session) => session.issueType === 'MENTEE_CANCELLED',
        ).length,
        description: '취소 시점에 따라 환불 기준이 달라질 수 있습니다.',
      },
      {
        key: 'mentor-no-show',
        label: '멘토 노쇼',
        count: sessions.filter(
          (session) => session.issueType === 'MENTOR_NO_SHOW',
        ).length,
        description: '재예약 또는 환불 공지를 빠르게 남기는 편이 안전합니다.',
      },
      {
        key: 'mentee-no-show',
        label: '멘티 노쇼',
        count: sessions.filter(
          (session) => session.issueType === 'MENTEE_NO_SHOW',
        ).length,
        description:
          '판단 근거와 환불 불가 여부를 명확히 남겨야 분쟁을 줄일 수 있습니다.',
      },
      {
        key: 'refund-pending',
        label: '환불 대기',
        count: sessions.filter((session) => session.refundStatus === 'PENDING')
          .length,
        description: '후속 알림과 환불 상태 갱신이 남아 있는 상담입니다.',
      },
    ].filter((item) => item.count > 0);
  }, [sessions]);

  const priorityQueue = useMemo(() => {
    const queue: Array<{
      key: string;
      title: string;
      subtitle: string;
      description: string;
      href: string;
      actionLabel: string;
      tone: 'red' | 'orange' | 'blue';
      priority: number;
      sortValue: number;
    }> = [];

    requests.forEach((request) => {
      const requestedAtValue = dayjs(request.requestedAt).valueOf();
      const requestedAtLabel = dayjs(request.requestedAt).format(
        'MM.DD HH:mm 접수',
      );
      const methodLabel = getMethodLabel(request.method);
      const requestHref = `/mentoring-management/requests?id=${request.id}`;
      const overdueHours = dayjs().diff(dayjs(request.requestedAt), 'hour');

      if (
        request.status === 'PENDING' &&
        request.paymentMode === 'MANUAL_TRANSFER' &&
        request.paymentStatus === 'PENDING_TRANSFER'
      ) {
        queue.push({
          key: `payment-${request.id}`,
          title: `${request.menteeName} · 입금 확인`,
          subtitle: `${methodLabel} · ${requestedAtLabel}`,
          description:
            '수동결제 건입니다. 입금 확인이 끝나야 수락과 답변이 열립니다.',
          href: requestHref,
          actionLabel: '입금 확인',
          tone: overdueHours >= 24 ? 'red' : 'orange',
          priority: overdueHours >= 24 ? 0 : 1,
          sortValue: requestedAtValue,
        });

        return;
      }

      if (request.status === 'PENDING') {
        queue.push({
          key: `pending-${request.id}`,
          title: `${request.menteeName} · ${
            request.method === 'note' ? '수락 결정' : '일정 검토'
          }`,
          subtitle: `${methodLabel} · ${requestedAtLabel}`,
          description:
            overdueHours >= 24
              ? '24시간 넘긴 신청입니다. 확인 지연은 이탈과 CS로 바로 이어질 수 있습니다.'
              : '질문 범위와 희망 일정을 본 뒤 수락 또는 거절을 결정하세요.',
          href: requestHref,
          actionLabel: request.method === 'note' ? '수락 결정' : '일정 검토',
          tone: overdueHours >= 24 ? 'red' : 'orange',
          priority: overdueHours >= 24 ? 1 : 2,
          sortValue: requestedAtValue,
        });

        return;
      }

      if (request.method === 'note' && !hasMentorFirstReply(request)) {
        queue.push({
          key: `note-reply-${request.id}`,
          title: `${request.menteeName} · 첫 답변 필요`,
          subtitle: `${methodLabel} · ${requestedAtLabel}`,
          description:
            '첫 답변을 보내야 멘티가 같은 화면에서 후속 질문을 이어갈 수 있습니다.',
          href: requestHref,
          actionLabel: '첫 답변 준비',
          tone: 'blue',
          priority: 3,
          sortValue: requestedAtValue,
        });
      }
    });

    sessions.forEach((session) => {
      const startsAtValue = dayjs(session.startsAt).valueOf();
      const startsAtLabel = dayjs(session.startsAt).format('MM.DD HH:mm');
      const methodLabel = getMethodLabel(session.method);

      if (
        session.status === 'SCHEDULED' &&
        dayjs(session.startsAt).isSame(dayjs(), 'day')
      ) {
        queue.push({
          key: `today-${session.id}`,
          title: `${session.menteeName} · 오늘 상담 준비`,
          subtitle: `${methodLabel} · ${startsAtLabel}`,
          description:
            '진행 채널, 링크, 장소 안내가 최신인지 상담 전에 다시 확인하세요.',
          href: '/mentoring-management',
          actionLabel: '일정 확인',
          tone: 'blue',
          priority: 4,
          sortValue: startsAtValue,
        });
      }

      if (
        session.refundStatus === 'PENDING' ||
        session.status === 'CANCELLED'
      ) {
        queue.push({
          key: `follow-up-${session.id}`,
          title: `${session.menteeName} · 후속 처리`,
          subtitle: `${methodLabel} · ${startsAtLabel}`,
          description:
            session.refundStatus === 'PENDING'
              ? '환불 진행과 후속 안내가 아직 끝나지 않았습니다.'
              : '취소 또는 예외 처리 결과가 멘티에게 충분히 전달됐는지 확인하세요.',
          href: '/mentoring-management',
          actionLabel: '후속 확인',
          tone: session.refundStatus === 'PENDING' ? 'red' : 'orange',
          priority: session.refundStatus === 'PENDING' ? 2 : 5,
          sortValue: startsAtValue,
        });
      }
    });

    return queue
      .sort((first, second) => {
        if (first.priority !== second.priority) {
          return first.priority - second.priority;
        }

        return first.sortValue - second.sortValue;
      })
      .slice(0, 6);
  }, [requests, sessions]);

  return (
    <MentoringStateBoundary
      state={hasHydrated ? 'ready' : 'loading'}
      ready={
        <section className="flex flex-col gap-200">
          <div className="grid grid-cols-2 gap-100 xl:grid-cols-4">
            <Link href="/mentoring-management/requests">
              <SurfacePanel
                as="div"
                radius="md"
                className={`hover:bg-background-alternative h-full px-200 py-150 transition-colors ${
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
                    ? '신청 처리 현황 보기 →'
                    : '신청 처리 보기 →'}
                </p>
              </SurfacePanel>
            </Link>

            <Link href="/mentoring-management/requests">
              <SurfacePanel
                as="div"
                radius="md"
                className={`hover:bg-background-alternative h-full px-200 py-150 transition-colors ${
                  dashboardStats.paymentPendingCount > 0
                    ? 'border-border-warning'
                    : 'border-border-subtle'
                }`}
              >
                <p className="font-designer-12m text-text-subtle mb-75 inline-flex items-center gap-50">
                  <CircleDollarSign
                    className={`h-14 w-14 ${dashboardStats.paymentPendingCount > 0 ? 'text-text-warning' : ''}`}
                  />
                  입금 확인
                </p>
                <p
                  className={`font-designer-24b ${
                    dashboardStats.paymentPendingCount > 0
                      ? 'text-text-warning'
                      : 'text-text-default'
                  }`}
                >
                  {dashboardStats.paymentPendingCount}건
                </p>
                <p className="font-designer-11m text-text-subtlest mt-50">
                  수동결제 현황 보기 →
                </p>
              </SurfacePanel>
            </Link>

            <Link href="/mentoring-management">
              <SurfacePanel
                as="div"
                radius="md"
                className={`hover:bg-background-alternative h-full px-200 py-150 transition-colors ${
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

            <Link href="/mentoring-management">
              <SurfacePanel
                as="div"
                radius="md"
                className={`hover:bg-background-alternative h-full px-200 py-150 transition-colors ${
                  dashboardStats.followUpCount > 0
                    ? 'border-border-warning'
                    : 'border-border-subtle'
                }`}
              >
                <p className="font-designer-12m text-text-subtle mb-75 inline-flex items-center gap-50">
                  <ShieldAlert
                    className={`h-14 w-14 ${dashboardStats.followUpCount > 0 ? 'text-text-warning' : ''}`}
                  />
                  후속 처리
                </p>
                <p
                  className={`font-designer-24b ${
                    dashboardStats.followUpCount > 0
                      ? 'text-text-warning'
                      : 'text-text-default'
                  }`}
                >
                  {dashboardStats.followUpCount}건
                </p>
                <p className="font-designer-11m text-text-subtlest mt-50">
                  예외 상황 현황 보기 →
                </p>
              </SurfacePanel>
            </Link>
          </div>

          {priorityQueue.length > 0 ? (
            <SurfacePanel radius="md" className="p-200">
              <div className="mb-125 flex items-center gap-75">
                <ClockAlert className="text-text-warning h-16 w-16" />
                <h2 className="font-designer-16b text-text-default">
                  지금 처리할 일
                </h2>
              </div>
              <div className="grid gap-100 md:grid-cols-2 xl:grid-cols-3">
                {priorityQueue.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="rounded-150 border-border-subtle bg-background-alternative hover:bg-background-default border px-150 py-125 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-75">
                      <div className="min-w-0">
                        <p className="font-designer-14b text-text-default">
                          {item.title}
                        </p>
                        <p className="font-designer-12r text-text-subtle mt-25">
                          {item.subtitle}
                        </p>
                      </div>
                      <span
                        className={`font-designer-12m shrink-0 ${
                          item.tone === 'red'
                            ? 'text-text-error'
                            : item.tone === 'orange'
                              ? 'text-text-warning'
                              : 'text-text-information'
                        }`}
                      >
                        {item.actionLabel}
                      </span>
                    </div>
                    <p className="font-designer-12r text-text-subtle mt-50 leading-relaxed">
                      {item.description}
                    </p>
                  </Link>
                ))}
              </div>
            </SurfacePanel>
          ) : null}

          {exceptionBreakdown.length > 0 ? (
            <SurfacePanel radius="md" className="p-200">
              <div className="mb-125 flex items-center gap-75">
                <ShieldAlert className="text-text-warning h-16 w-16" />
                <h2 className="font-designer-16b text-text-default">
                  예외 상황 분해
                </h2>
              </div>
              <div className="grid gap-100 md:grid-cols-2 xl:grid-cols-3">
                {exceptionBreakdown.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-150 border-border-subtle bg-background-alternative border px-150 py-125"
                  >
                    <div className="flex items-center justify-between gap-75">
                      <p className="font-designer-14b text-text-default">
                        {item.label}
                      </p>
                      <span className="font-designer-12m text-text-warning">
                        {item.count}건
                      </span>
                    </div>
                    <p className="font-designer-12r text-text-subtle mt-25">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </SurfacePanel>
          ) : null}

          <MentoringSchedulePanel
            mentorId={mentor.id}
            methodDurations={methodDurations}
          />
        </section>
      }
    />
  );
}
