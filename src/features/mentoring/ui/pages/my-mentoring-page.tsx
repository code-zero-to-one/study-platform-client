'use client';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import Avatar from '@/components/common/ui/avatar';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import SectionHeader from '@/components/common/ui/section-header';
import SectionShell from '@/components/common/ui/section-shell';
import {
  getMyMentoringMethodType,
  MENTORING_SESSION_GUIDE_LABEL,
  MY_MENTORING_METHOD_LABEL_MAP,
  MY_MENTORING_STATUS_META,
} from '@/features/mentoring/model/my-mentoring-display-meta';
import MentoringCardInfoRow from '@/features/mentoring/ui/common/mentoring-card-info-row';
import MentoringEmptyPanel from '@/features/mentoring/ui/common/mentoring-empty-panel';
import MentoringStageSelector from '@/features/mentoring/ui/common/mentoring-stage-selector';
import { mentoringMethodIconMap } from '@/features/mentoring/ui/common/mentoring-method-icons';
import MentoringViewTabs from '@/features/mentoring/ui/common/mentoring-view-tabs';
import NoteConsultationContainer from '@/features/mentoring/ui/note-consultation/note-consultation-container';
import type {
  MyMentoringItem,
  MyMentoringStatus,
  MyNoteConsultationSummary,
} from '@/types/mentoring/my-mentoring';
type MyMentoringViewTab = 'NOTE' | 'RESERVATION';
type ReservationStageKey = 'APPROVAL' | 'BOOKED' | 'DONE';
const TEXT = {
  pageTitle: '나의 멘토링',
  pageDescription:
    '쪽지상담과 예약상담을 나눠 보고, 예약상담은 진행 단계별로 바로 확인합니다.',
  noteTabTitle: '쪽지상담',
  noteTabDescription: '멘토와 주고받은 비동기 상담만 모아봅니다.',
  reservationTabTitle: '예약상담',
  reservationTabDescription:
    '간편상담, 심층상담, 대면상담을 한 흐름으로 확인합니다.',
  reservationPanelTitle: '예약상담 내역',
  reservationPanelDescription:
    '승인 대기부터 예약 완료, 상담 완료까지 단계별로 묶어서 봅니다.',
  reservationEmptyTitle: '예약상담 내역이 없습니다.',
  reservationEmptyDescription:
    '간편상담, 심층상담, 대면상담을 신청하면 이 탭에서 단계별로 확인할 수 있습니다.',
  reservationCardActionLabel: '상세 보기',
  appliedAt: '신청일',
  previewLabel: '전달한 내용',
  sessionGuideLabel: MENTORING_SESSION_GUIDE_LABEL,
  statusNoteLabel: '마지막 안내',
  requestedPrefix: '희망 일정',
  completedPrefix: '진행한 일정',
  noShowPrefix: '노쇼 처리된 일정',
  cancelledPrefix: '취소된 일정',
  rejectedPrefix: '신청한 일정',
  requestedFallback: '멘토 확인을 기다리고 있습니다.',
  completedFallback: '상담이 완료되었습니다.',
  noShowFallback: '노쇼로 기록된 일정입니다.',
  cancelledFallback: '확정된 일정이 취소되었습니다.',
  rejectedFallback: '신청이 거절되었습니다.',
};
const getScheduleMeta = (mentoring: MyMentoringItem) => {
  if (mentoring.status === 'CONFIRMED') {
    return {
      label: TEXT.requestedPrefix,
      value: mentoring.mentoringTime ?? TEXT.requestedFallback,
    };
  }
  if (mentoring.status === 'REQUESTED' || mentoring.status === 'PENDING') {
    return {
      label: TEXT.requestedPrefix,
      value: mentoring.pendingWindow ?? TEXT.requestedFallback,
    };
  }
  if (mentoring.status === 'COMPLETED') {
    return {
      label: TEXT.completedPrefix,
      value: mentoring.mentoringTime ?? TEXT.completedFallback,
    };
  }
  if (mentoring.status === 'NO_SHOW') {
    return {
      label: TEXT.noShowPrefix,
      value: mentoring.mentoringTime ?? TEXT.noShowFallback,
    };
  }
  if (mentoring.status === 'CANCELLED') {
    return {
      label: TEXT.cancelledPrefix,
      value: mentoring.mentoringTime ?? TEXT.cancelledFallback,
    };
  }

  return {
    label: TEXT.rejectedPrefix,
    value: mentoring.pendingWindow ?? TEXT.rejectedFallback,
  };
};
const getReservationStageKey = (
  status: MyMentoringStatus,
): ReservationStageKey => {
  if (status === 'REQUESTED' || status === 'PENDING' || status === 'REJECTED') {
    return 'APPROVAL';
  }
  if (status === 'CONFIRMED' || status === 'CANCELLED') {
    return 'BOOKED';
  }

  return 'DONE';
};
const shouldShowReservationAction = (mentoring: MyMentoringItem) => {
  return mentoring.nextActionHref !== '/mentoring';
};
const getReservationMethodLabel = (mentoring: MyMentoringItem) => {
  return MY_MENTORING_METHOD_LABEL_MAP[mentoring.method];
};
const getReservationDetailCopy = (mentoring: MyMentoringItem) => {
  const isHistory =
    mentoring.status === 'COMPLETED' ||
    mentoring.status === 'NO_SHOW' ||
    mentoring.status === 'CANCELLED' ||
    mentoring.status === 'REJECTED';

  return {
    metaText:
      mentoring.historyDateLabel ??
      `${TEXT.appliedAt} ${mentoring.requestedAt}`,
    detailLabel:
      isHistory && mentoring.statusReason
        ? TEXT.statusNoteLabel
        : mentoring.sessionGuide
          ? TEXT.sessionGuideLabel
          : TEXT.previewLabel,
    detailText:
      isHistory && mentoring.statusReason
        ? mentoring.statusReason
        : (mentoring.sessionGuide ?? mentoring.title),
  };
};
export default function MyMentoringPage({
  items = [],
  noteSummary,
}: {
  items?: MyMentoringItem[];
  noteSummary?: MyNoteConsultationSummary;
}) {
  const noteCount = noteSummary?.totalCount ?? 0;
  const reservationStageCounts = useMemo(() => {
    return items.reduce<Record<ReservationStageKey, number>>(
      (accumulator, item) => {
        const stageKey = getReservationStageKey(item.status);
        accumulator[stageKey] += 1;

        return accumulator;
      },
      { APPROVAL: 0, BOOKED: 0, DONE: 0 },
    );
  }, [items]);
  const [activeView, setActiveView] = useState<MyMentoringViewTab>('NOTE');
  const [activeReservationStage, setActiveReservationStage] =
    useState<ReservationStageKey>('APPROVAL');
  const filteredReservationItems = items.filter((item) => {
    return getReservationStageKey(item.status) === activeReservationStage;
  });
  const viewTabs = [
    {
      key: 'NOTE' as const,
      label: TEXT.noteTabTitle,
      description: TEXT.noteTabDescription,
      count: noteCount,
    },
    {
      key: 'RESERVATION' as const,
      label: TEXT.reservationTabTitle,
      description: TEXT.reservationTabDescription,
      count: items.length,
    },
  ];
  const reservationStages = [
    {
      key: 'APPROVAL' as const,
      step: '01',
      label: '승인 대기',
      description: '멘토 승인 및 거절 처리까지 이 단계에서 확인합니다.',
      count: reservationStageCounts.APPROVAL,
      emptyTitle: '승인 대기 단계 내역이 없습니다.',
      emptyDescription:
        '새 신청이 들어오면 멘토 확인 전 상담들이 여기에 먼저 표시됩니다.',
    },
    {
      key: 'BOOKED' as const,
      step: '02',
      label: '예약 완료',
      description:
        '시간이 확정된 상담과 예약 이후 취소된 내역까지 함께 확인합니다.',
      count: reservationStageCounts.BOOKED,
      emptyTitle: '예약 완료 단계 내역이 없습니다.',
      emptyDescription:
        '시간과 진행 채널이 확정된 상담이 생기면 이 단계에 카드로 정리됩니다.',
    },
    {
      key: 'DONE' as const,
      step: '03',
      label: '상담 완료',
      description: '완료된 상담과 노쇼 처리된 건을 마지막 단계에서 확인합니다.',
      count: reservationStageCounts.DONE,
      emptyTitle: '상담 완료 단계 내역이 없습니다.',
      emptyDescription:
        '상담이 끝난 뒤 완료나 노쇼 처리된 내역이 이 단계로 이동합니다.',
    },
  ];
  const activeReservationStageMeta =
    reservationStages.find((stage) => stage.key === activeReservationStage) ??
    reservationStages[0];

  return (
    <SectionShell className="gap-400">
      {' '}
      <SectionHeader
        title={TEXT.pageTitle}
        description={TEXT.pageDescription}
        titleClassName="font-designer-24b text-text-default"
        descriptionClassName="max-w-[720px] font-designer-14r text-text-subtle"
      />{' '}
      <section className="rounded-200 border-border-subtle bg-background-default border p-150">
        {' '}
        <MentoringViewTabs
          tabs={viewTabs}
          activeKey={activeView}
          onChange={(key) => setActiveView(key as MyMentoringViewTab)}
        />{' '}
      </section>{' '}
      {activeView === 'NOTE' ? (
        <NoteConsultationContainer
          initialChannel="sent"
          lockedChannel="sent"
          statusTabPreset="mentee"
          hideToolbar
        />
      ) : (
        <section className="flex flex-col gap-200">
          {' '}
          <div className="flex flex-wrap items-start justify-between gap-200">
            {' '}
            <div className="min-w-0">
              {' '}
              <h2 className="font-designer-18b text-text-default">
                {' '}
                {TEXT.reservationPanelTitle}{' '}
              </h2>{' '}
              <p className="mt-25 font-designer-13r text-text-subtle">
                {' '}
                {TEXT.reservationPanelDescription}{' '}
              </p>{' '}
            </div>{' '}
            <p className="shrink-0 font-designer-13m text-text-subtle">
              {' '}
              전체 {items.length}건{' '}
            </p>{' '}
          </div>{' '}
          <MentoringStageSelector
            stages={reservationStages}
            activeKey={activeReservationStage}
            onChange={(key) =>
              setActiveReservationStage(key as ReservationStageKey)
            }
          />{' '}
          {filteredReservationItems.length === 0 ? (
            <MentoringEmptyPanel
              title={activeReservationStageMeta.emptyTitle}
              description={activeReservationStageMeta.emptyDescription}
            />
          ) : (
            <div className="grid grid-cols-1 gap-125 md:grid-cols-2 xl:grid-cols-3">
              {' '}
              {filteredReservationItems.map((mentoring) => (
                <ReservationMentoringCard
                  key={mentoring.id}
                  mentoring={mentoring}
                />
              ))}{' '}
            </div>
          )}{' '}
        </section>
      )}{' '}
    </SectionShell>
  );
}
function ReservationMentoringCard({
  mentoring,
}: {
  mentoring: MyMentoringItem;
}) {
  const detailCopy = getReservationDetailCopy(mentoring);
  const scheduleMeta = getScheduleMeta(mentoring);
  const statusMeta = MY_MENTORING_STATUS_META[mentoring.status];
  const MethodIcon = mentoringMethodIconMap[
    getMyMentoringMethodType(mentoring.method)
  ];

  return (
    <article className="rounded-200 border-border-subtle bg-background-default flex h-full flex-col border p-200">
      {' '}
      <div className="flex items-start justify-between gap-100">
        {' '}
        <div className="min-w-0">
          <p className="font-designer-13m text-text-default inline-flex items-center gap-50">
            <MethodIcon className="text-text-brand h-14 w-14 shrink-0" />
            {getReservationMethodLabel(mentoring)}
          </p>
          <p className="mt-25 line-clamp-1 font-designer-12r text-text-subtle">
            {detailCopy.metaText}
          </p>
        </div>{' '}
        <Badge color={statusMeta.color} shape="rectangle" className="shrink-0">
          {' '}
          {statusMeta.label}{' '}
        </Badge>{' '}
      </div>{' '}
      <div className="mt-150 flex items-center gap-100">
        {' '}
        <Avatar
          image={mentoring.mentorImageUrl}
          alt={`${mentoring.mentorName} 프로필`}
          size={40}
          className="shrink-0"
        />{' '}
        <h3 className="line-clamp-1 font-designer-16b text-text-default">
          {' '}
          {`${mentoring.mentorName} 멘토`}{' '}
        </h3>{' '}
      </div>{' '}
      <div className="bg-background-alternative border-border-subtle mt-150 rounded-100 border p-150">
        <MentoringCardInfoRow
          label={scheduleMeta.label}
          value={scheduleMeta.value}
          valueClassName="font-designer-13m text-text-default"
        />
        <MentoringCardInfoRow
          label={detailCopy.detailLabel}
          value={detailCopy.detailText}
          className="mt-100"
          valueClassName="line-clamp-2 font-designer-13r text-text-subtle"
        />
      </div>{' '}
      <div className="mt-auto flex flex-wrap items-center justify-end gap-100 pt-150">
        <Button asChild color="outlined" size="small">
          <Link href={mentoring.detailHref}>{TEXT.reservationCardActionLabel}</Link>
        </Button>
        {shouldShowReservationAction(mentoring) ? (
          <Button asChild color="primary" size="small">
            <Link
              href={mentoring.nextActionHref}
              className="inline-flex items-center gap-25"
            >
              {mentoring.nextActionLabel}
              <ChevronRight className="h-14 w-14" />
            </Link>
          </Button>
        ) : null}{' '}
      </div>{' '}
    </article>
  );
}
