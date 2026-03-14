'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { isApiError } from '@/api/client/api-error';
import {
  getLatestMentorReply,
  getNoteConsultationMessageMetaLabel,
  hasMentorReply,
} from '@/features/mentoring/model/note-consultation-message';
import {
  mergeNoteConsultationSelectedRequest,
  patchNoteConsultationRequestCache,
  upsertNoteConsultationMessageCache,
} from '@/features/mentoring/model/note-consultation-cache';
import {
  convertMentoringRequestContentsToHtml,
  createMentoringRequestHtmlBlock,
  getMentoringRequestAttachmentFileKeys,
  getMentoringRequestAttachedFileNames,
  getMentoringRequestReferenceLinks,
  getMentoringRequestTextLength,
  hasMentoringRequestAttachment,
  sanitizeMentoringRequestContents,
} from '@/features/mentoring/model/request-content';
import { useSendNoteConsultationMessageMutation } from '@/features/mentoring/model/use-send-note-consultation-message-mutation';
import {
  useAcceptMentoringRequestMutation,
  useCloseMentoringRequestMutation,
} from '@/features/mentoring/model/use-mentoring-lifecycle-mutations';
import { useMentoringRequestDetailQuery } from '@/features/mentoring/model/use-mentoring-request-detail-query';
import { useToastStore } from '@/stores/use-toast-store';
import type {
  MentoringConversationMessage,
  MentoringRequest,
} from '@/types/mentoring/management-domain';
import type { NoteConsultationChannel } from '@/types/mentoring/note-consultation-view';
import type { NoteConsultationListItem } from '@/types/mentoring/note-consultation-view';
import type { MentoringRequestContentBlock } from '@/types/mentoring/request-content';
import { NoteConsultationContractError } from './note-consultation-contract';

interface UseNoteConsultationDetailControllerParams {
  activeChannel: NoteConsultationChannel;
  mentorIdOverride?: number;
  selectedItem?: NoteConsultationListItem;
}

