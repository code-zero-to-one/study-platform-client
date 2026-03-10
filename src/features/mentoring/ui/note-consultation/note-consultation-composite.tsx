'use client';

import dayjs from 'dayjs';
import { MessageCircle, Paperclip, Search, SendHorizontal } from 'lucide-react';
import Link from 'next/link';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import { MENTORING_REQUEST_STATUS_META } from '@/features/mentoring/model/management-status-meta';
import {
  MENTORING_BROWSE_MENTORS_LABEL,
  MENTORING_NOTE_LABEL,
} from '@/features/mentoring/model/my-mentoring-display-meta';
import { getConversationWithFallback } from '@/features/mentoring/model/note-consultation-message';
import RequestContentViewer from '@/features/mentoring/ui/apply/request-content-viewer';
import type {
  MentoringConversationMessage,
  MentoringRequest,
} from '@/types/mentoring/management-domain';
import type {
  NoteConsultationFiltersProps,
  NoteConsultationGridProps,
  NoteConsultationListProps,
} from '@/types/mentoring/note-consultation-composite-view';
import type {
  NoteConsultationChannelSummaryItem,
  NoteConsultationItemStatusSummary,
} from '@/types/mentoring/note-consultation-controller-view';
import type {
  NoteConsultationChannel,
  NoteConsultationListItem,
} from '@/types/mentoring/note-consultation-view';

const isManualTransferPending = (request: MentoringRequest) => {
  return (
    request.paymentMode === 'MANUAL_TRANSFER' &&
    request.paymentStatus !== 'CONFIRMED'
  );
};

const hasMentorFirstReply = (request: MentoringRequest) => {
  return request.conversation.some((message) => message.sender === 'MENTOR');
};

function UserAvatar({
  name,
  color = 'brand',
}: {
  name: string;
  color?: 'brand' | 'neutral';
}) {
  const initial = name.trim().charAt(0) || '?';

  return (
    <div
      className={`flex h-44 w-44 shrink-0 items-center justify-center rounded-full ${
        color === 'brand'
          ? 'bg-fill-brand-subtle-default text-text-brand'
          : 'bg-fill-neutral-default-default text-text-subtle'
      }`}
    >
      <span className="font-designer-16b">{initial}</span>
    </div>
  );
}

