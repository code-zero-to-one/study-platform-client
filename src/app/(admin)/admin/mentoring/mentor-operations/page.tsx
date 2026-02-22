'use client';

import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import {
  canManageMentorOperationStatus,
  getMentorOperationDisplayStatus,
  MENTOR_OPERATION_STATUS_META,
  MENTOR_OPERATION_STATUS_OPTIONS,
} from '@/features/admin/mentoring/model/operations';
import { MENTOR_SCREENING_STATUS_META } from '@/features/admin/mentoring/model/screening';
import { useAdminMentoringData } from '@/features/admin/mentoring/model/use-admin-mentoring-data';
import MentorRegistrationDetail from '@/features/admin/mentoring/ui/mentor-registration-detail';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useToastStore } from '@/stores/use-toast-store';
import { type MentorOperationStatus, useMentorOperationStore } from '@/stores/useMentorOperationStore';

const formatDateTime = (value: string | undefined) => {
  if (!value) {
    return '-';
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return '-';
  }

  return parsed.format('YYYY.MM.DD HH:mm');
};

const normalizeReason = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  return trimmed;
};

const getOperationToastText = (status: MentorOperationStatus) => {
  if (status === 'OPEN') {
    return '운영 상태를 신규 신청 가능으로 변경했습니다.';
  }
  if (status === 'REQUESTS_PAUSED') {
    return '운영 상태를 신규 신청 중지로 변경했습니다.';
  }

  return '운영 상태를 운영 정지로 변경했습니다.';
};

