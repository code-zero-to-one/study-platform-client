'use client';

import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import BorderedTextarea from '@/components/common/ui/input/bordered-textarea';
import KeyValueRow from '@/components/common/ui/key-value-row';
import SurfacePanel from '@/components/common/ui/surface-panel';
import { MENTORING_PAYMENT_STATUS_META } from '@/features/mentoring/model/management-status-meta';
import {
  formatWon,
  getMethodLabel,
} from '@/features/mentoring/model/mentor-profile-utils';
import {
  getMentoringMethodFlowMeta,
  getMentoringMentorRequestChecklist,
  MENTORING_MENTOR_RESPONSE_EXPECTATION_GUIDE,
} from '@/features/mentoring/model/mentoring-flow-policy';
import {
  MENTORING_NOTE_LABEL,
  MENTORING_SESSION_GUIDE_LABEL,
} from '@/features/mentoring/model/my-mentoring-display-meta';
import RequestContentViewer from '@/features/mentoring/ui/apply/request-content-viewer';
import { useToastStore } from '@/stores/use-toast-store';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import type { MentoringMethodType } from '@/types/mentoring/domain';
import type { MentoringRequest } from '@/types/mentoring/management-domain';
import type { MentoringRequestDetailCardProps } from '@/types/mentoring/management-view';

import ScheduleEditorModal, {
  type ScheduleEditorSubmitPayload,
} from './schedule-editor-modal';

const defaultPlaceByMethod: Record<MentoringMethodType, string> = {
  note: '서비스 내 쪽지로 진행',
  simple: '통화 또는 짧은 온라인 미팅으로 진행',
  deep: '화상 링크 전달 예정',
  offline: '만남 장소 전달 예정',
};

const PAYMENT_METHOD_LABEL_MAP = {
  CARD: '카드 결제',
  VIRTUAL_ACCOUNT: '가상계좌',
  MANUAL_TRANSFER: '수동 계좌이체',
} as const;

const REJECT_PRESETS = [
  '해당 일자에 이미 다른 일정이 있습니다.',
  '현재 신규 신청을 받고 있지 않습니다.',
  '요청하신 분야가 제 전문 영역 밖입니다.',
  '신청하신 상담 방식을 현재 제공하지 않습니다.',
];

const getPreferredScheduleLabel = (request: MentoringRequest) => {
  if (request.method === 'note') {
    return `결제와 수락이 완료되면 서비스 내 ${MENTORING_NOTE_LABEL}으로 바로 이어집니다.`;
  }

  if (!request.preferredDate) {
    return '희망 일정이 아직 없습니다.';
  }

  if (!request.preferredTime) {
    return dayjs(request.preferredDate).format('YYYY.MM.DD');
  }

  return `${dayjs(request.preferredDate).format('YYYY.MM.DD')} ${request.preferredTime}`;
};

const getPaymentMethodLabel = (request: MentoringRequest) => {
  const paymentMethod =
    request.paymentMethod ??
    (request.paymentMode === 'MANUAL_TRANSFER' ? 'MANUAL_TRANSFER' : 'CARD');

  return PAYMENT_METHOD_LABEL_MAP[paymentMethod];
};

const getRequestWindowLabel = (request: MentoringRequest) => {
  if (request.method === 'note') {
    return '상담 시작';
  }

  return '희망 일정';
};

const getChannelGuideLabel = (_method: MentoringMethodType) => {
  return MENTORING_SESSION_GUIDE_LABEL;
};

const getPaymentMemoLabel = (request: MentoringRequest) => {
  if (
    request.paymentMode === 'MANUAL_TRANSFER' &&
    request.paymentStatus === 'PENDING_TRANSFER'
  ) {
    return '멘티 송금 메모';
  }

  if (request.paymentMode === 'MANUAL_TRANSFER') {
    return '입금 확인 메모';
  }

  return '결제 메모';
};

