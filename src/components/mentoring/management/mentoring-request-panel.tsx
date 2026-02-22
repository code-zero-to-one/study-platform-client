'use client';

import dayjs from 'dayjs';
import { AlertCircle, Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
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
  initialExpandedId?: string;
  /** 지정 시 해당 id 1건만 표시 */
  filterRequestId?: string;
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

const paymentModeLabelMap: Record<MentoringPaymentMode, string> = {
  TOSS_PAYMENTS: 'Toss 결제',
  FREE_REQUEST: '무료 상담',
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

const REJECT_PRESETS = [
  '해당 일자에 이미 다른 일정이 있습니다.',
  '현재 신규 신청을 받고 있지 않습니다.',
  '요청하신 분야가 제 전문 영역 밖입니다.',
  '신청하신 상담 방식을 현재 제공하지 않습니다.',
];

const getPreferredScheduleText = (request: MentoringRequest) => {
  if (!request.preferredDate) return '멘티와 조율 필요';
  if (!request.preferredTime) return request.preferredDate;
  return `${request.preferredDate} ${request.preferredTime}`;
};

function MenteeAvatar({ name }: { name: string }) {
  return (
    <div className="bg-fill-brand-subtle-default rounded-full flex h-[44px] w-[44px] shrink-0 items-center justify-center">
      <span className="font-designer-16b text-text-brand">
        {name.charAt(0)}
      </span>
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-200 py-100">
      <span className="font-designer-13m text-text-subtle w-[80px] shrink-0">
        {label}
      </span>
      <span className="font-designer-14r text-text-default flex-1">
        {children}
      </span>
    </div>
  );
}

export default function MentoringRequestPanel({
  mentorId,
  methodDurations,
  initialExpandedId,
  filterRequestId,
}: MentoringRequestPanelProps) {
  const { showToast } = useToastStore();
  const allRequests = useMentoringManagementStore(
    (state) => state.requestsByMentor[mentorId] ?? [],
  );
  const requests = useMemo(
    () =>
      filterRequestId
        ? allRequests.filter((r) => r.id === filterRequestId)
        : allRequests,
    [allRequests, filterRequestId],
  );
  const sessions = useMentoringManagementStore(
    (state) => state.sessionsByMentor[mentorId] ?? [],
  );
  const acceptRequest = useMentoringManagementStore(
    (state) => state.acceptRequest,
  );
  const rejectRequest = useMentoringManagementStore(
    (state) => state.rejectRequest,
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
  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === 'PENDING').length,
    [requests],
  );

  const urgentCount = useMemo(
    () =>
      requests.filter(
        (r) =>
          r.status === 'PENDING' &&
          r.paymentStatus === 'PENDING_TRANSFER',
      ).length,
    [requests],
  );

  const scheduleTarget = useMemo(
    () =>
      scheduleTargetId
        ? requests.find((r) => r.id === scheduleTargetId)
        : undefined,
    [requests, scheduleTargetId],
  );

  const handleAcceptNote = (request: MentoringRequest) => {
    const result = acceptRequest({ mentorId, requestId: request.id });
    if (!result.ok) {
      showToast(result.reason ?? '신청 수락에 실패했습니다.', 'error');
      return;
    }
    showToast('신청을 수락했습니다.', 'success');
  };

  const handleScheduleConfirm = (payload: ScheduleEditorSubmitPayload) => {
    if (!scheduleTarget) return;
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
    const result = rejectRequest({ mentorId, requestId, reason });
    if (!result.ok) {
      showToast(result.reason ?? '신청 거절에 실패했습니다.', 'error');
      return;
    }
    setRejectingRequestId(null);
    setRejectReasonByRequest((prev) => ({ ...prev, [requestId]: '' }));
    showToast('신청을 거절했습니다.', 'success');
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
      {/* 긴급 배너 */}
      {urgentCount > 0 && (
        <div className="rounded-150 bg-background-accent-orange-subtle flex items-center gap-100 px-200 py-125">
          <AlertCircle className="text-text-warning h-16 w-16 shrink-0" />
          <p className="font-designer-14m text-text-warning">
            입금 대기 중인 신청이{' '}
            <span className="font-designer-14b">{urgentCount}건</span> 있습니다.
            입금 확인 후 수락해주세요.
          </p>
        </div>
      )}

      {/* 건수 요약 */}
      <div className="flex items-center justify-between">
        <p className="font-designer-14m text-text-subtle">
          전체{' '}
          <span className="text-text-default font-bold">{requests.length}</span>
          건
        </p>
        {pendingCount > 0 && (
          <Badge color="orange" shape="round">
            대기 {pendingCount}건
          </Badge>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="rounded-200 border-border-subtle bg-background-default flex flex-col items-center justify-center border px-300 py-[60px] text-center">
          <p className="font-designer-16b text-text-default mb-75">
            신청 내역이 없습니다
          </p>
          <p className="font-designer-14r text-text-subtle">
            새 신청이 들어오면 이곳에서 바로 처리할 수 있어요.
          </p>
        </div>
      ) : (
        <div className="space-y-200">
          {requests.map((request) => {
            const isPending = request.status === 'PENDING';
            const rejectReason = rejectReasonByRequest[request.id] ?? '';
            const needsPaymentConfirm =
              isPending &&
              request.paymentStatus === 'PENDING_TRANSFER';
            const paymentConfirmed =
              request.paymentStatus === 'CONFIRMED';
            const hasPayment = request.paymentMode !== 'FREE_REQUEST';

            return (
              <article
                key={request.id}
                className={`rounded-200 border bg-background-default overflow-hidden ${
                  needsPaymentConfirm
                    ? 'border-border-warning'
                    : 'border-border-subtle'
                }`}
              >
                {/* 섹션 1: 멘티 정보 */}
                <div className="px-300 pt-250 pb-200">
                  <div className="flex items-start gap-150">
                    <MenteeAvatar name={request.menteeName} />
                    <div className="flex-1">
                      <div className="mb-75 flex flex-wrap items-center gap-100">
                        <p className="font-designer-18b text-text-default">
                          {request.menteeName}
                        </p>
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
                      {request.menteeRole && (
                        <p className="font-designer-13r text-text-subtle">
                          {request.menteeRole}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 안내 문구 */}
                <div className="border-border-subtle mx-300 border-t">
                  <div className="rounded-100 bg-background-alternative my-150 flex items-start gap-75 px-125 py-100">
                    <Info className="text-text-subtlest mt-[2px] h-14 w-14 shrink-0" />
                    <p className="font-designer-13r text-text-subtle">
                      수락 시 작성하신 연락처와 이메일이 멘티에게 공개됩니다.
                    </p>
                  </div>
                </div>

                {/* 섹션 2: 상세 정보 */}
                <div className="border-border-subtle mx-300 border-t">
                  <div className="divide-border-subtle divide-y">
                    <InfoRow label="상태">
                      <Badge
                        color={statusColorMap[request.status]}
                        shape="round"
                      >
                        {statusLabelMap[request.status]}
                      </Badge>
                    </InfoRow>
                    <InfoRow label="신청 일시">
                      {dayjs(request.requestedAt).format('YY. MM. DD. HH:mm')}
                    </InfoRow>
                    <InfoRow label="희망 일정">
                      {getPreferredScheduleText(request)}
                    </InfoRow>
                    <InfoRow label="결제 방식">
                      {paymentModeLabelMap[request.paymentMode]}
                    </InfoRow>
                  </div>
                </div>

                {/* 섹션 3: 신청 메시지 */}
                <div className="border-border-subtle mx-300 border-t py-200">
                  <p className="font-designer-13m text-text-subtle mb-100">
                    신청 메시지
                  </p>
                  <p className="font-designer-14r text-text-default rounded-100 bg-background-alternative px-150 py-125 leading-relaxed">
                    {request.requestMessage}
                  </p>
                </div>

                {/* 섹션 4: 결제 정보 (수동결제인 경우) */}
                {hasPayment && (
                  <div className="border-border-subtle mx-300 border-t py-200">
                    <div className="mb-150 flex items-center justify-between">
                      <span className="font-designer-14m text-text-default">
                        결제 정보
                      </span>
                      <Badge
                        color={paymentStatusColorMap[request.paymentStatus]}
                        shape="round"
                      >
                        {paymentStatusLabelMap[request.paymentStatus]}
                      </Badge>
                    </div>
                    <div className="border-border-subtle divide-border-subtle divide-y rounded-150 border">
                      <div className="flex items-center justify-between px-150 py-100">
                        <span className="font-designer-13m text-text-subtle">
                          결제 방식
                        </span>
                        <span className="font-designer-13r text-text-default">
                          수동 계좌이체
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-150 py-100">
                        <span className="font-designer-13m text-text-subtle">
                          입금 상태
                        </span>
                        <span className="font-designer-13r text-text-default">
                          {paymentStatusLabelMap[request.paymentStatus]}
                        </span>
                      </div>
                      {request.paymentMemo && (
                        <div className="flex items-center justify-between px-150 py-100">
                          <span className="font-designer-13m text-text-subtle">
                            결제 메모
                          </span>
                          <span className="font-designer-13r text-text-default">
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
                        className="mt-125 w-full"
                        onClick={() => handleConfirmPayment(request.id)}
                      >
                        입금 확인 완료
                      </Button>
                    )}

                    {paymentConfirmed && isPending && (
                      <div className="rounded-100 bg-background-accent-green-subtle mt-125 px-125 py-100">
                        <p className="font-designer-13m text-text-success">
                          입금이 확인되었습니다. 수락할 수 있어요.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 섹션 5: 처리 메모 (처리 완료 시) */}
                {!isPending && request.decisionNote && (
                  <div className="border-border-subtle mx-300 border-t py-150">
                    <p className="font-designer-13r text-text-subtle">
                      처리 메모: {request.decisionNote}
                    </p>
                  </div>
                )}

                {/* 섹션 6: 액션 (대기 중인 경우) */}
                {isPending && (
                  <div className="border-border-subtle bg-background-default mx-300 border-t py-200">
                    {rejectingRequestId !== request.id ? (
                      <div className="flex flex-wrap gap-100">
                        {request.method === 'note' ? (
                          <Button
                            type="button"
                            size="medium"
                            color="primary"
                            className="flex-1"
                            onClick={() => handleAcceptNote(request)}
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
                              setScheduleTargetId(request.id);
                              setScheduleError('');
                            }}
                          >
                            수락 후 일정 확정
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="medium"
                          color="outlined"
                          onClick={() => setRejectingRequestId(request.id)}
                        >
                          거절
                        </Button>
                      </div>
                    ) : (
                      /* 거절 섹션 */
                      <div>
                        <p className="font-designer-14b text-text-default mb-100">
                          거절 사유
                        </p>
                        <div className="mb-125 flex flex-wrap gap-75">
                          {REJECT_PRESETS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() =>
                                setRejectReasonByRequest((prev) => ({
                                  ...prev,
                                  [request.id]: preset,
                                }))
                              }
                              className={`rounded-100 font-designer-12m border px-100 py-50 transition-colors ${
                                rejectReason === preset
                                  ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
                                  : 'border-border-default text-text-subtle hover:border-border-brand hover:text-text-brand'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={rejectReason}
                          onChange={(e) =>
                            setRejectReasonByRequest((prev) => ({
                              ...prev,
                              [request.id]: e.target.value,
                            }))
                          }
                          className="font-designer-13r rounded-100 border-border-subtle bg-background-default text-text-default mb-100 min-h-[80px] w-full resize-none border px-125 py-100 outline-none focus:border-border-brand"
                          placeholder="직접 입력하거나 위에서 선택하세요."
                        />
                        <div className="flex flex-wrap justify-end gap-75">
                          <Button
                            type="button"
                            size="small"
                            color="secondary"
                            onClick={() => setRejectingRequestId(null)}
                          >
                            취소
                          </Button>
                          <Button
                            type="button"
                            size="small"
                            color="outlined"
                            onClick={() => handleReject(request.id)}
                          >
                            거절 확정
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 하단 여백 안내 */}
                <div className="border-border-subtle bg-background-alternative border-t px-300 py-150 text-center">
                  <p className="font-designer-12r text-text-subtlest">
                    수락 후 멘티와 일정을 조율해 보세요.
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}

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
        sessions={sessions}
        onConfirm={handleScheduleConfirm}
      />
    </>
  );
}
