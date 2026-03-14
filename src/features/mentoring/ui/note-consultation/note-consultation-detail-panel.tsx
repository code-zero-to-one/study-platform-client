'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/common/ui/button';
import MentoringRequestEditor from '@/features/mentoring/ui/apply/mentoring-request-editor';
import MentoringMarkdownEditor from '@/features/mentoring/ui/common/mentoring-markdown-editor';
import NoteConsultationParticipantAvatar from '@/features/mentoring/ui/note-consultation/note-consultation-participant-avatar';
import NoteConsultationQuestionBoard, {
  formatNoteConsultationDateTime,
} from '@/features/mentoring/ui/note-consultation/note-consultation-question-board';
import type { MentoringRequest } from '@/types/mentoring/management-domain';
import type { MentoringRequestContentBlock } from '@/types/mentoring/request-content';

interface NoteConsultationDetailPanelProps {
  request: MentoringRequest;
  displayName: string;
  displayRole: string;
  counterpartMemberId?: number;
  counterpartProfileImageUrl?: string;
  canAcceptRequest?: boolean;
  isAcceptingRequest?: boolean;
  canCloseRequest?: boolean;
  isClosingRequest?: boolean;
  canSendMessage?: boolean;
  canEditSelectedReply?: boolean;
  isEditingSelectedReply?: boolean;
  canSubmitMessage?: boolean;
  isSendingMessage?: boolean;
  useRichMessageComposer?: boolean;
  messageDraft?: string;
  messageContents?: MentoringRequestContentBlock[];
  messageDraftMetaLabel?: string;
  messagePlaceholder?: string;
  sendButtonLabel?: string;
  paidFollowupNoticeTitle?: string;
  paidFollowupNoticeDescription?: string;
  paidFollowupActionLabel?: string;
  paidFollowupActionHref?: string;
  onBack: () => void;
  onAcceptRequest?: () => void;
  onCloseRequest?: () => void;
  onStartEditingSelectedReply?: () => void;
  onCancelEditingSelectedReply?: () => void;
  onMessageDraftChange?: (value: string) => void;
  onMessageContentsChange?: (next: MentoringRequestContentBlock[]) => void;
  onSendMessage?: () => void;
}