export default function MentoringRequestDetailCard({
  request,
  mentorId,
  methodDurations,
}: MentoringRequestDetailCardProps) {
  const { showToast } = useToastStore();
  const acceptRequest = useMentoringManagementStore(
    (state) => state.acceptRequest,
  );
  const rejectRequest = useMentoringManagementStore(
    (state) => state.rejectRequest,
  );
  const confirmManualPayment = useMentoringManagementStore(
    (state) => state.confirmManualPayment,
  );
  const sessions = useMentoringManagementStore(
    (state) => state.sessionsByMentor[mentorId] ?? [],
  );

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [paymentConfirmMemo, setPaymentConfirmMemo] = useState('');

  const isPending = request.status === 'PENDING';
  const needsPaymentConfirm =
    isPending &&
    request.paymentMode === 'MANUAL_TRANSFER' &&
    request.paymentStatus === 'PENDING_TRANSFER';
  const paymentConfirmed =
    request.paymentMode === 'MANUAL_TRANSFER' &&
    request.paymentStatus === 'CONFIRMED';
  const paymentAmountLabel =
    typeof request.paymentAmount === 'number'
      ? formatWon(request.paymentAmount)
      : '-';
  const flowMeta = getMentoringMethodFlowMeta(request.method);
  const mentorChecklist = getMentoringMentorRequestChecklist({
    method: request.method,
    paymentStatus: request.paymentStatus,
  });

  useEffect(() => {
    setPaymentConfirmMemo('');
    setIsRejecting(false);
    setRejectReason('');
    setScheduleError('');
  }, [request.id]);

  const handleAcceptNote = () => {
    const result = acceptRequest({ mentorId, requestId: request.id });
    if (!result.ok) {
      showToast(result.reason ?? '신청 수락에 실패했습니다.', 'error');

      return;
    }
    showToast('신청을 수락했습니다.', 'success');
  };

  const handleScheduleConfirm = (payload: ScheduleEditorSubmitPayload) => {
    const result = acceptRequest({
      mentorId,
      requestId: request.id,
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
    setScheduleModalOpen(false);
    showToast('일정을 확정하고 신청을 수락했습니다.', 'success');
  };

  const handleReject = () => {
    const reason = rejectReason.trim();
    const result = rejectRequest({ mentorId, requestId: request.id, reason });
    if (!result.ok) {
      showToast(result.reason ?? '신청 거절에 실패했습니다.', 'error');

      return;
    }
    setIsRejecting(false);
    setRejectReason('');
    showToast('신청을 거절했습니다.', 'success');
  };

  const handleConfirmPayment = () => {
    const memo = paymentConfirmMemo.trim() || '입금 확인 완료';
    const result = confirmManualPayment({
      mentorId,
      requestId: request.id,
      memo,
    });
    if (!result.ok) {
      showToast(result.reason ?? '입금 확인 처리에 실패했습니다.', 'error');

      return;
    }
    setPaymentConfirmMemo(memo);
    showToast('입금 확인이 완료되었습니다.', 'success');
  };

  return (
    <>
      <SurfacePanel radius="lg" overflow="hidden" className="shadow-sm">
        {/* 본문 */}
        <div className="px-300 py-300">
          {/* 멘토링 신청 정보 섹션 */}
          <section className="mb-300">
            <h3 className="font-designer-16b text-text-default mb-150">
              멘토링 신청 정보
            </h3>
            <div className="border-border-subtle divide-border-subtle rounded-150 divide-y border">
              <KeyValueRow
                label="상담 방식"
                className="py-150"
                columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                labelClassName="font-designer-14m"
              >
                {request.durationLabel
                  ? `${request.methodLabel ?? getMethodLabel(request.method)} · ${request.durationLabel}`
                  : (request.methodLabel ?? getMethodLabel(request.method))}
              </KeyValueRow>
              <KeyValueRow
                label="멘티 닉네임"
                className="py-150"
                columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                labelClassName="font-designer-14m"
              >
                {request.menteeName}
              </KeyValueRow>
              <KeyValueRow
                label="역할"
                className="py-150"
                columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                labelClassName="font-designer-14m"
              >
                {request.menteeRole || '멘티'}
              </KeyValueRow>
              <KeyValueRow
                label="신청일"
                className="py-150"
                columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                labelClassName="font-designer-14m"
              >
                {dayjs(request.requestedAt).format('YYYY.MM.DD HH:mm')}
              </KeyValueRow>
              <KeyValueRow
                label={getRequestWindowLabel(request)}
                className="py-150"
                columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                labelClassName="font-designer-14m"
              >
                {getPreferredScheduleLabel(request)}
              </KeyValueRow>
              <KeyValueRow
                label={getChannelGuideLabel(request.method)}
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
                  {needsPaymentConfirm
                    ? '먼저 입금 확인을 완료한 뒤 수락 또는 거절을 결정해주세요.'
                    : flowMeta.mentorAction}
                </KeyValueRow>
              ) : null}
              <KeyValueRow
                label="결제금액"
                className="py-150"
                columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                labelClassName="font-designer-14m"
              >
                {paymentAmountLabel}
              </KeyValueRow>
            </div>
          </section>

          {/* 요청 내용 섹션 */}
          <section className="mb-300">
            <h3 className="font-designer-16b text-text-default mb-150">
              멘티가 전달한 내용
            </h3>
            <RequestContentViewer
              requestMessage={request.requestMessage}
              requestContents={request.requestContents}
            />
          </section>

          <section className="mb-300">
            <h3 className="font-designer-16b text-text-default mb-150">
              처리 포인트
            </h3>
            <div className="rounded-150 border-border-subtle bg-background-alternative space-y-100 border p-150">
              <div className="space-y-50">
                {flowMeta.steps.map((step, index) => (
                  <div key={step} className="flex items-start gap-75">
                    <span className="bg-fill-brand-subtle-default text-text-brand font-designer-12b inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full">
                      {index + 1}
                    </span>
                    <p className="font-designer-13r text-text-subtle leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-100 bg-background-default px-125 py-100">
                <p className="font-designer-13m text-text-default">
                  {flowMeta.mentorAction}
                </p>
                <p className="font-designer-12r text-text-subtle mt-25">
                  {flowMeta.channelGuide}
                </p>
                <p className="font-designer-12r text-text-subtle mt-25">
                  {flowMeta.issueGuide}
                </p>
              </div>
            </div>
          </section>

          <section className="mb-300">
            <h3 className="font-designer-16b text-text-default mb-150">
              검토 체크리스트
            </h3>
            <div className="rounded-150 border-border-subtle bg-background-alternative space-y-100 border p-150">
              {mentorChecklist.map((item, index) => (
                <div key={item} className="flex items-start gap-75">
                  <span className="bg-fill-brand-subtle-default text-text-brand font-designer-12b inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full">
                    {index + 1}
                  </span>
                  <p className="font-designer-13r text-text-subtle leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 결제 정보 */}
          <section className="mb-300">
            <div className="mb-150 flex items-center justify-between">
              <h3 className="font-designer-16b text-text-default">결제 정보</h3>
              <Badge
                color={
                  MENTORING_PAYMENT_STATUS_META[request.paymentStatus].color
                }
                shape="round"
              >
                {MENTORING_PAYMENT_STATUS_META[request.paymentStatus].label}
              </Badge>
            </div>
            <div className="border-border-subtle divide-border-subtle rounded-150 divide-y border">
              <div className="flex items-center justify-between px-150 py-125">
                <span className="font-designer-14m text-text-subtle">
                  결제 방식
                </span>
                <span className="font-designer-14r text-text-default">
                  {getPaymentMethodLabel(request)}
                </span>
              </div>
              <div className="flex items-center justify-between px-150 py-125">
                <span className="font-designer-14m text-text-subtle">
                  결제 금액
                </span>
                <span className="font-designer-14r text-text-default">
                  {paymentAmountLabel}
                </span>
              </div>
              <div className="flex items-center justify-between px-150 py-125">
                <span className="font-designer-14m text-text-subtle">
                  결제 상태
                </span>
                <span className="font-designer-14r text-text-default">
                  {MENTORING_PAYMENT_STATUS_META[request.paymentStatus].label}
                </span>
              </div>
              {request.paymentMemo && (
                <div className="flex items-center justify-between px-150 py-125">
                  <span className="font-designer-14m text-text-subtle">
                    {getPaymentMemoLabel(request)}
                  </span>
                  <span className="font-designer-14r text-text-default">
                    {request.paymentMemo}
                  </span>
                </div>
              )}
            </div>

            {needsPaymentConfirm && (
              <div className="mt-150 space-y-100">
                <BorderedTextarea
                  value={paymentConfirmMemo}
                  onChange={(event) =>
                    setPaymentConfirmMemo(event.target.value)
                  }
                  className="rounded-150 border-border-subtle min-h-[96px] resize-none py-125"
                  placeholder="입금 확인과 함께 멘티에게 남길 메모가 있으면 적어주세요."
                />
                <p className="font-designer-12r text-text-subtle">
                  비워두면 입금 확인 완료 문구로 처리됩니다.
                </p>
                <Button
                  type="button"
                  size="medium"
                  color="secondary"
                  className="w-full"
                  onClick={handleConfirmPayment}
                >
                  입금 확인 완료
                </Button>
              </div>
            )}

            {paymentConfirmed && isPending && (
              <div className="rounded-100 bg-background-accent-green-subtle mt-150 px-150 py-125">
                <p className="font-designer-14m text-text-success">
                  입금 확인이 끝났습니다. 이제 수락 또는 거절을 결정해주세요.
                </p>
              </div>
            )}
          </section>

          {/* 처리 메모 (처리 완료 시) */}
          {!isPending && request.decisionNote && (
            <section className="mb-300">
              <h3 className="font-designer-16b text-text-default mb-150">
                처리 메모
              </h3>
              <p className="font-designer-14r text-text-subtle rounded-100 bg-background-alternative px-150 py-125">
                {request.decisionNote}
              </p>
            </section>
          )}

          {/* 액션 버튼 (대기 중인 경우) */}
          {isPending && (
            <section>
              {!isRejecting ? (
                <div className="flex gap-100">
                  <Button
                    type="button"
                    size="medium"
                    color="outlined"
                    className="flex-1"
                    onClick={() => setIsRejecting(true)}
                  >
                    거절
                  </Button>
                  {request.method === 'note' ? (
                    <Button
                      type="button"
                      size="medium"
                      color="primary"
                      className="flex-1"
                      disabled={needsPaymentConfirm}
                      onClick={handleAcceptNote}
                    >
                      {needsPaymentConfirm ? '입금 확인 후 수락' : '수락'}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="medium"
                      color="primary"
                      className="flex-1"
                      disabled={needsPaymentConfirm}
                      onClick={() => {
                        setScheduleModalOpen(true);
                        setScheduleError('');
                      }}
                    >
                      {needsPaymentConfirm ? '입금 확인 후 수락' : '수락'}
                    </Button>
                  )}
                </div>
              ) : (
                /* 거절 섹션 */
                <div>
                  <h3 className="font-designer-16b text-text-default mb-150">
                    거절 사유
                  </h3>
                  <div className="mb-150 flex flex-wrap gap-75">
                    {REJECT_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setRejectReason(preset)}
                        className={`rounded-100 font-designer-13m border px-125 py-75 transition-colors ${
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
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="rounded-150 border-border-subtle mb-150 min-h-[100px] resize-none py-125"
                    placeholder="직접 입력하거나 위에서 선택하세요."
                  />
                  <div className="flex justify-end gap-100">
                    <Button
                      type="button"
                      size="medium"
                      color="secondary"
                      onClick={() => setIsRejecting(false)}
                    >
                      취소
                    </Button>
                    <Button
                      type="button"
                      size="medium"
                      color="outlined"
                      onClick={handleReject}
                    >
                      거절 확정
                    </Button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        {/* 하단 안내 */}
        {isPending && (
          <div className="border-border-subtle bg-background-alternative border-t px-300 py-150 text-center">
            <p className="font-designer-13r text-text-subtlest">
              {MENTORING_MENTOR_RESPONSE_EXPECTATION_GUIDE}
            </p>
            <p className="font-designer-12r text-text-subtlest mt-50">
              {needsPaymentConfirm
                ? '수동결제 건은 입금 확인 완료 후에만 수락과 답변이 열립니다.'
                : flowMeta.mentorAction}
            </p>
          </div>
        )}
      </SurfacePanel>

      {/* 일정 확정 모달 */}
      <ScheduleEditorModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        title="상담 일정 확정"
        description="멘티와 확정할 날짜/시간과 진행 방식을 입력하세요."
        confirmLabel="일정 확정 후 수락"
        durationMinutes={methodDurations[request.method]}
        defaultDate={request.preferredDate}
        defaultTime={request.preferredTime}
        defaultPlaceNote={defaultPlaceByMethod[request.method]}
        errorMessage={scheduleError}
        sessions={sessions}
        onConfirm={handleScheduleConfirm}
      />
    </>
  );
}
