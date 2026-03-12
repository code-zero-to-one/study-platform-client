'use client';
import {
  GraduationCap,
  Info,
  Settings2,
  SquareArrowOutUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import Button from '@/components/common/ui/button';
import SectionHeader from '@/components/common/ui/section-header';
import SectionShell from '@/components/common/ui/section-shell';
import SurfacePanel from '@/components/common/ui/surface-panel';
import { getMentorSettings } from '@/features/mentoring/model/mentor-profile-utils';
import { useMyMentorProfileQuery } from '@/features/mentoring/model/use-mentor-directory-query';
import MentoringGuideModal from '@/features/mentoring/ui/common/mentoring-guide-modal';
import MentoringStateBoundary from '@/features/mentoring/ui/common/mentoring-state-boundary';
import MentorManagementWorkspace from '@/features/mentoring/ui/management/mentor-management-workspace';
import NoteConsultationContainer from '@/features/mentoring/ui/note-consultation/note-consultation-container';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import type { MentorProfile } from '@/types/mentoring/domain';
import type { MentoringRequest } from '@/types/mentoring/management-domain';
type ManagementViewTab = 'NOTE' | 'RESERVATION';
const EMPTY_REQUESTS: MentoringRequest[] = [];
const getEnabledMethodCount = (mentor: MentorProfile) => {
  return Object.values(mentor.methods).filter(
    (method) => method.enabled === true,
  ).length;
};
export default function MentoringManagementPageClient() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { memberId } = useAuthReady();
  const hasHydrated = useMentorDirectoryStore((state) => state.hasHydrated);
  const myMentorProfileQuery = useMyMentorProfileQuery(
    hasHydrated && Boolean(memberId),
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
      error={
        <SurfacePanel radius="lg" className="p-300 text-center">
          {' '}
          <h2 className="mb-75 font-designer-20b text-text-default">
            {' '}
            멘토 운영 정보를 불러오지 못했어요{' '}
          </h2>{' '}
          <p className="font-designer-14r text-text-subtle">
            {' '}
            잠시 후 다시 시도해주세요.{' '}
          </p>{' '}
        </SurfacePanel>
      }
      ready={(() => {
        const myMentorProfile = myMentorProfileQuery.mentor;
        if (!myMentorProfile) {
          return <MentoringManagementEmpty />;
        }

        return (
          <MentoringManagementReady
            memberId={memberId}
            mentor={myMentorProfile}
            isGuideOpen={isGuideOpen}
            onGuideOpenChange={setIsGuideOpen}
          />
        );
      })()}
    />
  );
}
function MentoringManagementReady({
  memberId,
  mentor,
  isGuideOpen,
  onGuideOpenChange,
}: {
  memberId?: number;
  mentor: MentorProfile;
  isGuideOpen: boolean;
  onGuideOpenChange: (open: boolean) => void;
}) {
  const mentorSettings = getMentorSettings(mentor);
  const mentorRequests = useMentoringManagementStore(
    (state) => state.requestsByMentor[mentor.id],
  );
  const requests = mentorRequests ?? EMPTY_REQUESTS;
  const noteCount = useMemo(
    () => requests.filter((r) => r.method === 'note').length,
    [requests],
  );
  const reservationCount = useMemo(
    () => requests.filter((r) => r.method !== 'note').length,
    [requests],
  );
  const [activeView, setActiveView] = useState<ManagementViewTab>('NOTE');
  const viewTabs = [
    {
      key: 'NOTE' as const,
      label: '쪽지상담',
      description: '멘티가 보낸 비동기 상담을 확인하고 답변합니다.',
      count: noteCount,
    },
    {
      key: 'RESERVATION' as const,
      label: '예약상담',
      description: '간편상담, 심층상담, 대면상담 신청을 단계별로 관리합니다.',
      count: reservationCount,
    },
  ];

  return (
    <SectionShell className="gap-400">
      {' '}
      <SectionHeader
        title="멘토 운영 관리"
        description={`${mentorSettings.mentoringTitle?.trim() || '멘토링'} · 상담 방식 ${getEnabledMethodCount(mentor)}개 운영 중`}
        titleClassName="font-designer-24b text-text-default"
        descriptionClassName="max-w-[720px] font-designer-14r text-text-subtle"
        rightSlot={
          <div className="flex shrink-0 items-center gap-100">
            {' '}
            <Link href="/mentoring/become-mentor">
              {' '}
              <Button
                color="outlined"
                size="small"
                icon={<Settings2 className="h-14 w-14" />}
              >
                {' '}
                설정 수정{' '}
              </Button>{' '}
            </Link>{' '}
            <Link href={`/mentoring/${mentor.id}`}>
              {' '}
              <Button color="outlined" size="small">
                {' '}
                프로필 보기{' '}
              </Button>{' '}
            </Link>{' '}
            <button
              type="button"
              className="hover:text-text-default inline-flex items-center gap-50 transition-colors font-designer-14m text-text-subtle"
              onClick={() => onGuideOpenChange(true)}
            >
              {' '}
              <Info className="h-14 w-14" /> 운영 안내{' '}
            </button>{' '}
          </div>
        }
      />{' '}
      <section className="rounded-200 border-border-subtle bg-background-default border p-150">
        {' '}
        <div className="bg-background-alternative rounded-150 grid grid-cols-1 gap-75 p-50 md:grid-cols-2">
          {' '}
          {viewTabs.map((tab) => {
            const isActive = tab.key === activeView;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveView(tab.key)}
                className={`rounded-100 px-200 py-200 text-left transition-colors ${isActive ? 'bg-fill-brand-subtle-default' : 'hover:bg-background-default'}`}
              >
                {' '}
                <div className="flex items-start justify-between gap-100">
                  {' '}
                  <div className="min-w-0">
                    {' '}
                    <p
                      className={`font-designer-15b ${isActive ? 'text-text-brand' : 'text-text-default'}`}
                    >
                      {' '}
                      {tab.label}{' '}
                    </p>{' '}
                    <p className="mt-25 font-designer-12r text-text-subtle">
                      {' '}
                      {tab.description}{' '}
                    </p>{' '}
                  </div>{' '}
                  <span className="shrink-0 font-designer-12m text-text-subtle">
                    {' '}
                    {tab.count}건{' '}
                  </span>{' '}
                </div>{' '}
              </button>
            );
          })}{' '}
        </div>{' '}
      </section>{' '}
      {activeView === 'NOTE' ? (
        <NoteConsultationContainer
          initialChannel="received"
          lockedChannel="received"
          statusTabPreset="mentor"
          hideToolbar
        />
      ) : memberId ? (
        <MentorManagementWorkspace memberId={memberId} mentor={mentor} />
      ) : null}{' '}
      <MentoringGuideModal
        open={isGuideOpen}
        onOpenChange={onGuideOpenChange}
      />{' '}
    </SectionShell>
  );
}
function MentoringManagementEmpty() {
  return (
    <SectionShell className="gap-400">
      {' '}
      <SectionHeader
        title="멘토 운영 관리"
        description="멘티의 상담 신청을 확인하고, 단계별로 관리합니다."
        titleClassName="font-designer-24b text-text-default"
        descriptionClassName="font-designer-14r text-text-subtle"
      />{' '}
      <SurfacePanel
        radius="lg"
        className="flex min-h-[420px] flex-col items-center justify-center px-300 py-500 text-center"
      >
        {' '}
        <div className="bg-fill-brand-subtle-default rounded-500 mb-200 flex h-[72px] w-[72px] items-center justify-center">
          {' '}
          <GraduationCap className="text-text-brand h-32 w-32" />{' '}
        </div>{' '}
        <h2 className="mb-75 font-designer-24b text-text-default">
          {' '}
          아직 운영 중인 멘토링이 없어요{' '}
        </h2>{' '}
        <p className="mb-50 font-designer-16m text-text-default">
          {' '}
          멘토로 운영할 멘토링을 먼저 등록하세요.{' '}
        </p>{' '}
        <p className="mb-250 font-designer-14r text-text-subtle">
          {' '}
          등록 후 이 화면에서 신청과 일정을 관리할 수 있어요.{' '}
        </p>{' '}
        <Link href="/mentoring/become-mentor">
          {' '}
          <Button color="primary" size="large">
            {' '}
            멘토링 만들기{' '}
          </Button>{' '}
        </Link>{' '}
        <Link
          href="/mentoring"
          className="mt-150 inline-flex items-center gap-50 font-designer-14m text-text-subtle"
        >
          {' '}
          멘토링 목록 보러가기 <SquareArrowOutUpRight className="h-14 w-14" />{' '}
        </Link>{' '}
      </SurfacePanel>{' '}
    </SectionShell>
  );
}