function DetailPanelHeader({
  request,
  displayName,
  displayRole,
  counterpartMemberId,
  counterpartProfileImageUrl,
  canAcceptRequest,
  isAcceptingRequest,
  canCloseRequest,
  isClosingRequest,
  onBack,
  onAcceptRequest,
  onCloseRequest,
}: Pick<
  NoteConsultationDetailPanelProps,
  | 'request'
  | 'displayName'
  | 'displayRole'
  | 'counterpartMemberId'
  | 'counterpartProfileImageUrl'
  | 'canAcceptRequest'
  | 'isAcceptingRequest'
  | 'canCloseRequest'
  | 'isClosingRequest'
  | 'onBack'
  | 'onAcceptRequest'
  | 'onCloseRequest'
>) {
  return (
    <header className="border-border-subtle border-b px-250 pt-250 pb-175">
      <div className="flex items-center gap-125">
        <button
          type="button"
          onClick={onBack}
          className="border-border-subtle hover:text-text-default shrink-0 inline-flex items-center gap-75 rounded-150 border px-125 py-75 font-designer-13m text-text-subtle"
        >
          <ChevronLeft className="h-200 w-200" /> 목록으로 돌아가기
        </button>
        <span className="truncate font-designer-11r text-text-subtle">
          상담 ID {request.id}
        </span>
      </div>
      <div className="mt-175 flex flex-wrap items-center justify-between gap-150">
        <div className="flex min-w-0 items-center gap-125">
          <NoteConsultationParticipantAvatar
            name={displayName}
            imageUrl={counterpartProfileImageUrl}
            memberId={counterpartMemberId}
          />
          <div className="min-w-0">
            <p className="truncate font-designer-18b text-text-default">
              {displayName}
            </p>
            <p className="truncate font-designer-12r text-text-subtle">
              {displayRole || '상담 참여자'}
            </p>
            <p className="mt-25 truncate font-designer-11r text-text-subtlest">
              요청 시각 {formatNoteConsultationDateTime(request.requestedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-100">
          {canAcceptRequest ? (
            <Button
              type="button"
              color="primary"
              size="small"
              onClick={onAcceptRequest}
              disabled={isAcceptingRequest}
            >
              {isAcceptingRequest ? '수락 중...' : '상담 수락'}
            </Button>
          ) : null}
          {canCloseRequest ? (
            <Button
              type="button"
              color="outlined"
              size="small"
              onClick={onCloseRequest}
              disabled={isClosingRequest}
            >
              {isClosingRequest ? '종료 중...' : '상담 종료'}
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function DetailPanelComposer({
  canSubmitMessage,
  isEditingSelectedReply,
  isSendingMessage,
  messageDraft,
  messageContents,
  messageDraftMetaLabel,
  messagePlaceholder,
  sendButtonLabel,
  useRichMessageComposer,
  onCancelEditingSelectedReply,
  onMessageDraftChange,
  onMessageContentsChange,
  onSendMessage,
}: Pick<
  NoteConsultationDetailPanelProps,
  | 'canSubmitMessage'
  | 'isEditingSelectedReply'
  | 'isSendingMessage'
  | 'messageDraft'
  | 'messageContents'
  | 'messageDraftMetaLabel'
  | 'messagePlaceholder'
  | 'sendButtonLabel'
  | 'useRichMessageComposer'
  | 'onCancelEditingSelectedReply'
  | 'onMessageDraftChange'
  | 'onMessageContentsChange'
  | 'onSendMessage'
>) {
  return (
    <div className="border-border-subtle border-t px-250 py-200">
      <div className="mb-125 flex items-center justify-between gap-100">
        <div>
          <p className="font-designer-14b text-text-default">
            {isEditingSelectedReply ? '답변 수정' : sendButtonLabel}
          </p>
          <p className="mt-25 font-designer-12r text-text-subtle">
            {isEditingSelectedReply
              ? '등록된 답변을 수정하는 중입니다.'
              : '마크다운, 링크, 이미지, 첨부파일로 답변을 정리해 보내세요.'}
          </p>
        </div>
        <span className="font-designer-11r text-text-subtlest">
          {messageDraftMetaLabel}
        </span>
      </div>
      {useRichMessageComposer ? (
        <MentoringRequestEditor
          method="note"
          value={messageContents ?? []}
          onChange={(nextContents) => onMessageContentsChange?.(nextContents)}
        />
      ) : (
        <MentoringMarkdownEditor
          value={messageDraft}
          onChange={(nextValue) => onMessageDraftChange?.(nextValue)}
          placeholder={messagePlaceholder}
        />
      )}
      <div className="mt-150 flex justify-end">
        {isEditingSelectedReply ? (
          <Button
            type="button"
            color="outlined"
            size="small"
            onClick={onCancelEditingSelectedReply}
          >
            수정 취소
          </Button>
        ) : null}
        <Button
          type="button"
          color="primary"
          size="small"
          className={isEditingSelectedReply ? 'ml-100' : undefined}
          disabled={!canSubmitMessage || isSendingMessage}
          onClick={onSendMessage}
        >
          {isSendingMessage ? '전송 중...' : sendButtonLabel}
        </Button>
      </div>
    </div>
  );
}

function DetailPanelNotice({
  paidFollowupNoticeTitle,
  paidFollowupNoticeDescription,
  paidFollowupActionLabel,
  paidFollowupActionHref,
}: Pick<
  NoteConsultationDetailPanelProps,
  | 'paidFollowupNoticeTitle'
  | 'paidFollowupNoticeDescription'
  | 'paidFollowupActionLabel'
  | 'paidFollowupActionHref'
>) {
  if (!paidFollowupNoticeTitle || !paidFollowupNoticeDescription) {
    return null;
  }

  return (
    <div className="border-border-subtle border-t px-250 py-200">
      <div className="rounded-150 border-border-subtle bg-background-alternative flex flex-col gap-125 border px-175 py-150">
        <div>
          <p className="font-designer-14b text-text-default">
            {paidFollowupNoticeTitle}
          </p>
          <p className="mt-50 font-designer-12r text-text-subtle">
            {paidFollowupNoticeDescription}
          </p>
        </div>
        {paidFollowupActionLabel && paidFollowupActionHref ? (
          <div className="flex justify-end">
            <Button asChild type="button" color="outlined" size="small">
              <Link href={paidFollowupActionHref}>{paidFollowupActionLabel}</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function NoteConsultationDetailPanel({
  request,
  displayName,
  displayRole,
  counterpartMemberId,
  counterpartProfileImageUrl,
  canAcceptRequest,
  isAcceptingRequest = false,
  canCloseRequest,
  isClosingRequest = false,
  canSendMessage = false,
  canEditSelectedReply = false,
  isEditingSelectedReply = false,
  canSubmitMessage = false,
  isSendingMessage = false,
  useRichMessageComposer = false,
  messageDraft = '',
  messageContents,
  messageDraftMetaLabel = '내용 없음',
  messagePlaceholder = '메시지를 입력해주세요.',
  sendButtonLabel = '메시지 보내기',
  paidFollowupNoticeTitle,
  paidFollowupNoticeDescription,
  paidFollowupActionLabel,
  paidFollowupActionHref,
  onBack,
  onAcceptRequest,
  onCloseRequest,
  onStartEditingSelectedReply,
  onCancelEditingSelectedReply,
  onMessageDraftChange,
  onMessageContentsChange,
  onSendMessage,
}: NoteConsultationDetailPanelProps) {
  const isReplyLocked =
    request.status === 'CLOSED' || request.status === 'REJECTED';
  const shouldShowComposer = canSendMessage && !isReplyLocked;
  const shouldAllowReplyEdit = canEditSelectedReply && !isReplyLocked;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background-default">
      <DetailPanelHeader
        request={request}
        displayName={displayName}
        displayRole={displayRole}
        counterpartMemberId={counterpartMemberId}
        counterpartProfileImageUrl={counterpartProfileImageUrl}
        canAcceptRequest={canAcceptRequest}
        isAcceptingRequest={isAcceptingRequest}
        canCloseRequest={canCloseRequest}
        isClosingRequest={isClosingRequest}
        onBack={onBack}
        onAcceptRequest={onAcceptRequest}
        onCloseRequest={onCloseRequest}
      />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-250 pb-250">
        <NoteConsultationQuestionBoard
          request={request}
          displayName={displayName}
          displayRole={displayRole}
          counterpartMemberId={counterpartMemberId}
          counterpartProfileImageUrl={counterpartProfileImageUrl}
          canEditSelectedReply={shouldAllowReplyEdit}
          onStartEditingSelectedReply={onStartEditingSelectedReply}
        />
      </div>
      {shouldShowComposer ? (
        <DetailPanelComposer
          canSubmitMessage={canSubmitMessage}
          isEditingSelectedReply={isEditingSelectedReply}
          isSendingMessage={isSendingMessage}
          messageDraft={messageDraft}
          messageContents={messageContents}
          messageDraftMetaLabel={messageDraftMetaLabel}
          messagePlaceholder={messagePlaceholder}
          sendButtonLabel={sendButtonLabel}
          useRichMessageComposer={useRichMessageComposer}
          onCancelEditingSelectedReply={onCancelEditingSelectedReply}
          onMessageDraftChange={onMessageDraftChange}
          onMessageContentsChange={onMessageContentsChange}
          onSendMessage={onSendMessage}
        />
      ) : (
        <DetailPanelNotice
          paidFollowupNoticeTitle={paidFollowupNoticeTitle}
          paidFollowupNoticeDescription={paidFollowupNoticeDescription}
          paidFollowupActionLabel={paidFollowupActionLabel}
          paidFollowupActionHref={paidFollowupActionHref}
        />
      )}
    </div>
  );
}
