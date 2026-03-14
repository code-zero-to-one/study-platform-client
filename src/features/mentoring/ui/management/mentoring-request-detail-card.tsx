'use client';

import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/common/ui/button';
import BorderedTextarea from '@/components/common/ui/input/bordered-textarea';
import KeyValueRow from '@/components/common/ui/key-value-row';
import SurfacePanel from '@/components/common/ui/surface-panel';
import { getDefaultMentoringPlaceNote } from '@/features/mentoring/model/mentoring-channel-guide';
import {
  formatWon,
  getMethodLabel,
} from '@/features/mentoring/model/mentor-profile-utils';
import { useMentoringSessionCancelController } from '@/features/mentoring/model/use-mentoring-session-cancel-controller';
import {
  getMentoringMethodFlowMeta,
  getMentoringMentorRequestChecklist,
  MENTORING_MENTOR_RESPONSE_EXPECTATION_GUIDE,
} from '@/features/mentoring/model/mentoring-flow-policy';
import {
  MENTORING_NOTE_LABEL,
  MENTORING_SESSION_GUIDE_LABEL,
} from '@/features/mentoring/model/my-mentoring-display-meta';
import { useMentorWorkspaceQuery } from '@/features/mentoring/model/use-mentor-workspace-query';
import {
  useAcceptMentoringRequestMutation,
  useRejectMentoringRequestMutation,
} from '@/features/mentoring/model/use-mentoring-lifecycle-mutations';
import { useMentoringRequestDetailQuery } from '@/features/mentoring/model/use-mentoring-request-detail-query';
import RequestContentViewer from '@/features/mentoring/ui/apply/request-content-viewer';
import MentoringSessionCancelPanel from '@/features/mentoring/ui/common/mentoring-session-cancel-panel';
import { useToastStore } from '@/stores/use-toast-store';
import type { MentoringMethodType } from '@/types/mentoring/domain';
import type {
  MentoringRequest,
  MentoringSession,
} from '@/types/mentoring/management-domain';
import type { MentoringRequestDetailCardProps } from '@/types/mentoring/management-view';
import ScheduleEditorModal, {
  type ScheduleEditorSubmitPayload,
} from './schedule-editor-modal';

const REJECT_PRESETS = [
  '해당 일자에 이미 다른 일정이 있습니다.',
  '현재 신규 신청을 받고 있지 않습니다.',
  '요청하신 분야가 제 전문 영역 밖입니다.',
  '신청하신 상담 방식을 현재 제공하지 않습니다.',
] as const;

const getPreferredScheduleLabel = (request: MentoringRequest) => {
  if (request.method === 'note') {
    return `수락이 완료되면 서비스 내 ${MENTORING_NOTE_LABEL}에서 첫 답변을 남길 수 있습니다.`;
  }

  if (!request.preferredDate) {
    return '희망 일정이 아직 없습니다.';
  }

  if (!request.preferredTime) {
    return dayjs(request.preferredDate).format('YYYY.MM.DD');
  }

  return `${dayjs(request.preferredDate).format('YYYY.MM.DD')} ${request.preferredTime}`;
};

const getRequestWindowLabel = (request: MentoringRequest) => {
  return request.method === 'note' ? '상담 시작' : '희망 일정';
};

const getChannelGuideLabel = (_method: MentoringMethodType) => {
  return MENTORING_SESSION_GUIDE_LABEL;
};

const isNonPaymentChecklistItem = (item: string) => {
  return !/(결제|입금)/.test(item);
};

