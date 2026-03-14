'use client';

import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import BorderedTextarea from '@/components/common/ui/input/bordered-textarea';
import KeyValueRow from '@/components/common/ui/key-value-row';
import SurfacePanel from '@/components/common/ui/surface-panel';
import { resolveAdminMentoringViewState } from '@/features/admin/mentoring/model/admin-mentoring-view-state';
import {
  canManageMentorOperationStatus,
  getMentorOperationDisplayStatus,
  MENTOR_OPERATION_STATUS_META,
  MENTOR_OPERATION_STATUS_OPTIONS,
} from '@/features/admin/mentoring/model/operations';
import { MENTOR_SCREENING_STATUS_META } from '@/features/admin/mentoring/model/screening';
import { useAdminMentoringOverviewQuery } from '@/features/admin/mentoring/model/use-admin-mentoring-overview-query';
import MentorRegistrationDetail from '@/features/admin/mentoring/ui/mentor-registration-detail';
import { getMentorDisplayTitle } from '@/features/mentoring/model/mentor-profile-utils';
import MentoringEmptyPanel from '@/features/mentoring/ui/common/mentoring-empty-panel';
import MentoringStateBoundary from '@/features/mentoring/ui/common/mentoring-state-boundary';
import MentoringTablePanel from '@/features/mentoring/ui/common/mentoring-table-panel';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useToastStore } from '@/stores/use-toast-store';
import { useMentorOperationStore } from '@/stores/useMentorOperationStore';
import type { MentorOperationStatus } from '@/types/mentoring/admin-domain';

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

interface MentorOperationsPageClientProps {
  initialMentorId?: number;
}

export default function MentorOperationsPageClient({
  initialMentorId,
}: MentorOperationsPageClientProps) {
  const { memberId: operatorMemberId } = useAuthReady();
  const { showToast } = useToastStore();
  const { hasHydrated, mentors } = useAdminMentoringOverviewQuery();
  const upsertOperationRecord = useMentorOperationStore(
    (state) => state.upsertRecord,
  );
  const [selectedMentorId, setSelectedMentorId] = useState<number>();
  const [nextOperationStatus, setNextOperationStatus] =
    useState<MentorOperationStatus>('OPEN');
  const [operationReason, setOperationReason] = useState('');
  const listState = resolveAdminMentoringViewState({
    hasHydrated,
    itemCount: mentors.length,
  });

  useEffect(() => {
    if (mentors.length === 0) {
      setSelectedMentorId(undefined);

      return;
    }

    const mentorIdQuery = initialMentorId;
    const hasMentorIdQuery = typeof mentorIdQuery === 'number';
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
  }, [initialMentorId, mentors, selectedMentorId]);

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
      return (
        dayjs(second.changedAt).valueOf() - dayjs(first.changedAt).valueOf()
      );
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

    const hasSameStatus =
      selectedMentor.operation.status === nextOperationStatus;
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

  return (
    <MentoringStateBoundary
      state={listState}
      empty={
        <MentoringEmptyPanel
          title="조회할 멘토 등록 정보가 없습니다."
          description="멘토 등록 후 심사를 진행하면 상세 정보를 확인할 수 있습니다."
        />
      }
      ready={
        <div className="grid grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-200">
          <MentoringTablePanel
            title="등록 멘토 목록"
            description="멘토를 선택하면 등록한 정보 전체를 우측에서 확인합니다."
            bodyClassName="max-h-[calc(100vh-260px)] overflow-y-auto"
          >
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
                    index === mentors.length - 1
                      ? ''
                      : 'border-b-border-subtle border-b'
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
                        {getMentorDisplayTitle(mentor.mentor)}
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
                    업데이트:{' '}
                    {formatDateTime(mentor.mentor.mentorSettings?.updatedAt)}
                  </p>
                </button>
              );
            })}
          </MentoringTablePanel>

          {selectedMentor ? (
            <div className="space-y-200">
              <MentorRegistrationDetail item={selectedMentor} />

              <SurfacePanel className="p-200">
                <div className="border-border-subtle mb-150 border-b pb-150">
                  <h3 className="font-designer-16b text-text-default">
                    운영 조치 관리
                  </h3>
                  <p className="font-designer-13r text-text-subtle mt-50">
                    신규 신청 접수 여부와 운영 정지를 실제 상태로 저장합니다.
                  </p>
                </div>

                <div className="space-y-100">
                  <KeyValueRow
                    label="현재 운영 상태"
                    columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
                  >
                    {(() => {
                      const currentOperationDisplayStatus =
                        getMentorOperationDisplayStatus({
                          screeningStatus: selectedMentor.screening.status,
                          operationStatus: selectedMentor.operation.status,
                        });
                      const currentMeta =
                        MENTOR_OPERATION_STATUS_META[
                          currentOperationDisplayStatus
                        ];

                      return (
                        <Badge color={currentMeta.color} shape="rectangle">
                          {currentMeta.label}
                        </Badge>
                      );
                    })()}
                  </KeyValueRow>
                  <KeyValueRow
                    label="상태 설명"
                    columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
                  >
                    {
                      MENTOR_OPERATION_STATUS_META[
                        getMentorOperationDisplayStatus({
                          screeningStatus: selectedMentor.screening.status,
                          operationStatus: selectedMentor.operation.status,
                        })
                      ].description
                    }
                  </KeyValueRow>
                  <KeyValueRow
                    label="마지막 조치 시각"
                    columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
                  >
                    {formatDateTime(selectedMentor.operation.changedAt)}
                  </KeyValueRow>
                  <KeyValueRow
                    label="마지막 조치자"
                    columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
                  >
                    {selectedMentor.operation.changedByMemberId
                      ? `#${selectedMentor.operation.changedByMemberId}`
                      : '-'}
                  </KeyValueRow>
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
                  <BorderedTextarea
                    value={operationReason}
                    onChange={(event) => setOperationReason(event.target.value)}
                    className="min-h-[96px] px-125 py-100"
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
                            : MENTOR_OPERATION_STATUS_META[entry.fromStatus]
                                .label;
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
              </SurfacePanel>
            </div>
          ) : (
            <SurfacePanel className="p-200">
              <p className="font-designer-14r text-text-subtle">
                멘토를 선택해주세요.
              </p>
            </SurfacePanel>
          )}
        </div>
      }
    />
  );
}
