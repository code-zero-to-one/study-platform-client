'use client';

import dayjs from 'dayjs';
import { useState } from 'react';
import { MENTORING_PAYMENT_STATUS_META } from '@/features/mentoring/model/management-status-meta';
import { useToastStore } from '@/stores/use-toast-store';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import type { MentoringMethodType } from '@/types/mentoring/domain';
import type { MentoringRequestDetailCardProps } from '@/types/mentoring/management-view';

import ScheduleEditorModal, {
  type ScheduleEditorSubmitPayload,
} from './schedule-editor-modal';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import BorderedTextarea from '@/components/common/ui/input/bordered-textarea';
import KeyValueRow from '@/components/common/ui/key-value-row';
import SurfacePanel from '@/components/common/ui/surface-panel';

const defaultPlaceByMethod: Record<MentoringMethodType, string> = {
  note: '서비스 내 쪽지로 진행',
  simple: '온라인 링크 전달 예정 (간편)',
  deep: '화상 링크 전달 예정',
  offline: '만남 장소 전달 예정',
};

const REJECT_PRESETS = [
  '해당 일자에 이미 다른 일정이 있습니다.',
  '현재 신규 신청을 받고 있지 않습니다.',
  '요청하신 분야가 제 전문 영역 밖입니다.',
  '신청하신 상담 방식을 현재 제공하지 않습니다.',
];

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
  const [mentorMemo, setMentorMemo] = useState('');

  const isPending = request.status === 'PENDING';
  const needsPaymentConfirm =
    isPending &&
    request.paymentMode === 'MANUAL_TRANSFER' &&
    request.paymentStatus === 'PENDING_TRANSFER';
  const paymentConfirmed =
    request.paymentMode === 'MANUAL_TRANSFER' &&
    request.paymentStatus === 'CONFIRMED';
  const hasPayment = request.paymentMode === 'MANUAL_TRANSFER';

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
    const result = confirmManualPayment({
      mentorId,
      requestId: request.id,
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
                label="멘토명"
                className="py-150"
                columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                labelClassName="font-designer-14m"
              >
                개발자
              </KeyValueRow>
              <KeyValueRow
                label="신청 강의"
                className="py-150"
                columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                labelClassName="font-designer-14m"
              >
                -
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
                label="연락처"
                className="py-150"
                columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                labelClassName="font-designer-14m"
              >
                수락 후 확인가능
              </KeyValueRow>
              <KeyValueRow
                label="이메일"
                className="py-150"
                columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                labelClassName="font-designer-14m"
              >
                데이터베이스에 배구 섬김다.
              </KeyValueRow>
              <KeyValueRow
                label="메시지"
                className="py-150"
                columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                labelClassName="font-designer-14m"
              >
                {request.requestMessage}
              </KeyValueRow>
              <KeyValueRow
                label="일정"
                className="py-150"
                columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                labelClassName="font-designer-14m"
              >
                {dayjs(request.requestedAt).format(
                  'YYYY.MM.DD (ddd), HH:mm~HH:mm',
                )}
              </KeyValueRow>
              <KeyValueRow
                label="결제금액"
                className="py-150"
                columnsClassName="grid-cols-[100px_minmax(0,1fr)] gap-200"
                labelClassName="font-designer-14m"
              >
                3,300원
              </KeyValueRow>
            </div>
          </section>

          {/* 멘토링 메모 섹션 */}
          <section className="mb-300">
            <div className="mb-150 flex items-center justify-between">
              <h3 className="font-designer-16b text-text-default">
                멘토링 메모
              </h3>
              <button
                type="button"
                className="text-text-brand font-designer-14m flex items-center gap-50"
              >
                <span>✏️</span>
              </button>
            </div>
            <BorderedTextarea
              value={mentorMemo}
              onChange={(e) => setMentorMemo(e.target.value)}
              className="rounded-150 border-border-subtle bg-background-alternative min-h-[120px] resize-none py-125"
              placeholder="메모를 작성하면 멘티에게 공개되지 않습니다."
            />
          </section>

          {/* 결제 정보 (수동결제인 경우) */}
          {hasPayment && (
            <section className="mb-300">
              <div className="mb-150 flex items-center justify-between">
                <h3 className="font-designer-16b text-text-default">
                  결제 정보
                </h3>
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
                    수동 계좌이체
                  </span>
                </div>
                <div className="flex items-center justify-between px-150 py-125">
                  <span className="font-designer-14m text-text-subtle">
                    입금 상태
                  </span>
                  <span className="font-designer-14r text-text-default">
                    {MENTORING_PAYMENT_STATUS_META[request.paymentStatus].label}
                  </span>
                </div>
                {request.paymentMemo && (
                  <div className="flex items-center justify-between px-150 py-125">
                    <span className="font-designer-14m text-text-subtle">
                      결제 메모
                    </span>
                    <span className="font-designer-14r text-text-default">
                      {request.paymentMemo}
                    </span>
                  </div>
                )}
              </div>

              {needsPaymentConfirm && (
                <Button
                  type="button"
                  size="medium"
                  color="secondary"
                  className="mt-150 w-full"
                  onClick={handleConfirmPayment}
                >
                  입금 확인 완료
                </Button>
              )}

              {paymentConfirmed && isPending && (
                <div className="rounded-100 bg-background-accent-green-subtle mt-150 px-150 py-125">
                  <p className="font-designer-14m text-text-success">
                    입금이 확인되었습니다. 수락할 수 있어요.
                  </p>
                </div>
              )}
            </section>
          )}

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
              멘티의 신청이 24시간 내에 수락/거절 되지 않을 때 재신청됩니다.
              <br />
              변경하신 내용이 24시간 이내 재신청된 자동 삭제될 수 있습니다.
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
