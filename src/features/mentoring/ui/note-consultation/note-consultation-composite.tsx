'use client';

import dayjs from 'dayjs';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/common/ui/button';
import { MENTORING_NOTE_LABEL } from '@/features/mentoring/model/my-mentoring-display-meta';
import { getNoteConsultationMessagePreviewText } from '@/features/mentoring/model/note-consultation-message';
import NoteConsultationDetailPanel from '@/features/mentoring/ui/note-consultation/note-consultation-detail-panel';
import NoteConsultationParticipantAvatar from '@/features/mentoring/ui/note-consultation/note-consultation-participant-avatar';
import type { MentoringRequest } from '@/types/mentoring/management-domain';
import type {
  NoteConsultationFiltersProps,
  NoteConsultationGridProps,
  NoteConsultationListProps,
} from '@/types/mentoring/note-consultation-composite-view';
import type { NoteConsultationStatusFilter } from '@/types/mentoring/note-consultation-controller-view';
import type { NoteConsultationListItem } from '@/types/mentoring/note-consultation-view';

const NOTE_STATUS_TAB_DESCRIPTION_MAP: Partial<
  Record<NoteConsultationStatusFilter, string>
> = {
  'mentor-requested': '새 신청을 확인하고 수락 또는 거절을 결정합니다.',
  'mentor-drafting': '수락한 상담의 첫 답변을 작성하는 단계입니다.',
  'mentor-completed': '답변 완료와 거절된 신청을 함께 확인합니다.',
  'mentee-pending': '멘토 승인과 첫 답변을 기다리는 단계입니다.',
  'mentee-answered': '멘토 답변을 확인하고 필요하면 새 쪽지상담을 신청합니다.',
  'mentee-completed': '처리가 끝난 상담 내역을 모아 확인합니다.',
};

const getRequestTitle = (
  request: Pick<MentoringRequest, 'requestTitle' | 'requestMessage'>,
  fallback: string,
) => {
  const explicitTitle = request.requestTitle?.trim();
  if (explicitTitle && explicitTitle.length > 0) {
    return explicitTitle;
  }

  const firstLine = getNoteConsultationMessagePreviewText(request.requestMessage)
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  return firstLine || fallback;
};

function RequestListCard({
  item,
  selected,
  onClick,
}: {
  item: NoteConsultationListItem;
  selected: boolean;
  onClick: () => void;
}) {
  const title = getRequestTitle(item.request, '멘토링 쪽지 상담');

  return (
    <div
      className={`rounded-200 w-full border px-200 py-200 text-left transition-colors ${
        selected
          ? 'border-border-brand bg-fill-brand-subtle-default shadow-1'
          : 'border-border-subtle bg-background-default hover:border-border-brand'
      }`}
    >
      <button type="button" onClick={onClick} className="w-full text-left">
        <div className="flex items-start justify-between gap-100">
          <p className="line-clamp-1 min-w-0 flex-1 font-designer-16b text-text-default">
            {title}
          </p>
          <span className="shrink-0 font-designer-12m text-text-subtle">
            {dayjs(item.lastMessageCreatedAt).format('MM.DD HH:mm')}
          </span>
        </div>
        <p className="mt-100 line-clamp-3 whitespace-pre-line font-designer-13r text-text-subtle">
          {getNoteConsultationMessagePreviewText(item.lastMessageContent)}
        </p>
        <div className="mt-150 flex items-center gap-100">
          <NoteConsultationParticipantAvatar
            name={item.displayName}
            imageUrl={item.counterpartProfileImageUrl}
            memberId={item.counterpartMemberId}
            size={36}
          />
          <div className="min-w-0">
            <p className="truncate font-designer-13m text-text-default">
              {item.displayName}
            </p>
            <p className="truncate font-designer-11r text-text-subtle">
              {item.displayRole || '상담 참여자'}
            </p>
          </div>
        </div>
      </button>
      <div className="mt-150 flex justify-end">
        <Button
          type="button"
          color={selected ? 'primary' : 'outlined'}
          size="xsmall"
          onClick={onClick}
        >
          상세내역
        </Button>
      </div>
    </div>
  );
}

export function NoteConsultationHeader() {
  return (
    <header className="flex flex-col gap-150">
      <div className="flex flex-wrap items-center gap-100">
        <Link href="/mentoring">
          <Button color="outlined" size="small">
            멘토링 목록
          </Button>
        </Link>
        <span className="bg-fill-brand-subtle-default inline-flex h-44 w-44 items-center justify-center rounded-full">
          <MessageCircle className="text-text-brand h-22 w-22" />
        </span>
        <h1 className="font-designer-24b text-text-default">
          {MENTORING_NOTE_LABEL}
        </h1>
      </div>
      <p className="max-w-[720px] font-designer-14r text-text-subtle">
        신청 내역을 목록에서 선택하면 질문과 멘토 답변을 바로 확인합니다.
      </p>
    </header>
  );
}