interface NoteConsultationPaidFollowupNotice {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

const NOTE_CONSULTATION_POLICY_CONFLICT_STATUS = 409;

const getStructuredMessageMetaLabel = ({
  textLength,
  attachmentCount,
  linkCount,
}: {
  textLength: number;
  attachmentCount: number;
  linkCount: number;
}) => {
  if (textLength === 0 && attachmentCount === 0 && linkCount === 0) {
    return '내용 없음';
  }

  const parts: string[] = [];
  if (textLength > 0) {
    parts.push(`텍스트 ${textLength}자`);
  }
  if (attachmentCount > 0) {
    parts.push(`첨부 ${attachmentCount}개`);
  }
  if (linkCount > 0) {
    parts.push(`링크 ${linkCount}개`);
  }

  return parts.join(' · ');
};

const createEditableMessageContents = (
  message?: MentoringConversationMessage,
): MentoringRequestContentBlock[] => {
  if (!message) {
    return [];
  }
  if ((message.messageContents?.length ?? 0) > 0) {
    return message.messageContents ?? [];
  }
  if (message.content.trim().length === 0) {
    return [];
  }

  return [createMentoringRequestHtmlBlock(message.content)];
};

export const useNoteConsultationDetailController = ({
  activeChannel,
  mentorIdOverride,
  selectedItem,
}: UseNoteConsultationDetailControllerParams) => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();
  const [messageDraft, setMessageDraft] = useState('');
  const [messageContents, setMessageContents] = useState<
    MentoringRequestContentBlock[]
  >([]);
  const [isEditingSelectedReply, setIsEditingSelectedReply] = useState(false);
  const acceptRequestMutation = useAcceptMentoringRequestMutation();
  const closeRequestMutation = useCloseMentoringRequestMutation();
  const sendMessageMutation = useSendNoteConsultationMessageMutation();
  const selectedRequestId = selectedItem?.request.id.trim() ?? '';
  const selectedRequestDetailQuery = useMentoringRequestDetailQuery(
    selectedRequestId,
    selectedRequestId.length > 0,
  );
  const selectedRequest = useMemo(() => {
    return mergeNoteConsultationSelectedRequest({
      detailRequest: selectedRequestDetailQuery.data?.request,
      fallbackRequest: selectedItem?.request,
    });
  }, [selectedItem?.request, selectedRequestDetailQuery.data?.request]);
  const effectiveSelectedItem = useMemo(() => {
    if (!selectedItem || !selectedRequest) {
      return selectedItem;
    }

    return {
      ...selectedItem,
      request: selectedRequest,
    };
  }, [selectedItem, selectedRequest]);
  const isMentorChannel = activeChannel === 'received';
  const sanitizedMessageContents = useMemo(() => {
    return sanitizeMentoringRequestContents(messageContents);
  }, [messageContents]);
  const structuredMessageContent = useMemo(() => {
    return convertMentoringRequestContentsToHtml(sanitizedMessageContents);
  }, [sanitizedMessageContents]);
  const structuredAttachedFileNames = useMemo(() => {
    return getMentoringRequestAttachedFileNames(sanitizedMessageContents);
  }, [sanitizedMessageContents]);
  const structuredAttachmentFileKeys = useMemo(() => {
    return getMentoringRequestAttachmentFileKeys(sanitizedMessageContents);
  }, [sanitizedMessageContents]);
  const structuredReferenceLinks = useMemo(() => {
    return getMentoringRequestReferenceLinks(sanitizedMessageContents);
  }, [sanitizedMessageContents]);
  const structuredTextLength = useMemo(() => {
    return getMentoringRequestTextLength(sanitizedMessageContents);
  }, [sanitizedMessageContents]);
  const hasStructuredMessageContent = useMemo(() => {
    return hasMentoringRequestAttachment(sanitizedMessageContents);
  }, [sanitizedMessageContents]);
  const hasExistingMentorReply =
    isMentorChannel && selectedRequest ? hasMentorReply(selectedRequest) : false;
  const menteeHasMentorReply =
    !isMentorChannel && selectedRequest ? hasMentorReply(selectedRequest) : false;
  const latestMentorReply = useMemo(() => {
    if (!isMentorChannel || !selectedRequest) {
      return undefined;
    }

    return getLatestMentorReply(selectedRequest);
  }, [isMentorChannel, selectedRequest]);
  const canAcceptSelectedRequest =
    isMentorChannel && selectedRequest?.status === 'PENDING';
  const canCloseSelectedRequest =
    isMentorChannel && selectedRequest?.status === 'ACCEPTED';
  const canEditSelectedReply =
    isMentorChannel &&
    !!selectedRequest &&
    hasExistingMentorReply &&
    selectedRequest.status !== 'CLOSED' &&
    selectedRequest.status !== 'REJECTED';
  const canCreateSelectedMessage =
    isMentorChannel &&
    !!selectedRequest &&
    selectedRequest.status !== 'CLOSED' &&
    selectedRequest.status !== 'REJECTED' &&
    !hasExistingMentorReply;
  const canSendSelectedMessage =
    isMentorChannel && (canCreateSelectedMessage || isEditingSelectedReply);
  const messagePlaceholder = isMentorChannel
    ? isEditingSelectedReply
      ? '수정할 답변 내용을 편집해주세요.'
      : canAcceptSelectedRequest
        ? '첫 답변을 입력하면 상담이 수락되고 바로 전달됩니다.'
        : '멘티에게 전달할 답변을 입력해주세요.'
    : '';
  const sendButtonLabel =
    isMentorChannel
    ? isEditingSelectedReply
      ? '답변 수정 저장'
      : canAcceptSelectedRequest
        ? '수락 후 답변 보내기'
        : '답변 보내기'
    : '답변 보내기';
  const canSubmitSelectedMessage =
    canSendSelectedMessage &&
    (structuredTextLength > 0 || hasStructuredMessageContent);
  const messageDraftMetaLabel = isMentorChannel
    ? getStructuredMessageMetaLabel({
        textLength: structuredTextLength,
        attachmentCount: structuredAttachedFileNames.length,
        linkCount: structuredReferenceLinks.length,
      })
    : getNoteConsultationMessageMetaLabel(messageDraft);
  const paidFollowupNotice = useMemo<
    NoteConsultationPaidFollowupNotice | undefined
  >(() => {
    if (isMentorChannel || !selectedRequest) {
      return undefined;
    }

    const reapplyHref = `/mentoring/${selectedRequest.mentorId}/apply?type=note`;

    if (
      menteeHasMentorReply ||
      selectedRequest.status === 'CLOSED' ||
      selectedRequest.status === 'REJECTED'
    ) {
      return {
        title: '추가 질문은 새 쪽지상담 결제가 필요합니다.',
        description:
          '쪽지상담 1회에는 최초 질문과 멘토 답변 1회만 포함됩니다. 더 필요한 내용은 새 쪽지상담을 다시 신청해주세요.',
        actionLabel: '재상담하기',
        actionHref: reapplyHref,
      };
    }

    return {
      title: '현재 상담은 질문 1회로 진행됩니다.',
      description:
        '멘토 답변이 도착하면 같은 상담방에서 추가 질문을 이어갈 수 없습니다. 더 필요한 내용은 재상담하기로 다시 신청해주세요.',
    };
  }, [isMentorChannel, menteeHasMentorReply, selectedRequest]);

