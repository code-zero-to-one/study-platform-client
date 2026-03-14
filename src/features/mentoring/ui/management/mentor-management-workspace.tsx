'use client';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import Avatar from '@/components/common/ui/avatar';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import {
  MENTORING_REQUEST_STATUS_META,
  MENTORING_SESSION_ISSUE_META,
  MENTORING_SESSION_STATUS_META,
} from '@/features/mentoring/model/management-status-meta';
import MentoringCardInfoRow from '@/features/mentoring/ui/common/mentoring-card-info-row';
import MentoringEmptyPanel from '@/features/mentoring/ui/common/mentoring-empty-panel';
import { mentoringMethodIconMap } from '@/features/mentoring/ui/common/mentoring-method-icons';
import MentoringStageSelector from '@/features/mentoring/ui/common/mentoring-stage-selector';
import MentoringStateBoundary from '@/features/mentoring/ui/common/mentoring-state-boundary';
import { getMethodLabel } from '@/features/mentoring/model/mentor-profile-utils';
import { useMentorWorkspaceQuery } from '@/features/mentoring/model/use-mentor-workspace-query';
import {
  useAcceptMentoringRequestMutation,
  useRejectMentoringRequestMutation,
} from '@/features/mentoring/model/use-mentoring-lifecycle-mutations';
import { useToastStore } from '@/stores/use-toast-store';
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
  method: MentoringRequest['method'];
  menteeName: string;
  menteeRole: string;
  methodLabel: string;
  dateLabel: string;
  scheduleLabel: string;
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

    return request.preferredTime ? `${date} ${request.preferredTime}` : date;
  }

  return '일정 미정';
};
const getScheduleLabel = (
  request: MentoringRequest,
  session?: MentoringSession,
) => {
  if (session?.status === 'SCHEDULED') {
    return '확정 일정';
  }

  return request.status === 'REJECTED' ? '신청 일정' : '멘티 희망 일정';
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
        method: request.method,
        menteeName: request.menteeName,
        menteeRole: request.menteeRole,
        methodLabel: getMethodLabel(request.method),
        dateLabel: `신청일 ${dayjs(request.requestedAt).format('YYYY.MM.DD')}`,
        scheduleLabel: getScheduleLabel(request, session),
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
  const { showToast } = useToastStore();
  const workspaceQuery = useMentorWorkspaceQuery({
    mentorId: mentor.id,
    enabled: Boolean(memberId),
  });
  const acceptRequestMutation = useAcceptMentoringRequestMutation();
  const rejectRequestMutation = useRejectMentoringRequestMutation();
  const requests = workspaceQuery.data?.allRequests ?? EMPTY_REQUESTS;
  const sessions = workspaceQuery.data?.allSessions ?? EMPTY_SESSIONS;
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
  const handleAccept = async (card: ManagementCardItem) => {
    try {
      await acceptRequestMutation.mutateAsync({
        mentorId: mentor.id,
        requestId: card.requestId,
      });
      showToast('신청을 수락했습니다.', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : '신청 수락에 실패했습니다.',
        'error',
      );
    }
  };
  const handleReject = async (card: ManagementCardItem) => {
    try {
      await rejectRequestMutation.mutateAsync({
        mentorId: mentor.id,
        requestId: card.requestId,
        reason: '일정 사정으로 이번 신청은 진행이 어렵습니다.',
      });
      showToast('신청을 거절했습니다.', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : '신청 거절에 실패했습니다.',
        'error',
      );
    }
  };

  return (
    <MentoringStateBoundary
      state={
        workspaceQuery.isLoading
          ? 'loading'
          : workspaceQuery.isError
            ? 'error'
            : 'ready'
      }
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
          <MentoringStageSelector
            stages={STAGES.map((stage) => ({
              ...stage,
              count: stageCounts[stage.key],
            }))}
            activeKey={activeStage}
            onChange={(key) => setActiveStage(key as ManagementStageKey)}
          />{' '}
          {filteredCards.length === 0 ? (
            <MentoringEmptyPanel
              title={activeStageMeta.emptyTitle}
              description={activeStageMeta.emptyDescription}
            />
          ) : (
            <div className="grid grid-cols-1 gap-125 md:grid-cols-2 xl:grid-cols-3">
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
  const MethodIcon = mentoringMethodIconMap[card.method];

  return (
    <article className="rounded-200 border-border-subtle bg-background-default flex h-full flex-col border p-200">
      {' '}
      <div className="flex items-start justify-between gap-100">
        {' '}
        <div className="min-w-0">
          <p className="font-designer-13m text-text-default inline-flex items-center gap-50">
            <MethodIcon className="text-text-brand h-14 w-14 shrink-0" />
            {card.methodLabel}
          </p>
          <p className="mt-25 line-clamp-1 font-designer-12r text-text-subtle">
            {card.dateLabel}
          </p>
        </div>{' '}
        <Badge color={card.statusColor} shape="rectangle" className="shrink-0">
          {' '}
          {card.statusLabel}{' '}
        </Badge>{' '}
      </div>{' '}
      <div className="mt-150 flex items-center gap-100">
        <Avatar
          image={undefined}
          alt={`${card.menteeName} 프로필`}
          size={40}
          className="shrink-0"
        />
        <div className="min-w-0">
          <h3 className="line-clamp-1 font-designer-16b text-text-default">
            {card.menteeName}
          </h3>
          <p className="mt-25 line-clamp-1 font-designer-12r text-text-subtle">
            {card.menteeRole}
          </p>
        </div>
      </div>{' '}
      <div className="bg-background-alternative border-border-subtle mt-150 rounded-100 border p-150">
        <MentoringCardInfoRow
          label={card.scheduleLabel}
          value={card.scheduleText}
          valueClassName="font-designer-13m text-text-default"
        />
        <MentoringCardInfoRow
          label={card.previewLabel}
          value={card.previewText}
          className="mt-100"
          valueClassName="line-clamp-2 font-designer-13r text-text-subtle"
        />
      </div>{' '}
      <div className="mt-auto flex flex-wrap items-center justify-end gap-100 pt-150">
        <Button asChild color="outlined" size="small">
          <Link href={card.detailHref}>상세 보기</Link>
        </Button>
        {card.canReject ? (
          <Button color="outlined" size="small" onClick={onReject}>
            거절
          </Button>
        ) : null}
        {card.canAccept ? (
          <Button color="primary" size="small" onClick={onAccept}>
            수락
          </Button>
        ) : null}
      </div>{' '}
    </article>
  );
}
