'use client';

import dayjs from 'dayjs';
import {
  CalendarDays,
  CheckCheck,
  ClockAlert,
  MessageCircleHeart,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { type MentorProfile } from '@/mocks/mentoring-mock-data';
import { getMentorSettings } from '@/mocks/mentoring-mock-data';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import MentoringRequestPanel from './mentoring-request-panel';
import MentoringSchedulePanel from './mentoring-schedule-panel';

type WorkspaceTab = 'request' | 'schedule';

interface MentorManagementWorkspaceProps {
  memberId: number;
  mentor: MentorProfile;
}

const tabItems: Array<{ id: WorkspaceTab; label: string }> = [
  { id: 'request', label: '신청함 운영' },
  { id: 'schedule', label: '일정 관리' },
];

export default function MentorManagementWorkspace({
  memberId,
  mentor,
}: MentorManagementWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('request');
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

  const mentorSettings = useMemo(() => {
    return getMentorSettings(mentor);
  }, [mentor]);
  const methodDurations = useMemo(() => {
    return {
      note: 0,
      phone: 15,
      online: mentorSettings.onlineDurationMinutes,
      offline: mentorSettings.offlineDurationMinutes,
    } as const;
  }, [
    mentorSettings.offlineDurationMinutes,
    mentorSettings.onlineDurationMinutes,
  ]);

  const dashboardStats = useMemo(() => {
    const pendingCount = requests.filter(
      (request) => request.status === 'PENDING',
    ).length;
    const acceptedCount = requests.filter(
      (request) => request.status === 'ACCEPTED',
    ).length;
    const today = dayjs().format('YYYY-MM-DD');
    const todaySessionCount = sessions.filter((session) => {
      return (
        session.status === 'SCHEDULED' &&
        dayjs(session.startsAt).format('YYYY-MM-DD') === today
      );
    }).length;
    const upcomingCount = sessions.filter((session) => {
      return (
        session.status === 'SCHEDULED' &&
        dayjs(session.startsAt).isAfter(dayjs())
      );
    }).length;

    return {
      pendingCount,
      acceptedCount,
      todaySessionCount,
      upcomingCount,
    };
  }, [requests, sessions]);

  if (!hasHydrated) {
    return (
      <div className="rounded-200 bg-background-alternative h-[360px] animate-pulse" />
    );
  }

  return (
    <section className="flex flex-col gap-200">
      <div className="grid grid-cols-1 gap-100 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-150 border-border-subtle bg-background-default border px-150 py-125">
          <p className="font-designer-12m text-text-subtle mb-50 inline-flex items-center gap-50">
            <ClockAlert className="h-14 w-14" />
            처리 대기
          </p>
          <p className="font-designer-24b text-text-default">
            {dashboardStats.pendingCount}건
          </p>
        </div>
        <div className="rounded-150 border-border-subtle bg-background-default border px-150 py-125">
          <p className="font-designer-12m text-text-subtle mb-50 inline-flex items-center gap-50">
            <CheckCheck className="h-14 w-14" />
            수락 완료
          </p>
          <p className="font-designer-24b text-text-default">
            {dashboardStats.acceptedCount}건
          </p>
        </div>
        <div className="rounded-150 border-border-subtle bg-background-default border px-150 py-125">
          <p className="font-designer-12m text-text-subtle mb-50 inline-flex items-center gap-50">
            <CalendarDays className="h-14 w-14" />
            오늘 일정
          </p>
          <p className="font-designer-24b text-text-default">
            {dashboardStats.todaySessionCount}건
          </p>
        </div>
        <div className="rounded-150 border-border-subtle bg-background-default border px-150 py-125">
          <p className="font-designer-12m text-text-subtle mb-50 inline-flex items-center gap-50">
            <MessageCircleHeart className="h-14 w-14" />
            예정 상담
          </p>
          <p className="font-designer-24b text-text-default">
            {dashboardStats.upcomingCount}건
          </p>
        </div>
      </div>

      <div className="rounded-150 bg-background-alternative p-75">
        <div className="flex flex-wrap gap-75">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={
                activeTab === tab.id
                  ? 'rounded-100 bg-fill-brand-subtle-default font-designer-14b text-text-brand px-150 py-100'
                  : 'rounded-100 font-designer-14m text-text-subtle px-150 py-100'
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'request' ? (
        <MentoringRequestPanel
          mentorId={mentor.id}
          methodDurations={methodDurations}
        />
      ) : (
        <MentoringSchedulePanel
          mentorId={mentor.id}
          methodDurations={methodDurations}
        />
      )}
    </section>
  );
}
