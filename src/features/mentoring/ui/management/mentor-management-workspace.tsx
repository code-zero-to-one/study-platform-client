'use client';
import dayjs from 'dayjs';
import { CalendarDays, Check, ChevronRight, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import {
  MENTORING_REQUEST_STATUS_META,
  MENTORING_SESSION_ISSUE_META,
  MENTORING_SESSION_STATUS_META,
} from '@/features/mentoring/model/management-status-meta';
import { getMethodLabel } from '@/features/mentoring/model/mentor-profile-utils';
import MentoringStateBoundary from '@/features/mentoring/ui/common/mentoring-state-boundary';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import type {
  MentoringRequest,
  MentoringSession,
} from '@/types/mentoring/management-domain';
import type { MentorManagementWorkspaceProps } from '@/types/mentoring/management-view';
type ManagementStageKey = 'PENDING' | 'SCHEDULED' | 'DONE';
const EMPTY_REQUESTS: MentoringRequest[] = [];
const EMPTY_SESSIONS: MentoringSession[] = [];
interface ManagementCardItem {
  id: string;
  requestId: string;
  menteeName: string;
  methodLabel: string;
  dateLabel: string;
  scheduleText: string;
  previewText: string;
  previewLabel: string;
  statusLabel: string;
  statusColor: 'green' | 'orange' | 'blue' | 'red' | 'gray';
  stage: ManagementStageKey;
  canAccept: boolean;
  canReject: boolean;
  detailHref: string;
  sortValue: number;
}
const REQUEST_PREVIEW_MAX = 80;
const toPreview = (text: string) => {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= REQUEST_PREVIEW_MAX) {
    return normalized;
  }

  return `${normalized.slice(0, REQUEST_PREVIEW_MAX).trimEnd()}...`;
};
const getStageForRequest = (
  request: MentoringRequest,
  session?: MentoringSession,
): ManagementStageKey => {
  if (request.status === 'PENDING') {
    return 'PENDING';
  }
  if (request.status === 'REJECTED') {
    return 'DONE';
  }
  if (!session) {
    return 'PENDING';
  }
  if (session.status === 'SCHEDULED') {
    return 'SCHEDULED';
  }

  return 'DONE';
};
const getCardStatus = (
  request: MentoringRequest,
  session?: MentoringSession,
): { label: string; color: 'green' | 'orange' | 'blue' | 'red' | 'gray' } => {
  if (request.status === 'PENDING') {
    return MENTORING_REQUEST_STATUS_META.PENDING;
  }
  if (request.status === 'REJECTED') {
    return MENTORING_REQUEST_STATUS_META.REJECTED;
  }
  if (!session) {
    return { label: '수락 완료', color: 'green' };
  }
  const issueType = session.issueType;
  if (
    issueType &&
    issueType !== 'NONE' &&
    (session.status === 'CANCELLED' ||
      issueType === 'MENTOR_NO_SHOW' ||
      issueType === 'MENTEE_NO_SHOW')
  ) {
    return MENTORING_SESSION_ISSUE_META[issueType];
  }

  return MENTORING_SESSION_STATUS_META[session.status];
};
const getScheduleText = (
  request: MentoringRequest,
  session?: MentoringSession,
) => {
  if (session) {
    return `${dayjs(session.startsAt).format('YYYY.MM.DD HH:mm')} - ${dayjs(session.endsAt).format('HH:mm')}`;
  }
  if (request.preferredDate) {
    const date = dayjs(request.preferredDate).format('YYYY.MM.DD');

    return request.preferredTime
      ? `희망 일정: ${date} ${request.preferredTime}`
      : `희망 일정: ${date}`;
  }

  return '일정 미정';
};
const getPreviewInfo = (
  request: MentoringRequest,
  session?: MentoringSession,
) => {
  if (request.status === 'REJECTED' && request.decisionNote?.trim()) {
    return { label: '거절 사유', text: toPreview(request.decisionNote) };
  }
  if (session?.operationNote?.trim()) {
    return { label: '운영 메모', text: toPreview(session.operationNote) };
  }
  if (session?.placeNote?.trim()) {
    return { label: '진행 장소', text: toPreview(session.placeNote) };
  }

  return { label: '요청 내용', text: toPreview(request.requestMessage) };
};
const buildManagementCards = (
  requests: MentoringRequest[],
  sessions: MentoringSession[],
): ManagementCardItem[] => {
  const sessionMap = new Map(sessions.map((s) => [s.id, s]));

  return requests
    .map((request) => {
      const session = request.linkedSessionId
        ? sessionMap.get(request.linkedSessionId)
        : undefined;
      const stage = getStageForRequest(request, session);
      const status = getCardStatus(request, session);
      const preview = getPreviewInfo(request, session);

      return {
        id: session?.id ?? request.id,
        requestId: request.id,
        menteeName: request.menteeName,
        methodLabel: getMethodLabel(request.method),
        dateLabel: `신청일 ${dayjs(request.requestedAt).format('YYYY.MM.DD')}`,
        scheduleText: getScheduleText(request, session),
        previewText: preview.text,
        previewLabel: preview.label,
        statusLabel: status.label,
        statusColor: status.color,
        stage,
        canAccept: request.status === 'PENDING',
        canReject: request.status === 'PENDING',
        detailHref: `/mentoring-management/requests?id=${request.id}`,
        sortValue:
          session && stage === 'SCHEDULED'
            ? dayjs(session.startsAt).valueOf()
            : dayjs(request.requestedAt).valueOf(),
      };
    })
    .sort((a, b) => {
      if (a.stage === 'SCHEDULED' && b.stage === 'SCHEDULED') {
        return a.sortValue - b.sortValue;
      }

      return b.sortValue - a.sortValue;
    });
};
const STAGES = [
  {
    key: 'PENDING' as const,
    step: '01',
    label: '신청 접수',
    description: '새 신청을 확인하고 수락 또는 거절을 결정합니다.',
    emptyTitle: '접수된 신청이 없습니다.',
    emptyDescription: '새 상담 신청이 들어오면 이 단계에 먼저 표시됩니다.',
  },
  {
    key: 'SCHEDULED' as const,
    step: '02',
    label: '일정 확정',
    description: '수락 후 시간이 확정된 상담을 확인합니다.',
    emptyTitle: '확정된 일정이 없습니다.',
    emptyDescription: '신청을 수락하고 일정을 잡으면 이 단계에 표시됩니다.',
  },
  {
    key: 'DONE' as const,
    step: '03',
    label: '처리 완료',
    description: '완료, 취소, 거절된 건을 확인합니다.',
    emptyTitle: '처리 완료된 내역이 없습니다.',
    emptyDescription: '상담이 끝나거나 거절된 내역이 이 단계로 이동합니다.',
  },
];
export default function MentorManagementWorkspace({
  memberId,
  mentor,
}: MentorManagementWorkspaceProps) {
  const ensureDemoRequests = useMentoringManagementStore(
    (state) => state.ensureDemoRequests,
  );
  const hasHydrated = useMentoringManagementStore((state) => state.hasHydrated);
  const mentorRequests = useMentoringManagementStore(
    (state) => state.requestsByMentor[mentor.id],
  );
  const mentorSessions = useMentoringManagementStore(
    (state) => state.sessionsByMentor[mentor.id],
  );
  const requests = mentorRequests ?? EMPTY_REQUESTS;
  const sessions = mentorSessions ?? EMPTY_SESSIONS;
  const acceptRequest = useMentoringManagementStore(
    (state) => state.acceptRequest,
  );
  const rejectRequest = useMentoringManagementStore(
    (state) => state.rejectRequest,
  );
  useEffect(() => {
    ensureDemoRequests(memberId, mentor.id);
  }, [ensureDemoRequests, memberId, mentor.id]);
  const reservationRequests = useMemo(
    () => requests.filter((r) => r.method !== 'note'),
    [requests],
  );
  const cards = useMemo(
    () => buildManagementCards(reservationRequests, sessions),
    [reservationRequests, sessions],
  );
  const stageCounts = useMemo(() => {
    return cards.reduce<Record<ManagementStageKey, number>>(
      (acc, card) => {
        acc[card.stage] += 1;

        return acc;
      },
      { PENDING: 0, SCHEDULED: 0, DONE: 0 },
    );
  }, [cards]);
  const [activeStage, setActiveStage] = useState<ManagementStageKey>('PENDING');
  const filteredCards = cards.filter((card) => card.stage === activeStage);
  const activeStageMeta =
    STAGES.find((s) => s.key === activeStage) ?? STAGES[0];
  const handleAccept = (card: ManagementCardItem) => {
    acceptRequest({ mentorId: mentor.id, requestId: card.requestId });
  };
  const handleReject = (card: ManagementCardItem) => {
    rejectRequest({
      mentorId: mentor.id,
      requestId: card.requestId,
      reason: '일정 사정으로 이번 신청은 진행이 어렵습니다.',
    });
  };

  return (
    <MentoringStateBoundary
      state={hasHydrated ? 'ready' : 'loading'}
      ready={
        <section className="flex flex-col gap-200">
          {' '}
          <div className="flex flex-wrap items-start justify-between gap-200">
            {' '}
            <div className="min-w-0">
              {' '}
              <h2 className="font-designer-18b text-text-default">
                {' '}
                예약상담 내역{' '}
              </h2>{' '}
              <p className="mt-25 font-designer-13r text-text-subtle">
                {' '}
                신청 접수부터 일정 확정, 처리 완료까지 단계별로 관리합니다.{' '}
              </p>{' '}
            </div>{' '}
            <p className="shrink-0 font-designer-13m text-text-subtle">
              {' '}
              전체 {cards.length}건{' '}
            </p>{' '}
          </div>{' '}
          <div className="grid grid-cols-1 gap-125 lg:grid-cols-3">
            {' '}
            {STAGES.map((stage) => {
              const isActive = stage.key === activeStage;

              return (
                <button
                  key={stage.key}
                  type="button"
                  onClick={() => setActiveStage(stage.key)}
                  className={`rounded-150 border p-200 text-left transition-colors ${isActive ? 'border-border-brand bg-background-default' : 'border-border-subtle bg-background-default hover:bg-background-alternative'}`}
                >
                  {' '}
                  <div className="flex items-center justify-between">
                    {' '}
                    <div className="flex items-center gap-100">
                      {' '}
                      <span
                        className={`inline-flex h-300 w-300 shrink-0 items-center justify-center rounded-full font-designer-12b ${isActive ? 'bg-fill-brand-default-default text-text-inverse' : 'bg-background-alternative text-text-subtle'}`}
                      >
                        {' '}
                        {stage.step}{' '}
                      </span>{' '}
                      <span
                        className={`font-designer-15b ${isActive ? 'text-text-brand' : 'text-text-default'}`}
                      >
                        {' '}
                        {stage.label}{' '}
                      </span>{' '}
                    </div>{' '}
                    <span className="shrink-0 font-designer-13m text-text-subtle">
                      {' '}
                      {stageCounts[stage.key]}건{' '}
                    </span>{' '}
                  </div>{' '}
                  <p className="mt-100 font-designer-12r text-text-subtle">
                    {' '}
                    {stage.description}{' '}
                  </p>{' '}
                </button>
              );
            })}{' '}
          </div>{' '}
          {filteredCards.length === 0 ? (
            <div className="rounded-150 bg-background-alternative px-200 py-250 text-center">
              {' '}
              <p className="font-designer-15b text-text-default">
                {' '}
                {activeStageMeta.emptyTitle}{' '}
              </p>{' '}
              <p className="mt-50 font-designer-13r text-text-subtle">
                {' '}
                {activeStageMeta.emptyDescription}{' '}
              </p>{' '}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-150 md:grid-cols-2 xl:grid-cols-3">
              {' '}
              {filteredCards.map((card) => (
                <ManagementCard
                  key={card.id}
                  card={card}
                  onAccept={() => handleAccept(card)}
                  onReject={() => handleReject(card)}
                />
              ))}{' '}
            </div>
          )}{' '}
        </section>
      }
    />
  );
}
function ManagementCard({
  card,
  onAccept,
  onReject,
}: {
  card: ManagementCardItem;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <article className="rounded-150 border-border-subtle bg-background-default flex h-full flex-col border p-200">
      {' '}
      <div className="flex items-center justify-between">
        {' '}
        <div className="flex min-w-0 items-center gap-75">
          {' '}
          <span className="shrink-0 font-designer-12m text-text-subtle">
            {' '}
            {card.methodLabel}{' '}
          </span>{' '}
          <span className="truncate font-designer-12r text-text-subtle">
            {' '}
            · {card.dateLabel}{' '}
          </span>{' '}
        </div>{' '}
        <Badge color={card.statusColor} shape="rectangle">
          {' '}
          {card.statusLabel}{' '}
        </Badge>{' '}
      </div>{' '}
      <div className="mt-150">
        {' '}
        <h3 className="line-clamp-1 font-designer-16b text-text-default">
          {' '}
          {card.menteeName}{' '}
        </h3>{' '}
      </div>{' '}
      <div className="bg-background-alternative mt-150 rounded-100 p-150">
        {' '}
        <div className="flex items-start gap-75">
          {' '}
          <CalendarDays className="text-text-subtle mt-25 h-14 w-14 shrink-0" />{' '}
          <p className="font-designer-13m text-text-default">
            {' '}
            {card.scheduleText}{' '}
          </p>{' '}
        </div>{' '}
        <div className="mt-100 flex items-start gap-75">
          {' '}
          <UserRound className="text-text-subtle mt-25 h-14 w-14 shrink-0" />{' '}
          <p className="line-clamp-2 font-designer-13r text-text-subtle">
            {' '}
            {card.previewText}{' '}
          </p>{' '}
        </div>{' '}
      </div>{' '}
      <div className="mt-auto pt-175">
        {' '}
        {card.canAccept ? (
          <div className="flex items-center gap-100">
            {' '}
            <Button
              color="primary"
              size="small"
              icon={<Check className="h-14 w-14" />}
              onClick={onAccept}
            >
              {' '}
              수락{' '}
            </Button>{' '}
            <Button
              color="outlined"
              size="small"
              icon={<X className="h-14 w-14" />}
              onClick={onReject}
            >
              {' '}
              거절{' '}
            </Button>{' '}
            <Link
              href={card.detailHref}
              className="hover:text-text-default ml-auto inline-flex items-center gap-25 transition-colors font-designer-13m text-text-subtle"
            >
              {' '}
              상세 <ChevronRight className="h-14 w-14" />{' '}
            </Link>{' '}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {' '}
            <Link href={card.detailHref}>
              {' '}
              <Button color="outlined" size="small">
                {' '}
                상세 보기{' '}
              </Button>{' '}
            </Link>{' '}
          </div>
        )}{' '}
      </div>{' '}
    </article>
  );
}
