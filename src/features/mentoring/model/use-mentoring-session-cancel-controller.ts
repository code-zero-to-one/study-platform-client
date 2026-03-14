'use client';

import { useMemo, useState } from 'react';
import { useToastStore } from '@/stores/use-toast-store';
import { useCancelMentoringSessionMutation } from './use-mentoring-lifecycle-mutations';

type CancelActor = 'mentee' | 'mentor';

interface UseMentoringSessionCancelControllerParams {
  sessionId?: string;
  requestId?: string;
  actor: CancelActor;
  mentorId?: number;
}

export interface MentoringSessionCancelControllerState {
  cancelReason: string;
  isCancelFormOpen: boolean;
}

export interface MentoringSessionCancelControllerActions {
  openCancelForm: () => void;
  closeCancelForm: () => void;
  onCancelReasonChange: (nextValue: string) => void;
  onConfirmCancel: () => Promise<void>;
}

export interface MentoringSessionCancelControllerViewModel {
  canCancel: boolean;
  isSubmitting: boolean;
  title: string;
  description: string;
  textareaLabel: string;
  textareaPlaceholder: string;
  triggerLabel: string;
  confirmLabel: string;
}

export interface MentoringSessionCancelControllerResult {
  state: MentoringSessionCancelControllerState;
  actions: MentoringSessionCancelControllerActions;
  viewModel: MentoringSessionCancelControllerViewModel;
}

const COPY_MAP: Record<
  CancelActor,
  Omit<MentoringSessionCancelControllerViewModel, 'canCancel' | 'isSubmitting'>
> = {
  mentee: {
    title: '예약상담 취소',
    description:
      '확정된 예약상담만 취소할 수 있습니다. 취소 사유를 남기면 멘토와 운영 기록에 함께 반영됩니다.',
    textareaLabel: '취소 사유',
    textareaPlaceholder: '예) 개인 일정 변경으로 해당 시간 참여가 어렵습니다.',
    triggerLabel: '예약 취소',
    confirmLabel: '예약 취소 확정',
  },
  mentor: {
    title: '일정 취소',
    description:
      '확정된 예약상담만 취소할 수 있습니다. 멘티가 다음 행동을 판단할 수 있게 사유를 남겨주세요.',
    textareaLabel: '취소 사유',
    textareaPlaceholder: '예) 멘토 개인 사정으로 해당 시간 진행이 어렵습니다.',
    triggerLabel: '일정 취소',
    confirmLabel: '일정 취소 확정',
  },
};

export const useMentoringSessionCancelController = ({
  sessionId,
  requestId,
  actor,
  mentorId,
}: UseMentoringSessionCancelControllerParams): MentoringSessionCancelControllerResult => {
  const { showToast } = useToastStore();
  const cancelSessionMutation = useCancelMentoringSessionMutation();
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelFormOpen, setIsCancelFormOpen] = useState(false);

  const copy = COPY_MAP[actor];
  const canCancel = typeof sessionId === 'string' && sessionId.trim().length > 0;

  const handleClose = () => {
    setIsCancelFormOpen(false);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    const normalizedReason = cancelReason.trim();

    if (!canCancel) {
      showToast('취소 가능한 예약 정보를 찾지 못했습니다.', 'error');

      return;
    }

    if (normalizedReason.length === 0) {
      showToast('취소 사유를 입력해주세요.', 'error');

      return;
    }

    try {
      await cancelSessionMutation.mutateAsync({
        mentorId,
        requestId,
        sessionId,
        reason: normalizedReason,
        issueType:
          actor === 'mentee' ? 'MENTEE_CANCELLED' : 'MENTOR_CANCELLED',
      });
      handleClose();
      showToast(
        actor === 'mentee'
          ? '예약을 취소했습니다.'
          : '일정을 취소했습니다.',
        'success',
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : actor === 'mentee'
            ? '예약 취소에 실패했습니다.'
            : '일정 취소에 실패했습니다.',
        'error',
      );
    }
  };

  return {
    state: {
      cancelReason,
      isCancelFormOpen,
    },
    actions: {
      openCancelForm: () => setIsCancelFormOpen(true),
      closeCancelForm: handleClose,
      onCancelReasonChange: setCancelReason,
      onConfirmCancel: handleConfirmCancel,
    },
    viewModel: useMemo(
      () => ({
        canCancel,
        isSubmitting: cancelSessionMutation.isPending,
        title: copy.title,
        description: copy.description,
        textareaLabel: copy.textareaLabel,
        textareaPlaceholder: copy.textareaPlaceholder,
        triggerLabel: copy.triggerLabel,
        confirmLabel: copy.confirmLabel,
      }),
      [canCancel, cancelSessionMutation.isPending, copy],
    ),
  };
};
