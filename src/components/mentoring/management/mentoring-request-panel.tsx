'use client';

import dayjs from 'dayjs';
import { Clock3, MessageCircleMore, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { BaseInput } from '@/components/ui/input';
import {
  getMethodLabel,
  type MentoringMethodType,
} from '@/mocks/mentoring-mock-data';
import { useToastStore } from '@/stores/use-toast-store';
import {
  type MentoringPaymentMode,
  type MentoringPaymentStatus,
  type MentoringRequest,
  useMentoringManagementStore,
} from '@/stores/useMentoringManagementStore';
import ScheduleEditorModal, {
  type ScheduleEditorSubmitPayload,
} from './schedule-editor-modal';

interface MentoringRequestPanelProps {
  mentorId: number;
  methodDurations: Record<MentoringMethodType, number>;
}

const statusLabelMap = {
  PENDING: '대기중',
  ACCEPTED: '수락됨',
  REJECTED: '거절됨',
} as const;

const statusColorMap = {
  PENDING: 'orange',
  ACCEPTED: 'green',
  REJECTED: 'red',
} as const;

const senderLabelMap = {
  MENTEE: '멘티',
  MENTOR: '멘토',
  SYSTEM: '시스템',
} as const;

const paymentModeLabelMap: Record<MentoringPaymentMode, string> = {
  MANUAL_TRANSFER: '수동결제',
  FREE_REQUEST: '결제없음',
};

const paymentStatusLabelMap: Record<MentoringPaymentStatus, string> = {
  PENDING_TRANSFER: '입금 대기',
  NOT_REQUIRED: '결제 불필요',
  CONFIRMED: '입금 확인',
};

const paymentStatusColorMap: Record<
  MentoringPaymentStatus,
  'orange' | 'blue' | 'green'
> = {
  PENDING_TRANSFER: 'orange',
  NOT_REQUIRED: 'blue',
  CONFIRMED: 'green',
};

const defaultPlaceByMethod: Record<MentoringMethodType, string> = {
  note: '서비스 내 쪽지로 진행',
  phone: '전화 연결 예정',
  online: '화상 링크 전달 예정',
  offline: '만남 장소 전달 예정',
};

const getPreferredScheduleLabel = (request: MentoringRequest) => {
  if (!request.preferredDate) {
    return '희망 일정: 멘티와 조율 필요';
  }
  if (!request.preferredTime) {
    return `희망 일정: ${request.preferredDate}`;
  }

  return `희망 일정: ${request.preferredDate} ${request.preferredTime}`;
};

export default function MentoringRequestPanel({
  mentorId,
  methodDurations,
}: MentoringRequestPanelProps) {
  const { showToast } = useToastStore();
  const requests = useMentoringManagementStore(
    (state) => state.requestsByMentor[mentorId] ?? [],
  );
  const acceptRequest = useMentoringManagementStore(
    (state) => state.acceptRequest,
  );
  const rejectRequest = useMentoringManagementStore(
    (state) => state.rejectRequest,
  );
  const sendMentorMessage = useMentoringManagementStore(
    (state) => state.sendMentorMessage,
  );
  const confirmManualPayment = useMentoringManagementStore(
    (state) => state.confirmManualPayment,
  );

  const [scheduleTargetId, setScheduleTargetId] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState('');
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(
    null,
  );
  const [rejectReasonByRequest, setRejectReasonByRequest] = useState<
    Record<string, string>
  >({});
  const [messageDraftByRequest, setMessageDraftByRequest] = useState<
    Record<string, string>
  >({});

  const pendingCount = useMemo(() => {
    return requests.filter((request) => request.status === 'PENDING').length;
  }, [requests]);
  const scheduleTarget = useMemo(() => {
    if (!scheduleTargetId) {
      return undefined;
    }

    return requests.find((request) => request.id === scheduleTargetId);
  }, [requests, scheduleTargetId]);

  const handleAcceptNote = (request: MentoringRequest) => {
    const result = acceptRequest({
      mentorId,
      requestId: request.id,
    });

    if (!result.ok) {
      showToast(result.reason ?? '신청 수락에 실패했습니다.', 'error');

      return;
    }

    showToast('신청을 수락했습니다.', 'success');
  };

  const handleScheduleConfirm = (payload: ScheduleEditorSubmitPayload) => {
    if (!scheduleTarget) {
      return;
    }

    const result = acceptRequest({
      mentorId,
      requestId: scheduleTarget.id,
      schedule: {
        startsAt: payload.startsAt,
        endsAt: payload.endsAt,
        placeNote: payload.placeNote,
      },
      mentorNote: payload.mentorNote,
    });

    if (!result.ok) {
      const reason = result.reason ?? '일정 확정에 실패했습니다.';
      setScheduleError(reason);
      showToast(reason, 'error');

      return;
    }

    setScheduleError('');
    setScheduleTargetId(null);
    showToast('일정을 확정하고 신청을 수락했습니다.', 'success');
  };

  const handleReject = (requestId: string) => {
    const reason = rejectReasonByRequest[requestId] ?? '';
    const result = rejectRequest({
      mentorId,
      requestId,
      reason,
    });

    if (!result.ok) {
      showToast(result.reason ?? '신청 거절에 실패했습니다.', 'error');

      return;
    }

    setRejectingRequestId(null);
    setRejectReasonByRequest((prev) => ({
      ...prev,
      [requestId]: '',
    }));
    showToast('신청을 거절했습니다.', 'success');
  };

  const handleSendMessage = (requestId: string) => {
    const message = messageDraftByRequest[requestId] ?? '';
    const result = sendMentorMessage({
      mentorId,
      requestId,
      content: message,
    });

    if (!result.ok) {
      showToast(result.reason ?? '메시지 전송에 실패했습니다.', 'error');

      return;
    }

    setMessageDraftByRequest((prev) => ({
      ...prev,
      [requestId]: '',
    }));
    showToast('멘티에게 메시지를 보냈습니다.', 'success');
  };

  const handleConfirmPayment = (requestId: string) => {
    const result = confirmManualPayment({
      mentorId,
      requestId,
      memo: '입금 확인 완료',
    });

    if (!result.ok) {
      showToast(result.reason ?? '입금 확인 처리에 실패했습니다.', 'error');

      return;
    }

    showToast('입금 확인이 완료되었습니다.', 'success');
  };

  return (
    <>
      <section className="rounded-200 border-border-subtle bg-background-default border p-300">
        <header className="mb-200 flex flex-wrap items-center justify-between gap-100">
          <div>
            <h3 className="font-designer-20b text-text-default">신청함</h3>
            <p className="font-designer-14r text-text-subtle mt-50">
              신청을 수락/거절하고, 멘티와 일정 조율 메시지를 바로 남길 수
              있어요.
            </p>
          </div>
          <Badge color={pendingCount > 0 ? 'orange' : 'green'} shape="round">
            대기 {pendingCount}건
          </Badge>
        </header>

        {requests.length === 0 ? (
          <div className="rounded-150 bg-background-alternative px-200 py-250 text-center">
            <p className="font-designer-16b text-text-default">
              신청 내역이 없습니다.
            </p>
            <p className="font-designer-13r text-text-subtle mt-50">
              새 신청이 들어오면 이곳에서 바로 처리할 수 있어요.
            </p>
          </div>
        ) : (
          <div className="space-y-150">
            {requests.map((request) => {
              const isPending = request.status === 'PENDING';
              const rejectReason = rejectReasonByRequest[request.id] ?? '';
              const messageDraft = messageDraftByRequest[request.id] ?? '';
              const previewMessages = request.conversation.slice(-3);

              return (
                <article
                  key={request.id}
                  className="rounded-150 border-border-subtle border p-200"
                >
                  <div className="mb-125 flex flex-wrap items-center justify-between gap-100">
                    <div className="flex items-center gap-75">
                      <UserRound className="text-text-subtle h-16 w-16" />
                      <p className="font-designer-16b text-text-default">
                        {request.menteeName}
                      </p>
                      <span className="font-designer-13r text-text-subtle">
                        {request.menteeRole}
                      </span>
                    </div>
                    <div className="flex items-center gap-75">
                      <Badge color="blue" shape="round">
                        {getMethodLabel(request.method)}
                      </Badge>
                      <Badge
                        color={statusColorMap[request.status]}
                        shape="round"
                      >
                        {statusLabelMap[request.status]}
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-125 flex flex-wrap items-center gap-125">
                    <p className="font-designer-13r text-text-subtle inline-flex items-center gap-50">
                      <Clock3 className="h-14 w-14" />
                      신청 {dayjs(request.requestedAt).format('MM.DD HH:mm')}
                    </p>
                    <p className="font-designer-13r text-text-subtle">
                      {getPreferredScheduleLabel(request)}
                    </p>
                    <Badge color="gray" shape="round">
                      {paymentModeLabelMap[request.paymentMode]}
                    </Badge>
                    <Badge
                      color={paymentStatusColorMap[request.paymentStatus]}
                      shape="round"
                    >
                      {paymentStatusLabelMap[request.paymentStatus]}
                    </Badge>
                  </div>

                  <p className="font-designer-14r text-text-default rounded-100 bg-background-alternative mb-125 px-125 py-100">
                    {request.requestMessage}
                  </p>

                  {request.paymentMemo && (
                    <p className="font-designer-13r text-text-subtle mb-125">
                      결제 메모: {request.paymentMemo}
                    </p>
                  )}

                  <div className="mb-125 space-y-75">
                    {previewMessages.map((message) => (
                      <div
                        key={message.id}
                        className="rounded-100 border-border-subtle border px-100 py-75"
                      >
                        <p className="font-designer-12m text-text-subtle mb-25">
                          {senderLabelMap[message.sender]} ·{' '}
                          {dayjs(message.createdAt).format('MM.DD HH:mm')}
                        </p>
                        <p className="font-designer-13r text-text-default">
                          {message.content}
                        </p>
                      </div>
                    ))}
                  </div>

                  {isPending && (
                    <div className="mb-125 flex flex-wrap gap-100">
                      {request.method === 'note' ? (
                        <Button
                          type="button"
                          size="small"
                          color="primary"
                          onClick={() => handleAcceptNote(request)}
                        >
                          수락
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="small"
                          color="primary"
                          onClick={() => {
                            setScheduleTargetId(request.id);
                            setScheduleError('');
                          }}
                        >
                          수락 후 일정 확정
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="small"
                        color="outlined"
                        onClick={() => setRejectingRequestId(request.id)}
                      >
                        거절
                      </Button>
                    </div>
                  )}

                  {isPending && rejectingRequestId === request.id && (
                    <div className="rounded-100 bg-background-alternative mb-125 p-125">
                      <p className="font-designer-13b text-text-default mb-75">
                        거절 사유
                      </p>
                      <textarea
                        value={rejectReason}
                        onChange={(event) =>
                          setRejectReasonByRequest((prev) => ({
                            ...prev,
                            [request.id]: event.target.value,
                          }))
                        }
                        className="font-designer-13r rounded-100 border-border-subtle bg-background-default text-text-default min-h-[92px] w-full border px-125 py-100"
                        placeholder="멘티가 다음 행동을 정할 수 있도록 이유를 구체적으로 남겨주세요."
                      />
                      <div className="mt-100 flex flex-wrap justify-end gap-75">
                        <Button
                          type="button"
                          size="xsmall"
                          color="secondary"
                          onClick={() => setRejectingRequestId(null)}
                        >
                          취소
                        </Button>
                        <Button
                          type="button"
                          size="xsmall"
                          color="outlined"
                          onClick={() => handleReject(request.id)}
                        >
                          거절 확정
                        </Button>
                      </div>
                    </div>
                  )}

                  {request.status !== 'PENDING' && request.decisionNote && (
                    <p className="font-designer-13r text-text-subtle mb-125">
                      처리 메모: {request.decisionNote}
                    </p>
                  )}

                  {request.paymentMode === 'MANUAL_TRANSFER' &&
                    request.paymentStatus === 'PENDING_TRANSFER' && (
                      <div className="mb-125">
                        <Button
                          type="button"
                          size="xsmall"
                          color="secondary"
                          onClick={() => handleConfirmPayment(request.id)}
                        >
                          입금 확인 완료
                        </Button>
                      </div>
                    )}

                  <div className="flex flex-wrap items-center gap-75">
                    <div className="min-w-[220px] flex-1">
                      <BaseInput
                        value={messageDraft}
                        onValueChange={(value) =>
                          setMessageDraftByRequest((prev) => ({
                            ...prev,
                            [request.id]: value,
                          }))
                        }
                        placeholder="멘티에게 보낼 메시지를 입력하세요."
                        size="m"
                      />
                    </div>
                    <Button
                      type="button"
                      size="small"
                      color="secondary"
                      onClick={() => handleSendMessage(request.id)}
                      icon={<MessageCircleMore className="h-14 w-14" />}
                    >
                      메시지 전송
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <ScheduleEditorModal
        open={!!scheduleTarget}
        onOpenChange={(open) => {
          if (!open) {
            setScheduleTargetId(null);
            setScheduleError('');
          }
        }}
        title="상담 일정 확정"
        description="멘티와 확정할 날짜/시간과 진행 방식을 입력하세요."
        confirmLabel="일정 확정 후 수락"
        durationMinutes={
          scheduleTarget ? methodDurations[scheduleTarget.method] : 30
        }
        defaultDate={scheduleTarget?.preferredDate}
        defaultTime={scheduleTarget?.preferredTime}
        defaultPlaceNote={
          scheduleTarget ? defaultPlaceByMethod[scheduleTarget.method] : ''
        }
        errorMessage={scheduleError}
        onConfirm={handleScheduleConfirm}
      />
    </>
  );
}