export default function MentorOperationsPage() {
  const searchParams = useSearchParams();
  const { memberId: operatorMemberId } = useAuthReady();
  const { showToast } = useToastStore();
  const { hasHydrated, mentors } = useAdminMentoringData();
  const upsertOperationRecord = useMentorOperationStore(
    (state) => state.upsertRecord,
  );
  const [selectedMentorId, setSelectedMentorId] = useState<number>();
  const [nextOperationStatus, setNextOperationStatus] =
    useState<MentorOperationStatus>('OPEN');
  const [operationReason, setOperationReason] = useState('');

  useEffect(() => {
    if (mentors.length === 0) {
      setSelectedMentorId(undefined);

      return;
    }

    const mentorIdQuery = Number(searchParams.get('mentorId'));
    const hasMentorIdQuery = Number.isFinite(mentorIdQuery);
    const queryTarget = hasMentorIdQuery
      ? mentors.find((mentor) => mentor.mentorId === mentorIdQuery)
      : undefined;

    if (queryTarget) {
      setSelectedMentorId(queryTarget.mentorId);

      return;
    }

    const currentSelectionExists = mentors.some(
      (mentor) => mentor.mentorId === selectedMentorId,
    );
    if (!currentSelectionExists) {
      setSelectedMentorId(mentors[0].mentorId);
    }
  }, [mentors, searchParams, selectedMentorId]);

  const selectedMentor = useMemo(() => {
    if (!selectedMentorId) {
      return undefined;
    }

    return mentors.find((mentor) => mentor.mentorId === selectedMentorId);
  }, [mentors, selectedMentorId]);

  const selectedOperationHistory = useMemo(() => {
    if (!selectedMentor) {
      return [];
    }

    return [...selectedMentor.operation.history].sort((first, second) => {
      return dayjs(second.changedAt).valueOf() - dayjs(first.changedAt).valueOf();
    });
  }, [selectedMentor]);

  useEffect(() => {
    if (!selectedMentor) {
      setNextOperationStatus('OPEN');
      setOperationReason('');

      return;
    }

    setNextOperationStatus(selectedMentor.operation.status);
    setOperationReason(selectedMentor.operation.reason ?? '');
  }, [selectedMentor]);

  const canManageSelectedMentorOperation = selectedMentor
    ? canManageMentorOperationStatus(selectedMentor.screening.status)
    : false;

  const handleApplyOperationChange = () => {
    if (!selectedMentor) {
      return;
    }

    if (!canManageSelectedMentorOperation) {
      showToast('심사 승인 후에만 운영 조치를 변경할 수 있습니다.', 'error');

      return;
    }

    const normalizedReason = normalizeReason(operationReason);
    if (!normalizedReason || normalizedReason.length < 2) {
      showToast('조치 사유를 2자 이상 입력해주세요.', 'error');

      return;
    }

    const hasSameStatus = selectedMentor.operation.status === nextOperationStatus;
    const hasSameReason =
      (selectedMentor.operation.reason ?? undefined) === normalizedReason;
    if (hasSameStatus && hasSameReason) {
      showToast('변경된 조치가 없습니다.', 'error');

      return;
    }

    upsertOperationRecord({
      mentorId: selectedMentor.mentorId,
      status: nextOperationStatus,
      reason: normalizedReason,
      changedByMemberId: operatorMemberId,
    });
    showToast(getOperationToastText(nextOperationStatus), 'success');
  };

  if (!hasHydrated) {
    return (
      <div className="rounded-200 bg-background-alternative h-[360px] animate-pulse" />
    );
  }

  if (mentors.length === 0) {
    return (
      <section className="rounded-100 border-border-subtle border px-250 py-300 text-center">
        <p className="font-designer-18b text-text-default">
          조회할 멘토 등록 정보가 없습니다.
        </p>
        <p className="font-designer-14r text-text-subtle mt-75">
          멘토 등록 후 심사를 진행하면 상세 정보를 확인할 수 있습니다.
        </p>
      </section>
    );
  }

  return (
    <div className="grid grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-200">
      <section className="rounded-100 border-border-subtle overflow-hidden border">
        <div className="border-border-subtle border-b p-200">
          <h2 className="font-designer-16b text-text-default">
            등록 멘토 목록
          </h2>
          <p className="font-designer-13r text-text-subtle mt-50">
            멘토를 선택하면 등록한 정보 전체를 우측에서 확인합니다.
          </p>
        </div>

        <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
          {mentors.map((mentor, index) => {
            const screeningMeta =
              MENTOR_SCREENING_STATUS_META[mentor.screening.status];
            const operationDisplayStatus = getMentorOperationDisplayStatus({
              screeningStatus: mentor.screening.status,
              operationStatus: mentor.operation.status,
            });
            const operationMeta =
              MENTOR_OPERATION_STATUS_META[operationDisplayStatus];

            return (
              <button
                key={mentor.mentorId}
                type="button"
                className={`${
                  index === mentors.length - 1 ? '' : 'border-b-border-subtle border-b'
                } ${
                  selectedMentorId === mentor.mentorId
                    ? 'bg-background-accent-blue-subtle'
                    : 'bg-background-default'
                } w-full px-200 py-150 text-left`}
                onClick={() => setSelectedMentorId(mentor.mentorId)}
              >
                <div className="flex items-start justify-between gap-75">
                  <div>
                    <p className="font-designer-14b text-text-default">
                      #{mentor.mentorId}{' '}
                      {mentor.memberId ? `(사용자 #${mentor.memberId})` : ''}
                    </p>
                    <p className="font-designer-13r text-text-subtle mt-25 line-clamp-2">
                      {mentor.mentor.mentorSettings?.mentoringTitle ??
                        mentor.mentor.headline}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-50">
                    <Badge color={screeningMeta.color} shape="rectangle">
                      {screeningMeta.label}
                    </Badge>
                    <Badge color={operationMeta.color} shape="rectangle">
                      {operationMeta.label}
                    </Badge>
                  </div>
                </div>
                <p className="font-designer-12r text-text-subtlest mt-75">
                  업데이트: {formatDateTime(mentor.mentor.mentorSettings?.updatedAt)}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {selectedMentor ? (
        <div className="space-y-200">
          <MentorRegistrationDetail item={selectedMentor} />

          <section className="rounded-100 border-border-subtle border p-200">
            <div className="border-border-subtle mb-150 border-b pb-150">
              <h3 className="font-designer-16b text-text-default">
                운영 조치 관리
              </h3>
              <p className="font-designer-13r text-text-subtle mt-50">
                신규 신청 접수 여부와 운영 정지를 실제 상태로 저장합니다.
              </p>
            </div>

            <div className="space-y-100">
              <InfoRow label="현재 운영 상태">
                {(() => {
                  const currentOperationDisplayStatus =
                    getMentorOperationDisplayStatus({
                      screeningStatus: selectedMentor.screening.status,
                      operationStatus: selectedMentor.operation.status,
                    });
                  const currentMeta =
                    MENTOR_OPERATION_STATUS_META[currentOperationDisplayStatus];

                  return (
                    <Badge color={currentMeta.color} shape="rectangle">
                      {currentMeta.label}
                    </Badge>
                  );
                })()}
              </InfoRow>
              <InfoRow label="상태 설명">
                {
                  MENTOR_OPERATION_STATUS_META[
                    getMentorOperationDisplayStatus({
                      screeningStatus: selectedMentor.screening.status,
                      operationStatus: selectedMentor.operation.status,
                    })
                  ].description
                }
              </InfoRow>
              <InfoRow label="마지막 조치 시각">
                {formatDateTime(selectedMentor.operation.changedAt)}
              </InfoRow>
              <InfoRow label="마지막 조치자">
                {selectedMentor.operation.changedByMemberId
                  ? `#${selectedMentor.operation.changedByMemberId}`
                  : '-'}
              </InfoRow>
            </div>

            <div className="mt-150">
              <p className="font-designer-13b text-text-default mb-75">
                변경할 운영 상태
              </p>
              <div className="flex flex-wrap gap-75">
                {MENTOR_OPERATION_STATUS_OPTIONS.map((status) => {
                  const meta = MENTOR_OPERATION_STATUS_META[status];

                  return (
                    <button
                      key={status}
                      type="button"
                      className={`${
                        nextOperationStatus === status
                          ? 'border-border-brand bg-background-accent-blue-subtle'
                          : 'border-border-default bg-background-default'
                      } rounded-100 border px-125 py-100`}
                      onClick={() => setNextOperationStatus(status)}
                      disabled={!canManageSelectedMentorOperation}
                    >
                      <p className="font-designer-13b text-text-default text-left">
                        {meta.label}
                      </p>
                      <p className="font-designer-12r text-text-subtle mt-25 text-left">
                        {meta.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-150">
              <label className="font-designer-13b text-text-default mb-75 block">
                조치 사유
              </label>
              <textarea
                value={operationReason}
                onChange={(event) => setOperationReason(event.target.value)}
                className="font-designer-14r rounded-100 border-border-default bg-background-default text-text-default min-h-[96px] w-full border px-125 py-100"
                placeholder="신규 신청 중지/정지 사유, 해제 사유를 기록하세요."
                disabled={!canManageSelectedMentorOperation}
              />
            </div>

            <div className="mt-150 flex flex-wrap items-center gap-75">
              <Button
                type="button"
                size="small"
                onClick={handleApplyOperationChange}
                disabled={!canManageSelectedMentorOperation}
              >
                조치 변경
              </Button>
              {!canManageSelectedMentorOperation ? (
                <p className="font-designer-13r text-text-subtle">
                  심사 승인 후 운영 조치를 변경할 수 있습니다.
                </p>
              ) : null}
            </div>

            <div className="mt-150">
              <h4 className="font-designer-13b text-text-default mb-75">
                최근 조치 이력
              </h4>
              {selectedOperationHistory.length === 0 ? (
                <p className="font-designer-13r text-text-subtle">
                  저장된 운영 조치 이력이 없습니다.
                </p>
              ) : (
                <ul className="space-y-75">
                  {selectedOperationHistory.slice(0, 8).map((entry) => {
                    const fromStatusLabel =
                      entry.fromStatus === 'INITIAL'
                        ? '초기값'
                        : MENTOR_OPERATION_STATUS_META[entry.fromStatus].label;
                    const toStatusLabel =
                      MENTOR_OPERATION_STATUS_META[entry.toStatus].label;

                    return (
                      <li
                        key={entry.id}
                        className="rounded-100 border-border-subtle bg-background-alternative border px-125 py-100"
                      >
                        <p className="font-designer-13b text-text-default">
                          {fromStatusLabel} → {toStatusLabel}
                        </p>
                        <p className="font-designer-12r text-text-subtle mt-25">
                          {formatDateTime(entry.changedAt)} ·{' '}
                          {entry.changedByMemberId
                            ? `관리자 #${entry.changedByMemberId}`
                            : '관리자 정보 없음'}
                        </p>
                        <p className="font-designer-12r text-text-default mt-25">
                          사유: {entry.reason ?? '-'}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      ) : (
        <section className="rounded-100 border-border-subtle border p-200">
          <p className="font-designer-14r text-text-subtle">
            멘토를 선택해주세요.
          </p>
        </section>
      )}
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
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-75">
      <p className="font-designer-13m text-text-subtle">{label}</p>
      <div className="font-designer-14r text-text-default">{children}</div>
    </div>
  );
}