export default function MentoringRequestDetailCard({
  request,
  mentorId,
  methodDurations,
}: MentoringRequestDetailCardProps) {
  const { showToast } = useToastStore();
  const requestDetailQuery = useMentoringRequestDetailQuery(request.id, true);
  const workspaceQuery = useMentorWorkspaceQuery({
    mentorId,
    enabled: true,
  });
  const acceptRequestMutation = useAcceptMentoringRequestMutation();
  const rejectRequestMutation = useRejectMentoringRequestMutation();

  const currentRequest = requestDetailQuery.data?.request ?? request;
  const sessions = workspaceQuery.data?.allSessions ?? [];
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isPending = currentRequest.status === 'PENDING';
  const currentSession = useMemo<MentoringSession | undefined>(() => {
    if (requestDetailQuery.data?.session) {
      return requestDetailQuery.data.session;
    }

    if (!currentRequest.linkedSessionId) {
      return undefined;
    }

    return sessions.find((session) => session.id === currentRequest.linkedSessionId);
  }, [currentRequest.linkedSessionId, requestDetailQuery.data?.session, sessions]);
  const canCancelReservation =
    currentRequest.method !== 'note' && currentSession?.status === 'SCHEDULED';
  const cancelController = useMentoringSessionCancelController({
    actor: 'mentor',
    mentorId,
    requestId: currentRequest.id,
    sessionId: canCancelReservation ? currentSession?.id : undefined,
  });
  const isSubmitting =
    acceptRequestMutation.isPending || rejectRequestMutation.isPending;
  const paymentAmountLabel =
    typeof currentRequest.paymentAmount === 'number'
      ? formatWon(currentRequest.paymentAmount)
      : undefined;
  const flowMeta = getMentoringMethodFlowMeta(currentRequest.method);
  const mentorChecklist = useMemo(() => {
    return getMentoringMentorRequestChecklist({
      method: currentRequest.method,
      paymentStatus: currentRequest.paymentStatus,
    }).filter(isNonPaymentChecklistItem);
  }, [currentRequest.method, currentRequest.paymentStatus]);

  useEffect(() => {
    setIsRejecting(false);
    setRejectReason('');
    setScheduleError('');
  }, [currentRequest.id]);

  const handleAcceptNote = async () => {
    try {
      await acceptRequestMutation.mutateAsync({
        mentorId,
        requestId: currentRequest.id,
      });
      showToast('신청을 수락했습니다.', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : '신청 수락에 실패했습니다.',
        'error',
      );
    }
  };

  const handleScheduleConfirm = async (payload: ScheduleEditorSubmitPayload) => {
    try {
      await acceptRequestMutation.mutateAsync({
        mentorId,
        requestId: currentRequest.id,
        schedule: {
          startsAt: payload.startsAt,
          endsAt: payload.endsAt,
          placeNote: payload.placeNote,
        },
        mentorNote: payload.mentorNote,
      });
      setScheduleError('');
      setScheduleModalOpen(false);
      showToast('일정을 확정하고 신청을 수락했습니다.', 'success');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '일정 확정에 실패했습니다.';
      setScheduleError(message);
      showToast(message, 'error');
    }
  };

  const handleReject = async () => {
    const reason = rejectReason.trim();
    if (reason.length === 0) {
      showToast('거절 사유를 입력해주세요.', 'error');

      return;
    }

    try {
      await rejectRequestMutation.mutateAsync({
        mentorId,
        requestId: currentRequest.id,
        reason,
      });
      setIsRejecting(false);
      setRejectReason('');
      showToast('신청을 거절했습니다.', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : '신청 거절에 실패했습니다.',
        'error',
      );
    }
  };

  return (
    <>
      <SurfacePanel radius="lg" overflow="hidden" className="shadow-sm">
        <div className="px-300 py-300">
          <section className="mb-300">
            <h3 className="mb-150 font-designer-16b text-text-default">
              멘토링 신청 정보
            </h3>
            <div className="border-border-subtle divide-border-subtle rounded-150 divide-y border">
              <KeyValueRow
                label="상담 방식"
                className="py-150"
                columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                labelClassName="font-designer-14m"
              >
                {currentRequest.durationLabel
                  ? `${currentRequest.methodLabel ?? getMethodLabel(currentRequest.method)} · ${currentRequest.durationLabel}`
                  : (currentRequest.methodLabel ??
                    getMethodLabel(currentRequest.method))}
              </KeyValueRow>
              <KeyValueRow
                label="멘티 닉네임"
                className="py-150"
                columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                labelClassName="font-designer-14m"
              >
                {currentRequest.menteeName}
              </KeyValueRow>
              <KeyValueRow
                label="역할"
                className="py-150"
                columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                labelClassName="font-designer-14m"
              >
                {currentRequest.menteeRole || '멘티'}
              </KeyValueRow>
              <KeyValueRow
                label="신청일"
                className="py-150"
                columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                labelClassName="font-designer-14m"
              >
                {dayjs(currentRequest.requestedAt).format('YYYY.MM.DD HH:mm')}
              </KeyValueRow>
              <KeyValueRow
                label={getRequestWindowLabel(currentRequest)}
                className="py-150"
                columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                labelClassName="font-designer-14m"
              >
                {getPreferredScheduleLabel(currentRequest)}
              </KeyValueRow>
              <KeyValueRow
                label={getChannelGuideLabel(currentRequest.method)}
                className="py-150"
                columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                labelClassName="font-designer-14m"
              >
                {flowMeta.channelGuide}
              </KeyValueRow>
              {isPending ? (
                <KeyValueRow
                  label="지금 필요한 처리"
                  className="py-150"
                  columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                  labelClassName="font-designer-14m"
                >
                  {flowMeta.mentorAction}
                </KeyValueRow>
              ) : null}
              {paymentAmountLabel ? (
                <KeyValueRow
                  label="예상 상담 금액"
                  className="py-150"
                  columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                  labelClassName="font-designer-14m"
                >
                  {paymentAmountLabel}
                </KeyValueRow>
              ) : null}
            </div>
          </section>

          <section className="mb-300">
            <h3 className="mb-150 font-designer-16b text-text-default">
              멘티가 전달한 내용
            </h3>
            <RequestContentViewer
              requestMessage={currentRequest.requestMessage}
              requestContents={currentRequest.requestContents}
            />
          </section>

          <section className="mb-300">
            <h3 className="mb-150 font-designer-16b text-text-default">
              처리 포인트
            </h3>
            <div className="rounded-150 border-border-subtle bg-background-alternative space-y-100 border p-150">
              <div className="space-y-50">
                {flowMeta.steps.map((step, index) => (
                  <div key={step} className="flex items-start gap-75">
                    <span className="bg-fill-brand-subtle-default inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full font-designer-12b text-text-brand">
                      {index + 1}
                    </span>
                    <p className="leading-relaxed font-designer-13r text-text-subtle">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-100 bg-background-default px-125 py-100">
                <p className="font-designer-13m text-text-default">
                  {flowMeta.mentorAction}
                </p>
                <p className="mt-25 font-designer-12r text-text-subtle">
                  {flowMeta.channelGuide}
                </p>
                <p className="mt-25 font-designer-12r text-text-subtle">
                  {flowMeta.issueGuide}
                </p>
              </div>
            </div>
          </section>

          <section className="mb-300">
            <h3 className="mb-150 font-designer-16b text-text-default">
              검토 체크리스트
            </h3>
            <div className="rounded-150 border-border-subtle bg-background-alternative space-y-100 border p-150">
              {mentorChecklist.map((item, index) => (
                <div key={item} className="flex items-start gap-75">
                  <span className="bg-fill-brand-subtle-default inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full font-designer-12b text-text-brand">
                    {index + 1}
                  </span>
                  <p className="leading-relaxed font-designer-13r text-text-subtle">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {!isPending && currentRequest.decisionNote ? (
            <section className="mb-300">
              <h3 className="mb-150 font-designer-16b text-text-default">
                처리 메모
              </h3>
              <p className="rounded-100 bg-background-alternative px-150 py-125 font-designer-14r text-text-subtle">
                {currentRequest.decisionNote}
              </p>
            </section>
          ) : null}

          {!isPending &&
          canCancelReservation &&
          cancelController.viewModel.canCancel ? (
            <section className="mb-300">
              <MentoringSessionCancelPanel
                title={cancelController.viewModel.title}
                description={cancelController.viewModel.description}
                textareaLabel={cancelController.viewModel.textareaLabel}
                textareaPlaceholder={cancelController.viewModel.textareaPlaceholder}
                triggerLabel={cancelController.viewModel.triggerLabel}
                confirmLabel={cancelController.viewModel.confirmLabel}
                isOpen={cancelController.state.isCancelFormOpen}
                isSubmitting={cancelController.viewModel.isSubmitting}
                cancelReason={cancelController.state.cancelReason}
                onOpen={cancelController.actions.openCancelForm}
                onClose={cancelController.actions.closeCancelForm}
                onReasonChange={cancelController.actions.onCancelReasonChange}
                onConfirm={cancelController.actions.onConfirmCancel}
              />
            </section>
          ) : null}

          {isPending ? (
            <section>
              {!isRejecting ? (
                <div className="flex gap-100">
                  <Button
                    type="button"
                    size="medium"
                    color="outlined"
                    className="flex-1"
                    disabled={isSubmitting}
                    onClick={() => setIsRejecting(true)}
                  >
                    거절
                  </Button>
                  {currentRequest.method === 'note' ? (
                    <Button
                      type="button"
                      size="medium"
                      color="primary"
                      className="flex-1"
                      disabled={isSubmitting}
                      onClick={handleAcceptNote}
                    >
                      수락
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="medium"
                      color="primary"
                      className="flex-1"
                      disabled={isSubmitting}
                      onClick={() => {
                        setScheduleModalOpen(true);
                        setScheduleError('');
                      }}
                    >
                      수락
                    </Button>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="mb-150 font-designer-16b text-text-default">
                    거절 사유
                  </h3>
                  <div className="mb-150 flex flex-wrap gap-75">
                    {REJECT_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setRejectReason(preset)}
                        className={`rounded-100 border px-125 py-75 transition-colors font-designer-13m ${
                          rejectReason === preset
                            ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
                            : 'border-border-default text-text-subtle hover:border-border-brand hover:text-text-brand'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <BorderedTextarea
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                    className="rounded-150 border-border-subtle mb-150 min-h-[100px] resize-none py-125"
                    placeholder="직접 입력하거나 위에서 선택하세요."
                  />
                  <div className="flex justify-end gap-100">
                    <Button
                      type="button"
                      size="medium"
                      color="secondary"
                      disabled={isSubmitting}
                      onClick={() => setIsRejecting(false)}
                    >
                      취소
                    </Button>
                    <Button
                      type="button"
                      size="medium"
                      color="outlined"
                      disabled={isSubmitting}
                      onClick={handleReject}
                    >
                      거절 확정
                    </Button>
                  </div>
                </div>
              )}
            </section>
          ) : null}
        </div>

        {isPending ? (
          <div className="border-border-subtle bg-background-alternative border-t px-300 py-150 text-center">
            <p className="font-designer-13r text-text-subtlest">
              {MENTORING_MENTOR_RESPONSE_EXPECTATION_GUIDE}
            </p>
            <p className="mt-50 font-designer-12r text-text-subtlest">
              {flowMeta.mentorAction}
            </p>
          </div>
        ) : null}
      </SurfacePanel>

      <ScheduleEditorModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        title="상담 일정 확정"
        description="멘티와 확정할 날짜/시간과 진행 방식을 입력하세요."
        confirmLabel="일정 확정 후 수락"
        durationMinutes={methodDurations[currentRequest.method]}
        method={currentRequest.method}
        defaultDate={currentRequest.preferredDate}
        defaultTime={currentRequest.preferredTime}
        defaultPlaceNote={getDefaultMentoringPlaceNote(currentRequest.method)}
        errorMessage={scheduleError}
        sessions={sessions}
        onConfirm={handleScheduleConfirm}
      />
    </>
  );
}
