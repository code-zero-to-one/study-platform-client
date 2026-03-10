import {
  CalendarDays,
  ChevronRight,
  MessageCircle,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import List from '@/components/common/ui/list';
import SectionHeader from '@/components/common/ui/section-header';
import SectionShell from '@/components/common/ui/section-shell';
import {
  MENTORING_BROWSE_MENTORS_LABEL,
  MENTORING_NOTE_LABEL,
  MENTORING_SESSION_GUIDE_LABEL,
  MY_MENTORING_METHOD_LABEL_MAP,
  MY_MENTORING_STATUS_META,
} from '@/features/mentoring/model/my-mentoring-display-meta';
import type {
  MyMentoringItem,
  MyNoteConsultationItem,
  MyNoteConsultationSummary,
  MyMentoringStatus,
} from '@/types/mentoring/my-mentoring';

const TEXT = {
  pageTitle: '나의 멘토링',
  summary: (
    active: number,
    scheduled: number,
    history: number,
    noteCount = 0,
  ) =>
    `진행 중 ${active}건 · 예정 ${scheduled}건 · 지난 내역 ${history}건${
      noteCount > 0 ? ` · 쪽지상담 ${noteCount}건` : ''
    }`,
  activeTitle: '진행 중',
  confirmedTitle: '예정된 멘토링',
  historyTitle: '지난 내역',
  noData: '표시할 멘토링이 없습니다.',
  noActive: '진행 중인 멘토링이 없습니다.',
  noScheduled: '예정된 멘토링이 없습니다.',
  noHistory: '지난 내역이 없습니다.',
  appliedAt: '신청일',
  exploreMentoring: MENTORING_BROWSE_MENTORS_LABEL,
  requestedPrefix: '희망 일정',
  pendingPrefix: '조율 예정',
  completedPrefix: '진행한 일정',
  noShowPrefix: '노쇼 처리된 일정',
  cancelledPrefix: '취소된 일정',
  rejectedPrefix: '신청한 일정',
  requestedFallback: '멘토 확인을 기다리고 있습니다.',
  pendingFallback: '멘토와 시간 조율 중',
  completedFallback: '상담이 완료되었습니다.',
  noShowFallback: '노쇼로 기록된 일정입니다.',
  cancelledFallback: '확정된 일정이 취소되었습니다.',
  rejectedFallback: '신청이 거절되었습니다.',
  noteConsultation: MENTORING_NOTE_LABEL,
  noteConversationTitle: `${MENTORING_NOTE_LABEL} 내역`,
  previewLabel: '전달한 내용',
  sessionGuideLabel: MENTORING_SESSION_GUIDE_LABEL,
  statusNoteLabel: '마지막 안내',
  noteEmpty: `${MENTORING_NOTE_LABEL} 내역이 없습니다.`,
  noteRequestedAt: '신청일',
  noteLastMessage: '최근 대화',
};

const isHistoryStatus = (status: MyMentoringStatus) => {
  return (
    status === 'COMPLETED' ||
    status === 'NO_SHOW' ||
    status === 'CANCELLED' ||
    status === 'REJECTED'
  );
};

const getScheduleText = (mentoring: MyMentoringItem) => {
  if (mentoring.status === 'CONFIRMED') {
    return mentoring.mentoringTime ?? TEXT.pendingFallback;
  }

  if (mentoring.status === 'REQUESTED') {
    return mentoring.pendingWindow
      ? `${TEXT.requestedPrefix}: ${mentoring.pendingWindow}`
      : TEXT.requestedFallback;
  }

  if (mentoring.status === 'PENDING') {
    return mentoring.pendingWindow
      ? `${TEXT.pendingPrefix}: ${mentoring.pendingWindow}`
      : TEXT.pendingFallback;
  }

  if (mentoring.status === 'COMPLETED') {
    return mentoring.mentoringTime
      ? `${TEXT.completedPrefix}: ${mentoring.mentoringTime}`
      : TEXT.completedFallback;
  }

  if (mentoring.status === 'NO_SHOW') {
    return mentoring.mentoringTime
      ? `${TEXT.noShowPrefix}: ${mentoring.mentoringTime}`
      : TEXT.noShowFallback;
  }

  if (mentoring.status === 'CANCELLED') {
    return mentoring.mentoringTime
      ? `${TEXT.cancelledPrefix}: ${mentoring.mentoringTime}`
      : TEXT.cancelledFallback;
  }

  return mentoring.pendingWindow
    ? `${TEXT.rejectedPrefix}: ${mentoring.pendingWindow}`
    : TEXT.rejectedFallback;
};

const getAttentionItems = ({
  items,
  noteSummary,
}: {
  items: MyMentoringItem[];
  noteSummary?: MyNoteConsultationSummary;
}) => {
  const requestedCount = items.filter(
    (item) => item.status === 'REQUESTED',
  ).length;
  const confirmedCount = items.filter(
    (item) => item.status === 'CONFIRMED',
  ).length;
  const followUpCount = items.filter((item) => {
    return (
      item.status === 'CANCELLED' ||
      item.status === 'NO_SHOW' ||
      item.refundStatusLabel !== undefined
    );
  }).length;

  const attentionItems: Array<{
    title: string;
    description: string;
    badgeColor: 'orange' | 'green' | 'red' | 'blue';
    badgeLabel: string;
    href: string;
    actionLabel: string;
  }> = [];

  if (requestedCount > 0) {
    attentionItems.push({
      title: '멘토 확인 대기',
      description:
        '24시간 안에 확인이 시작되는지 알림과 신청 내역을 같이 보세요.',
      badgeColor: 'orange',
      badgeLabel: `${requestedCount}건`,
      href: '/notification',
      actionLabel: '알림함 보기',
    });
  }

  if (confirmedCount > 0) {
    attentionItems.push({
      title: '곧 진행할 상담',
      description:
        '확정 시간과 진행 채널 또는 장소가 최신인지 미리 확인하세요.',
      badgeColor: 'green',
      badgeLabel: `${confirmedCount}건`,
      href: '/my-mentoring',
      actionLabel: '예약 내역 보기',
    });
  }

  if (followUpCount > 0) {
    attentionItems.push({
      title: '취소·노쇼 후속',
      description:
        '환불 상태와 재예약 안내가 남아 있다면 먼저 확인해야 합니다.',
      badgeColor: 'red',
      badgeLabel: `${followUpCount}건`,
      href: '/my-mentoring',
      actionLabel: '후속 상태 보기',
    });
  }

  if (noteSummary && noteSummary.totalCount > 0) {
    attentionItems.push({
      title: '쪽지상담',
      description:
        noteSummary.actionableCount > 0
          ? '바로 확인할 답변이 도착한 대화가 있습니다.'
          : '답변 대기 중인 상담 흐름을 함께 확인하세요.',
      badgeColor: 'blue',
      badgeLabel:
        noteSummary.actionableCount > 0
          ? `확인 ${noteSummary.actionableCount}건`
          : `대기 ${noteSummary.waitingCount}건`,
      href:
        noteSummary.actionableHref ??
        noteSummary.waitingHref ??
        '/note-consultation',
      actionLabel: '쪽지상담 열기',
    });
  }

  return attentionItems;
};

const getNoteActionLabel = (item: MyNoteConsultationItem) => {
  if (item.statusLabel === '답변 확인 필요') {
    return '답변 확인';
  }

  if (item.statusLabel === '신청 거절') {
    return '사유 확인';
  }

  if (item.statusLabel === '입금 확인 대기') {
    return '입금 상태 보기';
  }

  return '대화 열기';
};

export default function MyMentoringPage({
  items = [],
  noteSummary,
  noteItems = [],
}: {
  items?: MyMentoringItem[];
  noteSummary?: MyNoteConsultationSummary;
  noteItems?: MyNoteConsultationItem[];
}) {
  const activeMentoring = items.filter((item) => {
    return item.status === 'REQUESTED' || item.status === 'PENDING';
  });
  const confirmedMentoring = items.filter(
    (item) => item.status === 'CONFIRMED',
  );
  const historyMentoring = items.filter((item) => isHistoryStatus(item.status));
  const attentionItems = getAttentionItems({ items, noteSummary });
  const hasAnyMentoringData =
    items.length > 0 || (noteSummary?.totalCount ?? 0) > 0;

  return (
    <SectionShell className="gap-300">
      <SectionHeader
        title={TEXT.pageTitle}
        titleClassName="font-designer-24b text-text-default"
      />

      <div className="flex flex-wrap items-center justify-between gap-125 rounded-150 bg-background-alternative px-200 py-200">
        <p className="font-designer-14m text-text-subtle">
          {TEXT.summary(
            activeMentoring.length,
            confirmedMentoring.length,
            historyMentoring.length,
            noteSummary?.totalCount ?? 0,
          )}
        </p>
        <div className="flex flex-wrap gap-100">
          <Link href="/mentoring">
            <Button color="primary" size="small">
              {TEXT.exploreMentoring}
            </Button>
          </Link>
          <Link href="/note-consultation">
            <Button
              color="outlined"
              size="small"
              icon={<MessageCircle className="h-14 w-14" />}
            >
              {TEXT.noteConsultation}
            </Button>
          </Link>
        </div>
      </div>

      {attentionItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-125 md:grid-cols-2 xl:grid-cols-4">
          {attentionItems.map((item) => (
            <div
              key={item.title}
              className="rounded-150 border-border-subtle bg-background-default border px-200 py-200"
            >
              <div className="flex items-start justify-between gap-100">
                <div className="min-w-0">
                  <p className="font-designer-14b text-text-default">
                    {item.title}
                  </p>
                  <p className="font-designer-12r text-text-subtle mt-50">
                    {item.description}
                  </p>
                </div>
                <Badge color={item.badgeColor} shape="round">
                  {item.badgeLabel}
                </Badge>
              </div>
              <Link
                href={item.href}
                className="font-designer-12m text-text-information mt-125 inline-flex"
              >
                {item.actionLabel}
              </Link>
            </div>
          ))}
        </div>
      ) : null}

      {noteSummary ? (
        <div className="rounded-150 border-border-subtle bg-background-default border px-200 py-200">
          <div className="flex flex-wrap items-center justify-between gap-125">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-75">
                <h2 className="font-designer-16b text-text-default">
                  쪽지상담
                </h2>
                <Badge color="blue" shape="round">
                  {noteSummary.totalCount}건
                </Badge>
              </div>
              <p className="font-designer-13r text-text-subtle mt-50">
                답변 대기 {noteSummary.waitingCount}건 · 바로 확인 가능한 대화{' '}
                {noteSummary.actionableCount}건
              </p>
              <div className="mt-100 flex flex-wrap gap-100">
                {noteSummary.actionableHref ? (
                  <Link
                    href={noteSummary.actionableHref}
                    className="font-designer-12m text-text-information hover:underline"
                  >
                    답변 확인하기
                  </Link>
                ) : null}
                {noteSummary.waitingHref ? (
                  <Link
                    href={noteSummary.waitingHref}
                    className="font-designer-12m text-text-information hover:underline"
                  >
                    대기 흐름 보기
                  </Link>
                ) : null}
              </div>
            </div>
            <Link
              href={
                noteSummary.actionableHref ??
                noteSummary.waitingHref ??
                '/note-consultation'
              }
              className="shrink-0"
            >
              <Button
                color="outlined"
                size="small"
                icon={<MessageCircle className="h-14 w-14" />}
              >
                쪽지상담 열기
              </Button>
            </Link>
          </div>
        </div>
      ) : null}

      {noteSummary ? (
        <NoteConsultationListSection
          title={TEXT.noteConversationTitle}
          count={noteItems.length}
          items={noteItems}
        />
      ) : null}

      {!hasAnyMentoringData ? (
        <UnifiedMentoringEmptyState />
      ) : (
        <>
          <MentoringListSection
            title={TEXT.activeTitle}
            count={activeMentoring.length}
            countColor="orange"
            items={activeMentoring}
            emptyActionHref="/mentoring"
            emptyActionLabel={TEXT.exploreMentoring}
            emptyMessage={TEXT.noActive}
          />

          <MentoringListSection
            title={TEXT.confirmedTitle}
            count={confirmedMentoring.length}
            countColor="green"
            items={confirmedMentoring}
            emptyActionHref="/notification"
            emptyActionLabel="알림함 보기"
            emptyMessage={TEXT.noScheduled}
          />

          <MentoringListSection
            title={TEXT.historyTitle}
            count={historyMentoring.length}
            countColor="gray"
            items={historyMentoring}
            emptyActionHref="/mentoring"
            emptyActionLabel={TEXT.exploreMentoring}
            emptyMessage={TEXT.noHistory}
          />
        </>
      )}
    </SectionShell>
  );
}