  useEffect(() => {
    setMessageDraft('');
    setMessageContents([]);
    setIsEditingSelectedReply(false);
  }, [selectedRequestId]);

  useEffect(() => {
    if (isMentorChannel && !canEditSelectedReply && isEditingSelectedReply) {
      setIsEditingSelectedReply(false);
      setMessageContents([]);
    }
  }, [canEditSelectedReply, isEditingSelectedReply, isMentorChannel]);

  const resolveMentorId = () => {
    return mentorIdOverride ?? selectedRequest?.mentorId ?? 0;
  };

  const handleStartEditingSelectedReply = () => {
    if (!latestMentorReply) {
      showToast('수정할 기존 답변을 찾지 못했습니다.', 'error');

      return;
    }

    setIsEditingSelectedReply(true);
    setMessageContents(createEditableMessageContents(latestMentorReply));
  };

  const handleCancelEditingSelectedReply = () => {
    setIsEditingSelectedReply(false);
    setMessageContents([]);
  };

  const handleAcceptSelectedRequest = async () => {
    if (!selectedRequest) {
      return;
    }

    try {
      await acceptRequestMutation.mutateAsync({
        mentorId: resolveMentorId(),
        requestId: selectedRequest.id,
      });
      patchNoteConsultationRequestCache({
        queryClient,
        requestId: selectedRequest.id,
        patch: {
          status: 'ACCEPTED',
          acceptedAt: new Date().toISOString(),
        },
      });
      await selectedRequestDetailQuery.refetch();
      showToast('쪽지상담을 수락했습니다.', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : '상담 수락에 실패했습니다.',
        'error',
      );
    }
  };

  const handleCloseSelectedRequest = async () => {
    const requestId = selectedRequest?.id;
    if (!requestId) {
      return;
    }

    try {
      await closeRequestMutation.mutateAsync({
        mentorId: resolveMentorId(),
        requestId,
        note: '멘토가 상담 종료 처리했습니다.',
      });
      patchNoteConsultationRequestCache({
        queryClient,
        requestId,
        patch: {
          status: 'CLOSED',
          closedAt: new Date().toISOString(),
          closeNote: '멘토가 상담 종료 처리했습니다.',
        },
      });
      await selectedRequestDetailQuery.refetch();
      setMessageDraft('');
      setMessageContents([]);
      setIsEditingSelectedReply(false);
      showToast('쪽지상담을 종료했습니다.', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : '상담 종료에 실패했습니다.',
        'error',
      );
    }
  };

