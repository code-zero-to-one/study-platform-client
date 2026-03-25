'use client';

import dayjs from 'dayjs';
import { MessageCircle, Paperclip, Search, SendHorizontal } from 'lucide-react';
import Link from 'next/link';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import { MENTORING_REQUEST_STATUS_META } from '@/features/mentoring/model/management-status-meta';
import { getConversationWithFallback } from '@/features/mentoring/model/note-consultation-message';
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
  NoteConsultationChannel,
  NoteConsultationListItem,
} from '@/types/mentoring/note-consultation-view';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { formatExternalLink } from '@/utils/format';

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
      className={cn(
        'flex h-44 w-44 shrink-0 items-center justify-center rounded-full',
        color === 'brand'
          ? 'bg-fill-brand-subtle-default text-text-brand'
          : 'bg-fill-neutral-default-default text-text-subtle',
      )}
    >
      <span className="font-designer-16b">{initial}</span>
    </div>
  );
}

function RequestListCard({
  item,
  selected,
  onClick,
}: {
  item: NoteConsultationListItem;
  selected: boolean;
  onClick: () => void;
}) {
  const isUnreadLike = item.channel === 'sent' && item.mentorReplyCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-150 w-full px-175 py-175 text-left transition-colors',
        selected ? 'bg-fill-brand-subtle-default' : 'hover:bg-background-alternative',
      )}
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
          <div className="mt-75 flex items-center justify-between gap-75">
            <p className="font-designer-13r text-text-subtle line-clamp-1 flex-1">
              {item.lastMessageContent}
            </p>
            {isUnreadLike && (
              <span className="bg-fill-brand-default-default text-text-inverse font-designer-11m inline-flex h-20 min-w-[20px] shrink-0 items-center justify-center rounded-full px-50">
                {item.mentorReplyCount}
              </span>
            )}
          </div>
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
      <div className="mb-175 flex items-center gap-100">
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
        <div className="flex items-center gap-75">
          <Badge
            color={MENTORING_REQUEST_STATUS_META[request.status].color}
            shape="round"
          >
            {MENTORING_REQUEST_STATUS_META[request.status].label}
          </Badge>
        </div>
      </div>
      <p className="font-designer-14r text-text-default leading-relaxed whitespace-pre-line">
        {request.requestMessage}
      </p>
      {hasFiles && (
        <div className="border-border-subtle mt-175 flex flex-wrap gap-75 border-t pt-150">
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
              href={formatExternalLink(link)}
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

function AnswerCard({
  message,
  authorName,
  authorLabel,
}: {
  message: MentoringConversationMessage;
  authorName: string;
  authorLabel: string;
}) {
  return (
    <div className="rounded-150 border-border-subtle bg-background-default border p-250">
      <div className="mb-175 flex items-center gap-100">
        <UserAvatar name={authorName} color="brand" />
        <div className="min-w-0 flex-1">
          <p className="font-designer-15b text-text-default">{authorName}</p>
          <p className="font-designer-12r text-text-subtle">
            {dayjs(message.createdAt).format('YYYY.MM.DD HH:mm')}
          </p>
        </div>
        <span className="font-designer-12m text-text-brand bg-fill-brand-subtle-default rounded-full px-100 py-50">
          {authorLabel}
        </span>
      </div>
      <p className="font-designer-14r text-text-default leading-relaxed whitespace-pre-line">
        {message.content}
      </p>
    </div>
  );
}

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
  const mentorMessages = messages.filter(
    (message) => message.sender === 'MENTOR',
  );
  const systemMessages = messages.filter(
    (message) => message.sender === 'SYSTEM',
  );
  const canEditMessage =
    channel === 'received' && request.status !== 'REJECTED';
  const mentorAuthorName = channel === 'sent' ? displayName : '나';

  return (
    <section className="flex h-full flex-col">
      <header className="border-border-subtle bg-background-default flex items-center justify-between border-b px-250 py-150">
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
        {request.paymentMode === 'MANUAL_TRANSFER' && (
          <span className="font-designer-12r text-text-subtlest border-border-subtle rounded-full border px-100 py-50">
            {request.paymentStatus === 'CONFIRMED'
              ? '입금 확인 완료'
              : request.paymentStatus === 'PENDING_TRANSFER'
                ? '입금 대기'
                : '결제 불필요'}
          </span>
        )}
      </header>

      <div className="bg-background-alternative min-h-0 flex-1 overflow-y-auto px-250 py-200">
        <div className="space-y-175">
          <QuestionCard request={request} />

          {systemMessages.map((message) => (
            <div key={message.id} className="py-50 text-center">
              <span className="font-designer-11m text-text-subtle bg-background-default inline-flex rounded-full px-150 py-50 shadow-sm">
                {message.content}
              </span>
            </div>
          ))}

          {mentorMessages.length > 0 ? (
            <div className="space-y-150">
              <div className="flex items-center gap-100">
                <div className="bg-border-subtle h-[1px] flex-1" />
                <span className="font-designer-13m text-text-subtle px-75">
                  답변 {mentorMessages.length}개
                </span>
                <div className="bg-border-subtle h-[1px] flex-1" />
              </div>
              {mentorMessages.map((message) => (
                <AnswerCard
                  key={message.id}
                  message={message}
                  authorName={mentorAuthorName}
                  authorLabel="멘토 답변"
                />
              ))}
            </div>
          ) : (
            <div className="rounded-150 border-border-subtle bg-background-default border px-250 py-200 text-center">
              <p className="font-designer-14m text-text-subtle">
                아직 답변이 없습니다.
              </p>
              <p className="font-designer-12r text-text-subtlest mt-50">
                멘토가 곧 답변을 등록할 예정이에요.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-border-subtle bg-background-default border-t px-200 py-150">
        {canEditMessage ? (
          <div className="rounded-150 border-border-subtle bg-background-default border px-175 py-125">
            <textarea
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              placeholder="답변을 작성해주세요."
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
                <span className="font-designer-13m">답변 등록</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-150 bg-background-alternative px-175 py-125 text-center">
            <p className="font-designer-13m text-text-subtle">
              {channel === 'sent'
                ? '내가 신청한 상담은 조회만 가능합니다.'
                : request.status === 'REJECTED'
                  ? '거절된 신청 건에는 답변할 수 없습니다.'
                  : '멘토로 받은 신청 건에서만 답변을 작성할 수 있어요.'}
            </p>
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
        <h1 className="font-designer-24b text-text-default">쪽지 상담</h1>
      </div>
      <p className="font-designer-14r text-text-subtle">
        상담 목록과 대화 상세를 한 화면에서 확인할 수 있어요.
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
        아직 쪽지 상담 내역이 없어요
      </h2>
      <p className="font-designer-16m text-text-default mb-50">
        멘토를 찾아 쪽지 상담을 신청해보세요.
      </p>
      <p className="font-designer-14r text-text-subtle mb-250">
        궁금한 점을 쪽지로 남기면 빠르게 피드백을 받을 수 있어요.
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
    <div className="border-border-subtle border-b px-175 py-125">
      <div className="bg-background-alternative rounded-100 flex p-25">
        <button
          type="button"
          onClick={() => onActiveChannelChange('sent')}
          className={cn(
            'font-designer-13m rounded-75 h-36 flex-1',
            activeChannel === 'sent'
              ? 'bg-fill-brand-subtle-default text-text-brand'
              : 'text-text-subtle',
          )}
        >
          내가 신청한 상담
        </button>
        <button
          type="button"
          onClick={() => onActiveChannelChange('received')}
          className={cn(
            'font-designer-13m rounded-75 h-36 flex-1',
            activeChannel === 'received'
              ? 'bg-fill-brand-subtle-default text-text-brand'
              : 'text-text-subtle',
          )}
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
            selected={item.id === selectedRequestId}
            onClick={() => onSelectRequestId(item.id)}
          />
        ))
      )}
    </div>
  );
}

export function NoteConsultationGrid({
  activeChannel,
  searchKeyword,
  filteredItems,
  selectedRequestId,
  selectedItem,
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
          <div className="border-border-subtle border-b px-175 py-150">
            <h2 className="font-designer-20b text-text-default">메시지</h2>
            <p className="font-designer-12r text-text-subtle mt-25">
              내역을 선택하면 상세 대화가 열립니다.
            </p>
          </div>

          <NoteConsultationFilters
            activeChannel={activeChannel}
            searchKeyword={searchKeyword}
            onActiveChannelChange={onActiveChannelChange}
            onSearchKeywordChange={onSearchKeywordChange}
          />

          <NoteConsultationList
            items={filteredItems}
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
                상세 대화를 확인할 수 있어요.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