function UnifiedMentoringEmptyState() {
  return (
    <section className="rounded-150 border-border-subtle bg-background-default border px-200 py-250 text-center">
      <h2 className="font-designer-18b text-text-default">
        아직 멘토링 내역이 없어요
      </h2>
      <p className="font-designer-14r text-text-subtle mt-75">
        일정형 멘토링과 쪽지상담 내역이 이 화면에 함께 모입니다.
      </p>
      <p className="font-designer-13r text-text-subtle mt-50">
        멘토를 둘러보고 첫 신청을 시작해보세요.
      </p>
      <Link href="/mentoring" className="mt-150 inline-flex">
        <Button color="primary" size="medium">
          {TEXT.exploreMentoring}
        </Button>
      </Link>
    </section>
  );
}

function NoteConsultationListSection({
  title,
  count,
  items,
}: {
  title: string;
  count: number;
  items: MyNoteConsultationItem[];
}) {
  return (
    <section className="flex flex-col gap-150">
      <div className="flex items-center gap-75">
        <h2 className="font-designer-16b text-text-default">{title}</h2>
        <Badge color="blue" shape="round">
          {count}
        </Badge>
      </div>

      {items.length === 0 ? (
        <div className="rounded-150 bg-background-alternative px-200 py-250 text-center">
          <p className="font-designer-14m text-text-subtle">{TEXT.noteEmpty}</p>
          <Link href="/note-consultation" className="mt-125 inline-flex">
            <Button color="outlined" size="small">
              {TEXT.noteConsultation}
            </Button>
          </Link>
        </div>
      ) : (
        <List className="flex flex-col gap-125">
          {items.map((item) => (
            <List.Item
              key={item.id}
              className="rounded-150 border-border-subtle bg-background-default hover:bg-background-default active:bg-background-default h-auto min-h-0 items-stretch space-x-0 border p-0"
            >
              <Link href={item.href} className="group block w-full p-200">
                <div className="mb-125 flex items-start justify-between gap-100">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-50">
                      <Badge color="blue" shape="round">
                        {TEXT.noteConsultation}
                      </Badge>
                      <Badge color={item.statusTone} shape="round">
                        {item.statusLabel}
                      </Badge>
                      <Badge color={item.paymentStatusTone} shape="round">
                        {item.paymentStatusLabel}
                      </Badge>
                    </div>
                    <h3 className="font-designer-16b text-text-default mt-75 line-clamp-1">
                      {`${item.mentorName} 멘토`}
                    </h3>
                    <p className="font-designer-13r text-text-subtle mt-25">
                      {`${TEXT.noteRequestedAt} ${item.requestedAt} · ${item.roleLabel}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-75">
                    <span className="font-designer-13m text-text-subtle rounded-50 border-border-subtle group-hover:text-text-default group-hover:border-border-brand inline-flex items-center gap-25 border px-75 py-25">
                      {getNoteActionLabel(item)}
                      <ChevronRight className="h-14 w-14" />
                    </span>
                  </div>
                </div>

                <div className="mb-100 flex items-center gap-75">
                  <MessageCircle className="text-text-subtle h-16 w-16" />
                  <span className="font-designer-14m text-text-default">
                    {TEXT.noteLastMessage}
                  </span>
                </div>
                <p className="font-designer-13r text-text-subtle line-clamp-2 leading-relaxed">
                  {item.lastMessage}
                </p>
              </Link>
            </List.Item>
          ))}
        </List>
      )}
    </section>
  );
}

function MentoringListSection({
  title,
  count,
  countColor = 'gray',
  items,
  headerAction,
  emptyActionHref,
  emptyActionLabel,
  emptyMessage = TEXT.noData,
}: {
  title: string;
  count: number;
  countColor?: 'gray' | 'green' | 'orange';
  items: MyMentoringItem[];
  headerAction?: ReactNode;
  emptyActionHref?: string;
  emptyActionLabel?: string;
  emptyMessage?: string;
}) {
  return (
    <section className="flex flex-col gap-150">
      <div>
        <div className="flex items-start justify-between gap-100">
          <div className="flex items-center gap-75">
            <h2 className="font-designer-16b text-text-default">{title}</h2>
            <Badge color={countColor} shape="round">
              {count}
            </Badge>
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-150 bg-background-alternative px-200 py-250 text-center">
          <p className="font-designer-14m text-text-subtle">{emptyMessage}</p>
          {emptyActionHref && emptyActionLabel ? (
            <Link href={emptyActionHref} className="mt-125 inline-flex">
              <Button color="outlined" size="small">
                {emptyActionLabel}
              </Button>
            </Link>
          ) : null}
        </div>
      ) : (
        <List className="flex flex-col gap-125">
          {items.map((mentoring) => {
            const isHistory = isHistoryStatus(mentoring.status);
            const metaText =
              mentoring.historyDateLabel ??
              `${TEXT.appliedAt} ${mentoring.requestedAt}`;
            const detailText =
              isHistory && mentoring.statusReason
                ? mentoring.statusReason
                : (mentoring.sessionGuide ?? mentoring.title);
            const detailLabel =
              isHistory && mentoring.statusReason
                ? TEXT.statusNoteLabel
                : mentoring.sessionGuide
                  ? TEXT.sessionGuideLabel
                  : TEXT.previewLabel;

            return (
              <List.Item
                key={mentoring.id}
                className="rounded-150 border-border-subtle bg-background-default hover:bg-background-default active:bg-background-default h-auto min-h-0 items-stretch space-x-0 border p-0"
              >
                <div className="p-200">
                  <div className="mb-125 flex items-start justify-between gap-100">
                    <Link
                      href={mentoring.detailHref}
                      className="group min-w-0 flex-1"
                    >
                      <div className="flex flex-wrap items-center gap-50">
                        <Badge color="blue" shape="round">
                          {MY_MENTORING_METHOD_LABEL_MAP[mentoring.method]}
                        </Badge>
                        <Badge
                          color={
                            MY_MENTORING_STATUS_META[mentoring.status].color
                          }
                          shape="round"
                        >
                          {MY_MENTORING_STATUS_META[mentoring.status].label}
                        </Badge>
                        <Badge
                          color={mentoring.paymentStatusTone}
                          shape="round"
                        >
                          {mentoring.paymentStatusLabel}
                        </Badge>
                        {mentoring.issueStatusLabel &&
                        mentoring.issueStatusTone ? (
                          <Badge
                            color={mentoring.issueStatusTone}
                            shape="round"
                          >
                            {mentoring.issueStatusLabel}
                          </Badge>
                        ) : null}
                        {mentoring.refundStatusLabel &&
                        mentoring.refundStatusTone ? (
                          <Badge
                            color={mentoring.refundStatusTone}
                            shape="round"
                          >
                            {mentoring.refundStatusLabel}
                          </Badge>
                        ) : null}
                      </div>
                      <h3 className="font-designer-16b text-text-default mt-75 line-clamp-1">
                        {`${mentoring.mentorName} 멘토`}
                      </h3>
                      <p className="font-designer-13r text-text-subtle mt-25">
                        {metaText}
                      </p>
                    </Link>
                    <Link
                      href={mentoring.nextActionHref}
                      className="group flex shrink-0 flex-col items-end gap-75"
                    >
                      <span className="font-designer-13m text-text-subtle rounded-50 border-border-subtle group-hover:text-text-default group-hover:border-border-brand inline-flex items-center gap-25 border px-75 py-25">
                        {mentoring.nextActionLabel}
                        <ChevronRight className="h-14 w-14" />
                      </span>
                    </Link>
                  </div>

                  <Link href={mentoring.detailHref} className="group block">
                    <div className="mb-75 flex items-center gap-75">
                      <CalendarDays className="text-text-subtle h-16 w-16" />
                      <span className="font-designer-14b text-text-default">
                        {getScheduleText(mentoring)}
                      </span>
                    </div>
                    <div className="mb-100 flex items-center gap-75">
                      <UserRound className="text-text-subtle h-16 w-16" />
                      <span className="font-designer-14m text-text-default">
                        {detailLabel}
                      </span>
                    </div>
                    <p className="font-designer-13r text-text-subtle line-clamp-2 leading-relaxed">
                      {detailText}
                    </p>
                  </Link>
                </div>
              </List.Item>
            );
          })}
        </List>
      )}
    </section>
  );
}