export function NoteConsultationEmpty() {
  return (
    <section className="rounded-200 border-border-subtle bg-background-default flex min-h-[520px] flex-col items-center justify-center border px-300 py-500 text-center">
      <div className="bg-fill-brand-subtle-default mb-200 flex h-[72px] w-[72px] items-center justify-center rounded-500">
        <MessageCircle className="text-text-brand h-32 w-32" />
      </div>
      <h2 className="mb-75 font-designer-24b text-text-default">
        아직 {MENTORING_NOTE_LABEL} 내역이 없어요
      </h2>
      <p className="mb-50 font-designer-16m text-text-default">
        멘토를 찾아 {MENTORING_NOTE_LABEL}을 신청해보세요.
      </p>
      <p className="mb-250 font-designer-14r text-text-subtle">
        신청만 있어도 이 곳에서 질문과 멘토 답변을 확인할 수 있어요.
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
  statusFilter,
  statusTabs,
  showChannelTabs = true,
  compactLayout = false,
  onActiveChannelChange,
  onStatusFilterChange,
}: NoteConsultationFiltersProps) {
  const showStatusTabs = statusTabs.length > 0;

  if (!showChannelTabs && !showStatusTabs) {
    return null;
  }

  return (
    <div
      className={`flex flex-col gap-75 ${compactLayout ? '' : 'px-250 py-175'}`}
    >
      {showChannelTabs ? (
        <div className="bg-background-alternative rounded-150 flex p-50">
          <button
            type="button"
            onClick={() => onActiveChannelChange('sent')}
            className={`rounded-100 h-40 flex-1 font-designer-13m ${
              activeChannel === 'sent'
                ? 'note-consultation-filter-tab-active bg-fill-brand-subtle-default text-text-brand'
                : 'hover:bg-background-default text-text-subtle'
            }`}
          >
            멘티 게시판
          </button>
          <button
            type="button"
            onClick={() => onActiveChannelChange('received')}
            className={`rounded-100 h-40 flex-1 font-designer-13m ${
              activeChannel === 'received'
                ? 'note-consultation-filter-tab-active bg-fill-brand-subtle-default text-text-brand'
                : 'hover:bg-background-default text-text-subtle'
            }`}
          >
            멘토 게시판
          </button>
        </div>
      ) : null}
      {showStatusTabs ? (
        <div className="grid grid-cols-1 gap-125 lg:grid-cols-3">
          {statusTabs.map((tab, index) => {
            const isActive = tab.key === statusFilter;
            const step = `${index + 1}`.padStart(2, '0');
            const description =
              NOTE_STATUS_TAB_DESCRIPTION_MAP[tab.key] ??
              '상태별 상담 흐름을 이 단계에서 확인합니다.';

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onStatusFilterChange(tab.key)}
                className={`rounded-150 border p-200 text-left transition-colors ${
                  isActive
                    ? 'border-border-brand bg-background-default'
                    : 'border-border-subtle bg-background-default hover:bg-background-alternative'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-100">
                    <span
                      className={`inline-flex h-300 w-300 shrink-0 items-center justify-center rounded-full font-designer-12b ${
                        isActive
                          ? 'bg-fill-brand-default-default text-text-inverse'
                          : 'bg-background-alternative text-text-subtle'
                      }`}
                    >
                      {step}
                    </span>
                    <span
                      className={`font-designer-15b ${
                        isActive ? 'text-text-brand' : 'text-text-default'
                      }`}
                    >
                      {tab.label}
                    </span>
                  </div>
                  <span className="shrink-0 font-designer-13m text-text-subtle">
                    {tab.count}건
                  </span>
                </div>
                <p className="mt-100 font-designer-12r text-text-subtle">
                  {description}
                </p>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function NoteConsultationList({
  items,
  selectedRequestId,
  compactLayout = false,
  onSelectRequestId,
}: NoteConsultationListProps) {
  return (
    <div
      className={
        compactLayout
          ? 'min-h-0 flex-1 space-y-100 overflow-y-auto overscroll-contain'
          : 'min-h-[640px] min-h-0 flex-1 space-y-100 overflow-y-auto overscroll-contain px-250 py-175'
      }
    >
      {items.length === 0 ? (
        <div className="rounded-150 bg-background-alternative px-150 py-175 text-center">
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

function PinnedRequestCallout({
  isRestoringPinnedItem,
  hasMissingPinnedItem,
}: {
  isRestoringPinnedItem: boolean;
  hasMissingPinnedItem: boolean;
}) {
  if (isRestoringPinnedItem) {
    return (
      <div className="border-border-information bg-background-accent-blue-subtle border-b px-200 py-125">
        <p className="font-designer-12b text-text-default">
          선택한 상담을 불러오는 중입니다
        </p>
        <p className="mt-25 font-designer-11r text-text-subtle">
          신청 직후라면 몇 초 안에 상태와 상세 보드가 이어집니다.
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
        <p className="mt-25 font-designer-11r text-text-subtle">
          상태가 바뀌었거나 다른 목록으로 이동된 경우일 수 있습니다.
        </p>
      </div>
    );
  }

  return null;
}

export function NoteConsultationGrid({
  activeChannel,
  statusFilter,
  statusTabs,
  showChannelTabs = true,
  compactLayout = false,
  filteredItems,
  selectedRequestId,
  selectedItem,
  selectedRequest,
  isRestoringPinnedItem,
  hasMissingPinnedItem,
  canAcceptSelectedRequest = false,
  isAcceptingRequest = false,
  canCloseSelectedRequest = false,
  isClosingRequest = false,
  canSendSelectedMessage = false,
  canEditSelectedReply = false,
  isEditingSelectedReply = false,
  canSubmitSelectedMessage = false,
  isSendingMessage = false,
  useRichMessageComposer = false,
  messageDraft = '',
  messageContents,
  messageDraftMetaLabel,
  messagePlaceholder,
  sendButtonLabel,
  paidFollowupNoticeTitle,
  paidFollowupNoticeDescription,
  paidFollowupActionLabel,
  paidFollowupActionHref,
  onActiveChannelChange,
  onAcceptSelectedRequest,
  onCloseSelectedRequest,
  onStartEditingSelectedReply,
  onCancelEditingSelectedReply,
  onMessageDraftChange,
  onMessageContentsChange,
  onSendSelectedMessage,
  onStatusFilterChange,
  onSelectRequestId,
  onBack,
}: NoteConsultationGridProps) {
  const board = (
    <>
      <div className={compactLayout ? 'pb-150' : 'px-250 pt-250 pb-150'}>
        <h2 className="font-designer-20b text-text-default">상담 목록</h2>
        <p className="mt-25 font-designer-12r text-text-subtle">
          목록에서 상담을 선택하면 상세 화면으로 이동합니다.
        </p>
      </div>
      <NoteConsultationFilters
        activeChannel={activeChannel}
        statusFilter={statusFilter}
        statusTabs={statusTabs}
        showChannelTabs={showChannelTabs}
        compactLayout={compactLayout}
        onActiveChannelChange={onActiveChannelChange}
        onStatusFilterChange={onStatusFilterChange}
      />
      <PinnedRequestCallout
        isRestoringPinnedItem={isRestoringPinnedItem}
        hasMissingPinnedItem={hasMissingPinnedItem}
      />
      <NoteConsultationList
        items={filteredItems}
        selectedRequestId={selectedRequestId}
        compactLayout={compactLayout}
        onSelectRequestId={onSelectRequestId}
      />
    </>
  );

  if (!selectedItem) {
    return (
      <div
        className={
          compactLayout ? 'min-h-0 flex flex-col gap-200' : 'min-h-0 flex flex-col'
        }
      >
        {board}
      </div>
    );
  }

  return (
    <NoteConsultationDetailPanel
      request={selectedRequest ?? selectedItem.request}
      displayName={selectedItem.displayName}
      displayRole={selectedItem.displayRole}
      counterpartMemberId={selectedItem.counterpartMemberId}
      counterpartProfileImageUrl={selectedItem.counterpartProfileImageUrl}
      canAcceptRequest={canAcceptSelectedRequest}
      isAcceptingRequest={isAcceptingRequest}
      canCloseRequest={canCloseSelectedRequest}
      isClosingRequest={isClosingRequest}
      canSendMessage={canSendSelectedMessage}
      canEditSelectedReply={canEditSelectedReply}
      isEditingSelectedReply={isEditingSelectedReply}
      canSubmitMessage={canSubmitSelectedMessage}
      isSendingMessage={isSendingMessage}
      useRichMessageComposer={useRichMessageComposer}
      messageDraft={messageDraft}
      messageContents={messageContents}
      messageDraftMetaLabel={messageDraftMetaLabel}
      messagePlaceholder={messagePlaceholder}
      sendButtonLabel={sendButtonLabel}
      paidFollowupNoticeTitle={paidFollowupNoticeTitle}
      paidFollowupNoticeDescription={paidFollowupNoticeDescription}
      paidFollowupActionLabel={paidFollowupActionLabel}
      paidFollowupActionHref={paidFollowupActionHref}
      onBack={onBack}
      onAcceptRequest={onAcceptSelectedRequest}
      onCloseRequest={onCloseSelectedRequest}
      onStartEditingSelectedReply={onStartEditingSelectedReply}
      onCancelEditingSelectedReply={onCancelEditingSelectedReply}
      onMessageDraftChange={onMessageDraftChange}
      onMessageContentsChange={onMessageContentsChange}
      onSendMessage={onSendSelectedMessage}
    />
  );
}