function RequestListCard({
  item,
  statusSummary,
  selected,
  onClick,
}: {
  item: NoteConsultationListItem;
  statusSummary?: NoteConsultationItemStatusSummary;
  selected: boolean;
  onClick: () => void;
}) {
  const unreadCount = item.channel === 'sent' ? item.mentorReplyCount : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-150 w-full px-200 py-200 text-left transition-colors ${
        selected
          ? 'bg-fill-brand-subtle-default'
          : 'hover:bg-background-alternative'
      }`}
    >
      <div className="flex items-start gap-150">
        <UserAvatar name={item.displayName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-75">
            <p className="font-designer-16b text-text-default truncate">
              {item.displayName}
            </p>
            <span className="font-designer-12m text-text-subtle shrink-0">
              {dayjs(item.lastMessageCreatedAt).format('MM.DD HH:mm')}
            </span>
          </div>
          <p className="font-designer-12r text-text-subtle mt-50 truncate">
            {item.displayRole || '상담 참여자'}
          </p>
          <div className="mt-75 flex items-center gap-75">
            <Badge
              color={MENTORING_REQUEST_STATUS_META[item.request.status].color}
              shape="round"
            >
              {MENTORING_REQUEST_STATUS_META[item.request.status].label}
            </Badge>
            {statusSummary ? (
              <Badge color={statusSummary.tone} shape="round">
                {statusSummary.label}
              </Badge>
            ) : null}
            {unreadCount > 0 ? (
              <span className="bg-fill-brand-default-default text-text-inverse font-designer-11m inline-flex h-20 min-w-[20px] items-center justify-center rounded-full px-50">
                {unreadCount}
              </span>
            ) : null}
          </div>
          <p className="font-designer-13r text-text-subtle mt-75 line-clamp-1">
            {item.lastMessageContent}
          </p>
        </div>
      </div>
    </button>
  );
}

function QuestionCard({ request }: { request: MentoringRequest }) {
  const hasFiles =
    (request.attachedFileNames?.length ?? 0) > 0 ||
    (request.referenceLinks?.length ?? 0) > 0;

  return (
    <div className="rounded-150 border-border-subtle bg-background-default border p-250">
      <div className="mb-200 flex items-center gap-100">
        <UserAvatar name={request.menteeName} color="neutral" />
        <div className="min-w-0 flex-1">
          <p className="font-designer-15b text-text-default">
            {request.menteeName}
          </p>
          <p className="font-designer-12r text-text-subtle">
            {request.menteeRole || '멘티'} ·{' '}
            {dayjs(request.requestedAt).format('YYYY.MM.DD HH:mm')}
          </p>
        </div>
        <Badge
          color={MENTORING_REQUEST_STATUS_META[request.status].color}
          shape="round"
        >
          {MENTORING_REQUEST_STATUS_META[request.status].label}
        </Badge>
      </div>

      <RequestContentViewer
        requestMessage={request.requestMessage}
        requestContents={request.requestContents}
      />

      {hasFiles && (
        <div className="border-border-subtle mt-200 flex flex-wrap gap-75 border-t pt-150">
          {request.attachedFileNames?.map((fileName) => (
            <span
              key={fileName}
              className="font-designer-11m text-text-subtle border-border-subtle inline-flex items-center gap-50 rounded-full border px-100 py-50"
            >
              <Paperclip className="h-12 w-12" />
              {fileName}
            </span>
          ))}
          {request.referenceLinks?.map((link) => (
            <a
              key={link}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-designer-11m text-text-brand border-border-subtle inline-flex items-center gap-50 rounded-full border px-100 py-50 underline"
            >
              {link}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function ConversationCard({
  message,
  authorName,
  authorLabel,
  tone,
}: {
  message: MentoringConversationMessage;
  authorName: string;
  authorLabel: string;
  tone: 'brand' | 'neutral';
}) {
  return (
    <div className="rounded-150 border-border-subtle bg-background-default border p-250">
      <div className="mb-200 flex items-center gap-100">
        <UserAvatar name={authorName} color={tone} />
        <div className="min-w-0 flex-1">
          <p className="font-designer-15b text-text-default">{authorName}</p>
          <p className="font-designer-12r text-text-subtle">
            {dayjs(message.createdAt).format('YYYY.MM.DD HH:mm')}
          </p>
        </div>
        <span
          className={`font-designer-12m rounded-full px-100 py-50 ${
            tone === 'brand'
              ? 'text-text-brand bg-fill-brand-subtle-default'
              : 'bg-background-accent-gray-subtle text-background-accent-gray-strong'
          }`}
        >
          {authorLabel}
        </span>
      </div>
      <p className="font-designer-14r text-text-default leading-relaxed whitespace-pre-line">
        {message.content}
      </p>
    </div>
  );
}

const getDetailPanelState = ({
  request,
  channel,
}: {
  request: MentoringRequest;
  channel: NoteConsultationChannel;
}) => {
  const mentorFirstReplyExists = hasMentorFirstReply(request);
  const manualTransferPending = isManualTransferPending(request);

  if (channel === 'received') {
    if (request.status === 'REJECTED') {
      return {
        badgeColor: 'red' as const,
        badgeLabel: '신청 거절',
        title: '거절된 신청입니다',
        description: '거절된 건은 더 이상 답변을 이어갈 수 없습니다.',
        canCompose: false,
        lockMessage: '거절 처리된 신청은 읽기 전용으로 전환됩니다.',
        ctaHref: '/mentoring-management/requests',
        ctaLabel: '신청 목록 보기',
        placeholder: '',
        submitLabel: '',
        emptyStateTitle: '대화가 종료되었습니다.',
        emptyStateDescription:
          '필요한 사유는 위 신청 내용과 상태 배너에서 확인할 수 있습니다.',
      };
    }

    if (request.status !== 'ACCEPTED') {
      return {
        badgeColor: 'orange' as const,
        badgeLabel: '수락 필요',
        title: '먼저 신청을 수락해주세요',
        description: '수락 전에는 쪽지상담 답변을 보낼 수 없습니다.',
        canCompose: false,
        lockMessage: '멘토링 관리에서 수락 처리 후 답변을 시작할 수 있습니다.',
        ctaHref: '/mentoring-management/requests',
        ctaLabel: '신청 관리로 이동',
        placeholder: '',
        submitLabel: '',
        emptyStateTitle: '아직 답변이 없습니다.',
        emptyStateDescription: '신청을 수락한 뒤 첫 답변을 시작해주세요.',
      };
    }

    if (manualTransferPending) {
      return {
        badgeColor: 'orange' as const,
        badgeLabel: '입금 확인 대기',
        title: '입금 확인 후 답변을 시작할 수 있어요',
        description:
          '수동 계좌이체 건은 입금 확인이 끝난 뒤 답변 입력이 열립니다.',
        canCompose: false,
        lockMessage: '입금 확인 완료 처리 후 첫 답변을 남겨주세요.',
        ctaHref: '/mentoring-management/requests',
        ctaLabel: '입금 상태 확인',
        placeholder: '',
        submitLabel: '',
        emptyStateTitle: '아직 답변이 없습니다.',
        emptyStateDescription:
          '입금 확인 후 첫 답변을 보내면 멘티가 후속 질문을 이어갈 수 있습니다.',
      };
    }

    if (!mentorFirstReplyExists) {
      return {
        badgeColor: 'blue' as const,
        badgeLabel: '첫 답변 필요',
        title: '첫 답변을 남겨야 대화가 시작됩니다',
        description:
          '첫 답변이 등록되면 멘티가 같은 화면에서 후속 질문을 이어갈 수 있습니다.',
        canCompose: true,
        lockMessage: '',
        ctaHref: '',
        ctaLabel: '',
        placeholder: '멘티가 바로 이해할 수 있게 첫 답변을 남겨주세요.',
        submitLabel: '첫 답변 보내기',
        emptyStateTitle: '아직 답변이 없습니다.',
        emptyStateDescription:
          '첫 답변을 남기면 이 공간이 실제 상담 타임라인으로 바뀝니다.',
      };
    }

    return {
      badgeColor: 'green' as const,
      badgeLabel: '대화 진행 중',
      title: '후속 질문까지 이 화면에서 이어집니다',
      description:
        '멘티가 추가 질문을 남기면 마지막 메시지 기준으로 목록이 다시 정렬됩니다.',
      canCompose: true,
      lockMessage: '',
      ctaHref: '',
      ctaLabel: '',
      placeholder: '멘티에게 이어서 보낼 답변을 작성해주세요.',
      submitLabel: '답변 보내기',
      emptyStateTitle: '아직 추가 대화가 없습니다.',
      emptyStateDescription:
        '첫 답변 이후 멘티가 남긴 후속 질문이 여기 이어서 쌓입니다.',
    };
  }

  if (request.status === 'REJECTED') {
    return {
      badgeColor: 'red' as const,
      badgeLabel: '신청 거절',
      title: '이번 신청은 거절되었습니다',
      description: '거절 사유는 상담 내역과 알림에서 함께 확인할 수 있습니다.',
      canCompose: false,
      lockMessage: '거절된 신청은 읽기 전용으로 전환됩니다.',
      ctaHref: '/mentoring',
      ctaLabel: MENTORING_BROWSE_MENTORS_LABEL,
      placeholder: '',
      submitLabel: '',
      emptyStateTitle: '답변 없이 종료된 신청입니다.',
      emptyStateDescription:
        '필요하면 다른 멘토에게 다시 쪽지상담을 신청해보세요.',
    };
  }

  if (request.status !== 'ACCEPTED') {
    return {
      badgeColor: 'orange' as const,
      badgeLabel: '멘토 확인 대기',
      title: '멘토 확인을 기다리고 있습니다',
      description:
        '수락되면 알림이 오고, 첫 답변이 등록된 뒤부터 후속 질문을 이어갈 수 있습니다.',
      canCompose: false,
      lockMessage: '멘토 수락과 첫 답변 전까지는 추가 질문을 보낼 수 없습니다.',
      ctaHref: '/notification',
      ctaLabel: '알림함 보기',
      placeholder: '',
      submitLabel: '',
      emptyStateTitle: '아직 답변이 없습니다.',
      emptyStateDescription: '멘토가 신청을 확인하는 동안 잠시만 기다려주세요.',
    };
  }

  if (manualTransferPending) {
    return {
      badgeColor: 'orange' as const,
      badgeLabel: '입금 확인 대기',
      title: '입금 확인이 끝나면 답변이 시작됩니다',
      description:
        '수동 계좌이체 건은 멘토가 입금 확인을 끝내야 첫 답변을 보낼 수 있습니다.',
      canCompose: false,
      lockMessage:
        '입금 확인이 완료되면 멘토 수락과 첫 답변 단계로 이어집니다.',
      ctaHref: '/notification',
      ctaLabel: '알림함 보기',
      placeholder: '',
      submitLabel: '',
      emptyStateTitle: '아직 답변이 없습니다.',
      emptyStateDescription:
        '입금 확인이 끝나면 멘토가 첫 답변을 보낼 수 있습니다.',
    };
  }

  if (!mentorFirstReplyExists) {
    return {
      badgeColor: 'orange' as const,
      badgeLabel: '첫 답변 대기',
      title: '멘토의 첫 답변을 기다리고 있습니다',
      description:
        '첫 답변이 도착하면 이 화면에서 추가 질문도 바로 이어서 보낼 수 있습니다.',
      canCompose: false,
      lockMessage: '멘토의 첫 답변 이후부터 후속 질문을 보낼 수 있습니다.',
      ctaHref: '/notification',
      ctaLabel: '알림함 보기',
      placeholder: '',
      submitLabel: '',
      emptyStateTitle: '아직 답변이 없습니다.',
      emptyStateDescription:
        '첫 답변이 오면 바로 이 화면에서 대화를 계속할 수 있어요.',
    };
  }

  return {
    badgeColor: 'green' as const,
    badgeLabel: '답변 도착',
    title: '추가 질문도 이 화면에서 바로 이어집니다',
    description:
      '멘토가 남긴 답변을 확인한 뒤 필요한 내용만 짧게 이어서 질문하세요.',
    canCompose: true,
    lockMessage: '',
    ctaHref: '',
    ctaLabel: '',
    placeholder: '멘토에게 추가로 전할 내용을 적어주세요.',
    submitLabel: '추가 질문 보내기',
    emptyStateTitle: '멘토 답변이 도착했습니다.',
    emptyStateDescription:
      '필요한 내용이 더 있으면 바로 후속 질문을 남겨보세요.',
  };
};

function DetailPanel({
  request,
  displayName,
  displayRole,
  channel,
  draft,
  onDraftChange,
  onSend,
  canSend,
}: {
  request: MentoringRequest;
  displayName: string;
  displayRole: string;
  channel: NoteConsultationChannel;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  canSend: boolean;
}) {
  const messages = getConversationWithFallback(request);
  const firstMenteeMessage = messages.find((message) => {
    return message.sender === 'MENTEE';
  });
  const timelineMessages = messages.filter((message) => {
    return message.id !== firstMenteeMessage?.id;
  });
  const panelState = getDetailPanelState({ request, channel });

  return (
    <section className="flex h-full flex-col">
      <header className="border-border-subtle bg-background-default border-b px-250 py-150">
        <div className="flex items-center justify-between gap-150">
          <div className="flex min-w-0 items-center gap-125">
            <UserAvatar
              name={displayName}
              color={channel === 'sent' ? 'brand' : 'neutral'}
            />
            <div className="min-w-0">
              <p className="font-designer-18b text-text-default truncate">
                {displayName}
              </p>
              <p className="font-designer-12r text-text-subtle truncate">
                {displayRole || '상담 참여자'} · #
                {request.id.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
          <Badge color={panelState.badgeColor} shape="round">
            {panelState.badgeLabel}
          </Badge>
        </div>

        <div className="rounded-150 bg-background-alternative mt-150 px-150 py-125">
          <p className="font-designer-13b text-text-default">
            {panelState.title}
          </p>
          <p className="font-designer-12r text-text-subtle mt-25">
            {panelState.description}
          </p>
        </div>
      </header>

      <div className="bg-background-alternative min-h-0 flex-1 overflow-y-auto px-250 py-200">
        <div className="space-y-200">
          <QuestionCard request={request} />

          {timelineMessages.length > 0 ? (
            timelineMessages.map((message) => {
              if (message.sender === 'SYSTEM') {
                return (
                  <div key={message.id} className="py-50 text-center">
                    <span className="font-designer-11m text-text-subtle bg-background-default inline-flex rounded-full px-150 py-50 shadow-sm">
                      {message.content}
                    </span>
                  </div>
                );
              }

              const isMentorMessage = message.sender === 'MENTOR';
              const authorName = isMentorMessage
                ? channel === 'sent'
                  ? displayName
                  : '나'
                : channel === 'sent'
                  ? '나'
                  : displayName;
              const authorLabel = isMentorMessage
                ? channel === 'sent'
                  ? '멘토 답변'
                  : '내 답변'
                : channel === 'sent'
                  ? '추가 질문'
                  : '멘티 질문';

              return (
                <ConversationCard
                  key={message.id}
                  message={message}
                  authorName={authorName}
                  authorLabel={authorLabel}
                  tone={isMentorMessage ? 'brand' : 'neutral'}
                />
              );
            })
          ) : (
            <div className="rounded-150 border-border-subtle bg-background-default border px-250 py-200 text-center">
              <p className="font-designer-14m text-text-subtle">
                {panelState.emptyStateTitle}
              </p>
              <p className="font-designer-12r text-text-subtlest mt-50">
                {panelState.emptyStateDescription}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-border-subtle bg-background-default border-t px-200 py-150">
        {panelState.canCompose ? (
          <div className="rounded-150 border-border-subtle bg-background-default border px-200 py-125">
            <textarea
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              placeholder={panelState.placeholder}
              rows={4}
              className="font-designer-14r text-text-default placeholder:text-text-subtlest w-full resize-none bg-transparent leading-relaxed outline-none"
            />
            <div className="border-border-subtle mt-100 flex items-center justify-between border-t pt-100">
              <span className="font-designer-12r text-text-subtlest">
                {draft.trim().length > 0 ? `${draft.trim().length}자` : ''}
              </span>
              <button
                type="button"
                disabled={!canSend}
                onClick={onSend}
                className="bg-fill-brand-default-default text-text-inverse disabled:bg-background-disabled disabled:text-text-disabled rounded-100 inline-flex h-36 items-center gap-75 px-150 transition-colors"
              >
                <SendHorizontal className="h-14 w-14" />
                <span className="font-designer-13m">
                  {panelState.submitLabel}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-150 bg-background-alternative px-200 py-150 text-center">
            <p className="font-designer-13m text-text-subtle">
              {panelState.lockMessage}
            </p>
            {panelState.ctaHref && panelState.ctaLabel ? (
              <Link href={panelState.ctaHref} className="mt-100 inline-flex">
                <Button color="outlined" size="small">
                  {panelState.ctaLabel}
                </Button>
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

export function NoteConsultationHeader() {
  return (
    <header>
      <div className="mb-75 inline-flex items-center gap-100">
        <Link href="/mentoring">
          <Button color="outlined" size="small">
            멘토링 목록
          </Button>
        </Link>
        <MessageCircle className="text-text-brand h-24 w-24" />
        <h1 className="font-designer-24b text-text-default">
          {MENTORING_NOTE_LABEL}
        </h1>
      </div>
      <p className="font-designer-14r text-text-subtle">
        답변 상태와 후속 질문 흐름을 한 화면에서 이어서 확인할 수 있어요.
      </p>
    </header>
  );
}

export function NoteConsultationEmpty() {
  return (
    <section className="rounded-200 border-border-subtle bg-background-default flex min-h-[520px] flex-col items-center justify-center border px-300 py-500 text-center">
      <div className="bg-fill-brand-subtle-default rounded-500 mb-200 flex h-[72px] w-[72px] items-center justify-center">
        <MessageCircle className="text-text-brand h-32 w-32" />
      </div>
      <h2 className="font-designer-24b text-text-default mb-75">
        아직 {MENTORING_NOTE_LABEL} 내역이 없어요
      </h2>
      <p className="font-designer-16m text-text-default mb-50">
        멘토를 찾아 {MENTORING_NOTE_LABEL}을 신청해보세요.
      </p>
      <p className="font-designer-14r text-text-subtle mb-250">
        첫 답변이 시작되면 같은 화면에서 후속 질문까지 이어갈 수 있어요.
      </p>
      <Link href="/mentoring">
        <Button color="primary" size="large">
          멘토링 둘러보기
        </Button>
      </Link>
    </section>
  );
}

export function NoteConsultationFilters({
  activeChannel,
  searchKeyword,
  onActiveChannelChange,
  onSearchKeywordChange,
}: NoteConsultationFiltersProps) {
  return (
    <div className="border-border-subtle border-b px-200 py-125">
      <div className="bg-background-alternative rounded-100 flex p-25">
        <button
          type="button"
          onClick={() => onActiveChannelChange('sent')}
          className={`font-designer-13m rounded-75 h-36 flex-1 ${
            activeChannel === 'sent'
              ? 'bg-fill-brand-subtle-default text-text-brand'
              : 'text-text-subtle'
          }`}
        >
          내가 신청한 상담
        </button>
        <button
          type="button"
          onClick={() => onActiveChannelChange('received')}
          className={`font-designer-13m rounded-75 h-36 flex-1 ${
            activeChannel === 'received'
              ? 'bg-fill-brand-subtle-default text-text-brand'
              : 'text-text-subtle'
          }`}
        >
          받은 쪽지 신청
        </button>
      </div>

      <label className="border-border-subtle rounded-100 mt-100 flex h-36 items-center gap-50 border px-100">
        <Search className="text-text-subtlest h-14 w-14" />
        <input
          value={searchKeyword}
          onChange={(event) => onSearchKeywordChange(event.target.value)}
          className="font-designer-12r text-text-default placeholder:text-text-subtlest h-full flex-1 bg-transparent outline-none"
          placeholder="이름, 역할, 메시지 검색"
        />
      </label>
    </div>
  );
}

export function NoteConsultationList({
  items,
  itemStatusSummaries,
  selectedRequestId,
  onSelectRequestId,
}: NoteConsultationListProps) {
  return (
    <div className="min-h-0 flex-1 space-y-50 overflow-y-auto px-100 py-100">
      {items.length === 0 ? (
        <div className="rounded-100 bg-background-alternative px-125 py-150 text-center">
          <p className="font-designer-13m text-text-subtle">
            표시할 상담 내역이 없습니다.
          </p>
        </div>
      ) : (
        items.map((item) => (
          <RequestListCard
            key={item.id}
            item={item}
            statusSummary={itemStatusSummaries[item.id]}
            selected={item.id === selectedRequestId}
            onClick={() => onSelectRequestId(item.id)}
          />
        ))
      )}
    </div>
  );
}

function NoteConsultationSummaryStrip({
  summaryItems,
}: {
  summaryItems: NoteConsultationChannelSummaryItem[];
}) {
  if (summaryItems.length === 0) {
    return null;
  }

  return (
    <div className="border-border-subtle border-b px-200 py-125">
      <div className="mb-75 flex items-center justify-between gap-100">
        <p className="font-designer-12m text-text-subtle">지금 확인할 상태</p>
        <p className="font-designer-11m text-text-subtlest">
          현재 목록 기준으로 집계됩니다.
        </p>
      </div>
      <div className="flex flex-wrap gap-50">
        {summaryItems.map((item) => (
          <Badge key={item.key} color={item.tone} shape="round">
            {item.label} {item.count}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function PinnedRequestCallout({
  pinnedItem,
  pinnedItemStatusSummary,
  selectedRequestId,
  isRestoringPinnedItem,
  hasMissingPinnedItem,
  onSelectRequestId,
}: {
  pinnedItem?: NoteConsultationListItem;
  pinnedItemStatusSummary?: NoteConsultationItemStatusSummary;
  selectedRequestId: string;
  isRestoringPinnedItem: boolean;
  hasMissingPinnedItem: boolean;
  onSelectRequestId: (requestId: string) => void;
}) {
  if (isRestoringPinnedItem) {
    return (
      <div className="border-border-information bg-background-accent-blue-subtle border-b px-200 py-125">
        <p className="font-designer-12b text-text-default">
          선택한 상담을 불러오는 중입니다
        </p>
        <p className="font-designer-11r text-text-subtle mt-25">
          신청 직후라면 몇 초 안에 상태와 대화창이 이어집니다.
        </p>
      </div>
    );
  }

  if (hasMissingPinnedItem) {
    return (
      <div className="border-border-warning bg-background-accent-yellow-subtle border-b px-200 py-125">
        <p className="font-designer-12b text-text-default">
          선택한 상담을 찾지 못해 최신 목록을 보여주고 있습니다
        </p>
        <p className="font-designer-11r text-text-subtle mt-25">
          상태가 바뀌었거나 다른 목록으로 이동된 경우일 수 있습니다.
        </p>
      </div>
    );
  }

  if (!pinnedItem || !pinnedItemStatusSummary) {
    return null;
  }

  const isSelected = pinnedItem.id === selectedRequestId;

  return (
    <div className="border-border-subtle bg-background-alternative border-b px-200 py-125">
      <div className="flex items-start justify-between gap-100">
        <div className="min-w-0">
          <p className="font-designer-12m text-text-subtle">열어둔 상담</p>
          <p className="font-designer-14b text-text-default mt-25 truncate">
            {pinnedItem.displayName}
          </p>
          <p className="font-designer-11r text-text-subtlest mt-25 line-clamp-2">
            {pinnedItem.lastMessageContent}
          </p>
        </div>
        {isSelected ? (
          <span className="font-designer-11m text-text-subtlest shrink-0">
            현재 보고 있음
          </span>
        ) : (
          <Button
            color="outlined"
            size="small"
            onClick={() => onSelectRequestId(pinnedItem.id)}
          >
            바로 열기
          </Button>
        )}
      </div>
      <div className="mt-75 flex flex-wrap gap-50">
        <Badge
          color={MENTORING_REQUEST_STATUS_META[pinnedItem.request.status].color}
          shape="round"
        >
          {MENTORING_REQUEST_STATUS_META[pinnedItem.request.status].label}
        </Badge>
        <Badge color={pinnedItemStatusSummary.tone} shape="round">
          {pinnedItemStatusSummary.label}
        </Badge>
      </div>
    </div>
  );
}

export function NoteConsultationGrid({
  activeChannel,
  searchKeyword,
  filteredItems,
  itemStatusSummaries,
  activeChannelSummaryItems,
  selectedRequestId,
  selectedItem,
  pinnedItem,
  pinnedItemStatusSummary,
  isRestoringPinnedItem,
  hasMissingPinnedItem,
  draft,
  canSend,
  onActiveChannelChange,
  onSearchKeywordChange,
  onSelectRequestId,
  onDraftChange,
  onSend,
}: NoteConsultationGridProps) {
  return (
    <section className="rounded-200 border-border-subtle bg-background-default -mx-[90px] overflow-hidden border">
      <div className="grid min-h-[660px] grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-border-subtle flex min-h-0 flex-col border-r">
          <div className="border-border-subtle border-b px-200 py-150">
            <h2 className="font-designer-20b text-text-default">메시지</h2>
            <p className="font-designer-12r text-text-subtle mt-25">
              상태를 확인하고 필요한 상담만 바로 이어서 열 수 있어요.
            </p>
          </div>

          <NoteConsultationFilters
            activeChannel={activeChannel}
            searchKeyword={searchKeyword}
            onActiveChannelChange={onActiveChannelChange}
            onSearchKeywordChange={onSearchKeywordChange}
          />

          <PinnedRequestCallout
            pinnedItem={pinnedItem}
            pinnedItemStatusSummary={pinnedItemStatusSummary}
            selectedRequestId={selectedRequestId}
            isRestoringPinnedItem={isRestoringPinnedItem}
            hasMissingPinnedItem={hasMissingPinnedItem}
            onSelectRequestId={onSelectRequestId}
          />

          <NoteConsultationSummaryStrip
            summaryItems={activeChannelSummaryItems}
          />

          <NoteConsultationList
            items={filteredItems}
            itemStatusSummaries={itemStatusSummaries}
            selectedRequestId={selectedRequestId}
            onSelectRequestId={onSelectRequestId}
          />
        </aside>

        <div className="min-h-0">
          {selectedItem ? (
            <DetailPanel
              request={selectedItem.request}
              displayName={selectedItem.displayName}
              displayRole={selectedItem.displayRole}
              channel={selectedItem.channel}
              draft={draft}
              onDraftChange={onDraftChange}
              onSend={onSend}
              canSend={canSend}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-300">
              <p className="font-designer-16m text-text-subtle text-center">
                좌측 목록에서 상담을 선택하면
                <br />
                상태와 대화 흐름을 바로 확인할 수 있어요.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