  const handleSendSelectedMessage = async () => {
    if (!selectedRequest || !isMentorChannel) {
      return;
    }

    if (!canSubmitSelectedMessage) {
      showToast('답변 내용을 입력해주세요.', 'error');

      return;
    }

    const content = structuredMessageContent;

    try {
      if (selectedRequest.status === 'PENDING') {
        await acceptRequestMutation.mutateAsync({
          mentorId: resolveMentorId(),
          requestId: selectedRequest.id,
        });
        patchNoteConsultationRequestCache({
          queryClient,
          requestId: selectedRequest.id,
          patch: {
            status: 'ACCEPTED',
            acceptedAt: new Date().toISOString(),
          },
        });
      }

      const result = await sendMessageMutation.mutateAsync({
        mentorId: resolveMentorId(),
        requestId: selectedRequest.id,
        messageId: isEditingSelectedReply ? latestMentorReply?.id : undefined,
        content,
        messageContents: sanitizedMessageContents,
        attachmentFileKeys: structuredAttachmentFileKeys,
        attachedFileNames: structuredAttachedFileNames,
        referenceLinks: structuredReferenceLinks,
      });

      upsertNoteConsultationMessageCache({
        queryClient,
        requestId: selectedRequest.id,
        message:
          result.message ??
          ({
            id: result.messageId,
            sender: 'MENTOR',
            content,
            messageContents: sanitizedMessageContents,
            attachedFileNames: structuredAttachedFileNames,
            referenceLinks: structuredReferenceLinks,
            createdAt: result.lastMessageCreatedAt,
            updatedAt: result.updatedAt,
          } satisfies MentoringConversationMessage),
      });
      await selectedRequestDetailQuery.refetch();
      setMessageDraft('');
      setMessageContents([]);
      setIsEditingSelectedReply(false);
      showToast('답변을 전송했습니다.', 'success');
    } catch (error) {
      const conflictStatusCode =
        error instanceof NoteConsultationContractError &&
        isApiError(error.causeData)
          ? error.causeData.statusCode
          : isApiError(error)
            ? error.statusCode
            : undefined;

      if (conflictStatusCode === NOTE_CONSULTATION_POLICY_CONFLICT_STATUS) {
        await selectedRequestDetailQuery.refetch();
      }

      showToast(
        error instanceof Error ? error.message : '메시지 전송에 실패했습니다.',
        'error',
      );
    }
  };

  return {
    state: {
      isMentorChannel,
      isEditingSelectedReply,
      messageDraft,
      messageContents,
    },
    viewModel: {
      effectiveSelectedItem,
      selectedRequest,
      canAcceptSelectedRequest,
      canCloseSelectedRequest,
      canSendSelectedMessage,
      canEditSelectedReply,
      canSubmitSelectedMessage,
      isAcceptingRequest: acceptRequestMutation.isPending,
      isClosingRequest: closeRequestMutation.isPending,
      isSendingMessage: sendMessageMutation.isPending,
      useRichMessageComposer: isMentorChannel,
      messageDraftMetaLabel,
      messagePlaceholder,
      sendButtonLabel,
      paidFollowupNotice,
    },
    actions: {
      setMessageDraft,
      setMessageContents,
      onAcceptSelectedRequest: (): void => void handleAcceptSelectedRequest(),
      onCloseSelectedRequest: (): void => void handleCloseSelectedRequest(),
      onStartEditingSelectedReply:
        (): void => void handleStartEditingSelectedReply(),
      onCancelEditingSelectedReply:
        (): void => void handleCancelEditingSelectedReply(),
      onSendSelectedMessage: (): void => void handleSendSelectedMessage(),
    },
  };
};
