'use client';

import dayjs from 'dayjs';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import SurfacePanel from '@/components/common/ui/surface-panel';
import {
  MENTORING_SESSION_ISSUE_META,
  MENTORING_SESSION_STATUS_META,
} from '@/features/mentoring/model/management-status-meta';
import { getMethodLabel } from '@/features/mentoring/model/mentor-profile-utils';
import { getMentoringIssuePlaybook } from '@/features/mentoring/model/mentoring-flow-policy';
import { useMentorWorkspaceQuery } from '@/features/mentoring/model/use-mentor-workspace-query';
import {
  useCancelMentoringSessionMutation,
  useMarkMentoringSessionOutcomeMutation,
  useRescheduleMentoringSessionMutation,
} from '@/features/mentoring/model/use-mentoring-lifecycle-mutations';
import { useToastStore } from '@/stores/use-toast-store';
import type {
  MentoringRequest,
  MentoringSession,
} from '@/types/mentoring/management-domain';
import type { MentoringSchedulePanelProps } from '@/types/mentoring/management-view';
import MentoringScheduleCalendar from './mentoring-schedule-calendar';
import ScheduleEditorModal, {
  type ScheduleEditorSubmitPayload,
} from './schedule-editor-modal';
const EMPTY_REQUESTS: MentoringRequest[] = [];
const EMPTY_SESSIONS: MentoringSession[] = [];

const getOverlappingIds = (sessions: MentoringSession[]): Set<string> => {
  const scheduled = sessions
    .filter((s) => s.status === 'SCHEDULED')
    .sort((a, b) => dayjs(a.startsAt).valueOf() - dayjs(b.startsAt).valueOf());

  const ids = new Set<string>();

  for (let i = 0; i < scheduled.length; i += 1) {
    const base = scheduled[i];
    const baseEnd = dayjs(base.endsAt);

    for (let j = i + 1; j < scheduled.length; j += 1) {
      const candidate = scheduled[j];
      if (!dayjs(candidate.startsAt).isBefore(baseEnd)) break;
      ids.add(base.id);
      ids.add(candidate.id);
    }
  }

  return ids;
};

type CancelIssueType = 'MENTOR_CANCELLED' | 'MENTEE_CANCELLED';

const getCancelPreview = ({
  startsAt,
  issueType,
}: {
  startsAt: string;
  issueType: CancelIssueType;
}) => {
  if (issueType === 'MENTOR_CANCELLED') {
    return '멘토 사정 취소로 멘티에게 후속 안내를 남겨야 합니다.';
  }

  const hoursUntilStart = dayjs(startsAt).diff(dayjs(), 'hour', true);
  if (hoursUntilStart >= 120) {
    return '멘티 요청 취소로 상담 종료 안내를 남겨주세요.';
  }

  if (hoursUntilStart >= 24) {
    return '멘티 취소 사유와 다음 행동 안내를 함께 남겨주세요.';
  }

  return '임박 취소 사유를 자세히 남겨 분쟁을 줄이세요.';
};

export default function MentoringSchedulePanel({
  mentorId,
  methodDurations,
}: MentoringSchedulePanelProps) {
  const { showToast } = useToastStore();
  const workspaceQuery = useMentorWorkspaceQuery({
    mentorId,
    enabled: true,
  });
  const mentorSessions = workspaceQuery.data?.allSessions;
  const mentorRequests = workspaceQuery.data?.allRequests;
  const sessions = mentorSessions ?? EMPTY_SESSIONS;
  const requests = mentorRequests ?? EMPTY_REQUESTS;
  const rescheduleSessionMutation = useRescheduleMentoringSessionMutation();
  const cancelSessionMutation = useCancelMentoringSessionMutation();
  const markSessionOutcomeMutation = useMarkMentoringSessionOutcomeMutation();

  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [rescheduleError, setRescheduleError] = useState('');
  const [actionSessionId, setActionSessionId] = useState<string | null>(null);
  const [actionMode, setActionMode] = useState<
    'cancel' | 'complete' | 'mentee-no-show' | 'mentor-no-show' | null
  >(null);
  const [actionNoteBySession, setActionNoteBySession] = useState<
    Record<string, string>
  >({});
  const [cancelIssueTypeBySession, setCancelIssueTypeBySession] = useState<
    Record<string, CancelIssueType>
  >({});

  const closeInlineAction = () => {
    setActionSessionId(null);
    setActionMode(null);
  };

  const handleCancelSession = (sessionId: string) => {
    const reason = actionNoteBySession[sessionId] ?? '';
    const issueType = cancelIssueTypeBySession[sessionId] ?? 'MENTOR_CANCELLED';
    cancelSessionMutation
      .mutateAsync({ mentorId, sessionId, reason, issueType })
      .then(() => {
        closeInlineAction();
        setActionNoteBySession((prev) => ({ ...prev, [sessionId]: '' }));
        setCancelIssueTypeBySession((prev) => ({
          ...prev,
          [sessionId]: 'MENTOR_CANCELLED',
        }));
        showToast('일정을 취소했습니다.', 'success');
      })
      .catch((error) => {
        showToast(
          error instanceof Error ? error.message : '일정 취소에 실패했습니다.',
          'error',
        );
      });
  };

  const handleMarkSessionOutcome = (
    sessionId: string,
    outcome: 'COMPLETED' | 'MENTEE_NO_SHOW' | 'MENTOR_NO_SHOW',
  ) => {
    const note = actionNoteBySession[sessionId] ?? '';
    markSessionOutcomeMutation
      .mutateAsync({
        mentorId,
        sessionId,
        outcome,
        note,
      })
      .then(() => {
        closeInlineAction();
        setActionNoteBySession((prev) => ({ ...prev, [sessionId]: '' }));
        showToast(
          outcome === 'COMPLETED'
            ? '상담을 완료 처리했습니다.'
            : '노쇼 처리 결과를 기록했습니다.',
          'success',
        );
      })
      .catch((error) => {
        showToast(
          error instanceof Error ? error.message : '상담 처리에 실패했습니다.',
          'error',
        );
      });
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    if (date) {
      setCurrentCalendarMonth(dayjs(date));
    }
  };

  const pendingWithSchedule = useMemo(() => {
    return requests.filter(
      (r): r is MentoringRequest & { preferredDate: string } =>
        r.status === 'PENDING' && !!r.preferredDate,
    );
  }, [requests]);

  const filteredSessions = useMemo(() => {
    if (!selectedDate) return sessions;

    return sessions.filter(
      (s) => dayjs(s.startsAt).format('YYYY-MM-DD') === selectedDate,
    );
  }, [selectedDate, sessions]);

  const filteredPending = useMemo(() => {
    if (!selectedDate) return pendingWithSchedule;

    return pendingWithSchedule.filter((r) => r.preferredDate === selectedDate);
  }, [selectedDate, pendingWithSchedule]);

  const overlappingIds = useMemo(() => getOverlappingIds(sessions), [sessions]);
  const overlapPairCount = Math.floor(overlappingIds.size / 2);
  const followUpSessionCount = useMemo(() => {
    return sessions.filter((session) => {
      return (
        session.issueType !== undefined &&
        session.issueType !== 'NONE' &&
        session.status !== 'SCHEDULED'
      );
    }).length;
  }, [sessions]);
  const issuePlaybook = getMentoringIssuePlaybook({
    viewer: 'mentor',
  });

  const todaySessionCount = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');

    return sessions.filter((s) => {
      return (
        s.status === 'SCHEDULED' &&
        dayjs(s.startsAt).format('YYYY-MM-DD') === today
      );
    }).length;
  }, [sessions]);

  const editingSession = useMemo(() => {
    if (!editingSessionId) return undefined;

    return sessions.find((s) => s.id === editingSessionId);
  }, [editingSessionId, sessions]);

  const handleReschedule = (payload: ScheduleEditorSubmitPayload) => {
    if (!editingSession) return;

    rescheduleSessionMutation
      .mutateAsync({
        mentorId,
        sessionId: editingSession.id,
        startsAt: payload.startsAt,
        endsAt: payload.endsAt,
        placeNote: payload.placeNote,
        mentorNote: payload.mentorNote,
      })
      .then(() => {
        setRescheduleError('');
        setEditingSessionId(null);
        showToast('일정을 변경했습니다.', 'success');
      })
      .catch((error) => {
        const reason =
          error instanceof Error ? error.message : '일정 변경에 실패했습니다.';
        setRescheduleError(reason);
        showToast(reason, 'error');
      });
  };

  return (
    <>
      <section className="flex flex-col gap-200">
        {/* 헤더 */}
        <div className="flex flex-wrap items-center justify-between gap-100">
          <div>
            <h3 className="font-designer-20b text-text-default">일정 관리</h3>
            <p className="font-designer-14r text-text-subtle mt-50">
              월별 달력으로 일정을 확인하고 중복 예약을 방지합니다.
            </p>
          </div>
          <div className="flex items-center gap-75">
            <Badge color="green" shape="round">
              오늘 {todaySessionCount}건
            </Badge>
            <Badge color={overlapPairCount > 0 ? 'red' : 'blue'} shape="round">
              중복 {overlapPairCount}건
            </Badge>
          </div>
        </div>

        {/* 중복 경고 배너 */}
        {overlapPairCount > 0 && (
          <div className="rounded-100 bg-background-accent-red-subtle flex items-start gap-100 px-150 py-125">
            <AlertTriangle className="text-text-error mt-25 h-16 w-16 shrink-0" />
            <div>
              <p className="font-designer-13b text-text-error">
                시간이 겹치는 일정이 {overlapPairCount}쌍 있습니다
              </p>
              <p className="font-designer-12r text-text-error mt-25">
                빨간 테두리 카드를 확인하고 일정을 변경해주세요.
              </p>
            </div>
          </div>
        )}

        <SurfacePanel radius="md" className="px-200 py-150">
          <div className="mb-100 flex flex-wrap items-center justify-between gap-75">
            <h4 className="font-designer-14b text-text-default">
              {issuePlaybook.title}
            </h4>
            <div className="flex flex-wrap gap-50">
              <Badge color="blue" shape="round">
                시작 전 변경/취소
              </Badge>
              <Badge color="orange" shape="round">
                후속 기록 {followUpSessionCount}건
              </Badge>
            </div>
          </div>
          <div className="space-y-75">
            {issuePlaybook.items.map((item, index) => (
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
        </SurfacePanel>

        {/* 월별 달력 */}
        <MentoringScheduleCalendar
          sessions={sessions}
          pendingRequests={pendingWithSchedule}
          selectedDate={selectedDate}
          currentMonth={currentCalendarMonth}
          onDateSelect={handleDateSelect}
          onMonthChange={setCurrentCalendarMonth}
        />

        {/* ── 확정 일정 섹션 ── */}
        <div className="rounded-100 border-border-subtle flex items-center justify-between border px-150 py-100">
          <p className="font-designer-13r text-text-subtle">
            {selectedDate
              ? `${dayjs(selectedDate).format('M월 D일')} 확정 일정 (${filteredSessions.length}건)`
              : `확정 일정 (${sessions.length}건)`}
          </p>
          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate('')}
              className="font-designer-12m text-text-brand hover:text-text-default"
            >
              전체 보기
            </button>
          )}
        </div>

        {filteredSessions.length === 0 ? (
          <SurfacePanel radius="md" className="px-200 py-250 text-center">
            <p className="font-designer-16b text-text-default">
              {selectedDate
                ? `${dayjs(selectedDate).format('M월 D일')}에 확정 일정이 없습니다.`
                : '확정된 일정이 없습니다.'}
            </p>
            <p className="font-designer-13r text-text-subtle mt-50">
              {selectedDate
                ? '달력에서 다른 날짜를 선택하거나 전체 보기를 눌러보세요.'
                : '신청을 수락하면 확정 일정이 여기에 표시됩니다.'}
            </p>
          </SurfacePanel>
        ) : (
          <SurfacePanel radius="lg" overflow="hidden">
            {/* 테이블 헤더 */}
            <div className="border-border-subtle bg-background-alternative grid grid-cols-[75px_140px_80px_125px_120px_100px] gap-100 border-b px-200 py-150">
              <div className="font-designer-14b text-text-default">상태</div>
              <div className="font-designer-14b text-text-default">신청자</div>
              <div className="font-designer-14b text-text-default">
                멘토링 방식
              </div>
              <div className="font-designer-14b text-text-default">
                멘토링 일정
              </div>
              <div className="font-designer-14b text-text-default">
                일정 수정
              </div>
              <div className="font-designer-14b text-text-default text-right">
                상세 정보
              </div>
            </div>

            {/* 테이블 바디 */}
            <div className="divide-border-subtle divide-y">
              {filteredSessions.map((session) => {
                const actionNote = actionNoteBySession[session.id] ?? '';
                const isScheduled = session.status === 'SCHEDULED';
                const isOverlapping = overlappingIds.has(session.id);
                const relatedRequest = requests.find(
                  (r) => r.id === session.requestId,
                );
                const hasStarted = dayjs().isAfter(dayjs(session.startsAt));
                const canMarkNoShow = dayjs().isAfter(
                  dayjs(session.startsAt).add(10, 'minute'),
                );
                const issueMeta =
                  session.issueType && session.issueType !== 'NONE'
                    ? MENTORING_SESSION_ISSUE_META[session.issueType]
                    : null;
                const isInlineActionOpen = actionSessionId === session.id;
                const cancelIssueType =
                  cancelIssueTypeBySession[session.id] ?? 'MENTOR_CANCELLED';
                const actionTitle =
                  actionMode === 'complete'
                    ? '완료 메모'
                    : actionMode === 'mentee-no-show'
                      ? '멘티 노쇼 메모'
                      : actionMode === 'mentor-no-show'
                        ? '멘토 노쇼 메모'
                        : cancelIssueType === 'MENTEE_CANCELLED'
                          ? '멘티 취소 사유'
                          : '멘토 취소 사유';
                const actionPlaceholder =
                  actionMode === 'complete'
                    ? '상담을 마무리하며 남길 메모가 있으면 적어주세요.'
                    : actionMode === 'mentee-no-show'
                      ? '노쇼 판단 근거와 후속 안내를 남겨주세요.'
                      : actionMode === 'mentor-no-show'
                        ? '멘토 미입장 사유와 후속 안내를 남겨주세요.'
                        : cancelIssueType === 'MENTEE_CANCELLED'
                          ? '멘티 취소 요청 사유와 후속 안내를 남겨주세요.'
                          : '멘티가 다음 행동을 알 수 있게 멘토 취소 이유를 남겨주세요.';
                const actionConfirmLabel =
                  actionMode === 'complete'
                    ? '상담 완료 처리'
                    : actionMode === 'mentee-no-show'
                      ? '멘티 노쇼 기록'
                      : actionMode === 'mentor-no-show'
                        ? '멘토 노쇼 기록'
                        : cancelIssueType === 'MENTEE_CANCELLED'
                          ? '멘티 취소 기록'
                          : '멘토 취소 확정';

                return (
                  <div
                    key={session.id}
                    className={`hover:bg-background-alternative grid grid-cols-[75px_140px_80px_125px_120px_100px] gap-100 px-200 py-200 transition-colors ${
                      isOverlapping && isScheduled
                        ? 'bg-background-accent-red-subtle'
                        : ''
                    }`}
                  >
                    {/* 상태 */}
                    <div className="flex items-start pt-[2px]">
                      <Badge
                        color={
                          MENTORING_SESSION_STATUS_META[session.status].color
                        }
                        shape="round"
                      >
                        {MENTORING_SESSION_STATUS_META[session.status].label}
                      </Badge>
                    </div>

                    {/* 신청자 */}
                    <div className="flex flex-col gap-50">
                      <p className="font-designer-15b text-text-default">
                        {session.menteeName}
                      </p>
                      <p className="font-designer-12r text-text-subtle">
                        {session.method === 'offline'
                          ? session.placeNote?.trim() ||
                            '장소를 아직 확정하지 않았습니다.'
                          : '기본 진행 채널: 디스코드'}
                      </p>
                      {relatedRequest?.requestTitle?.trim() ? (
                        <p className="font-designer-12r text-text-subtle line-clamp-1">
                          {relatedRequest.requestTitle.trim()}
                        </p>
                      ) : null}
                      {issueMeta ? (
                        <p className="font-designer-12r text-text-subtle">
                          운영 상태: {issueMeta.label}
                        </p>
                      ) : null}
                    </div>

                    {/* 멘토링 방식 */}
                    <div className="flex items-start pt-[2px]">
                      <Badge color="blue" shape="round">
                        {getMethodLabel(session.method)}
                      </Badge>
                    </div>

                    {/* 멘토링 일정 */}
                    <div className="flex flex-col gap-50">
                      <p className="font-designer-14r text-text-default">
                        {dayjs(session.startsAt).format('YY. MM. DD. (ddd)')}
                      </p>
                      <p className="font-designer-14r text-text-default">
                        {dayjs(session.startsAt).format('HH:mm')}~
                        {dayjs(session.endsAt).format('HH:mm')}
                      </p>
                      {session.operationNote?.trim() ? (
                        <p className="font-designer-12r text-text-subtle line-clamp-2">
                          {session.operationNote.trim()}
                        </p>
                      ) : null}
                    </div>

                    {/* 일정 수정 - 일정 변경/취소 버튼 (세로 배치) */}
                    <div className="flex flex-col items-start gap-75 pt-[2px]">
                      {isScheduled ? (
                        hasStarted ? (
                          <>
                            <Button
                              type="button"
                              size="small"
                              color="primary"
                              onClick={() => {
                                setActionSessionId(session.id);
                                setActionMode('complete');
                              }}
                            >
                              완료 처리
                            </Button>
                            <Button
                              type="button"
                              size="small"
                              color="outlined"
                              disabled={!canMarkNoShow}
                              onClick={() => {
                                setActionSessionId(session.id);
                                setActionMode('mentee-no-show');
                              }}
                            >
                              멘티 노쇼
                            </Button>
                            <Button
                              type="button"
                              size="small"
                              color="secondary"
                              disabled={!canMarkNoShow}
                              onClick={() => {
                                setActionSessionId(session.id);
                                setActionMode('mentor-no-show');
                              }}
                            >
                              멘토 노쇼
                            </Button>
                            {!canMarkNoShow ? (
                              <p className="font-designer-11r text-text-subtlest">
                                노쇼 기록은 시작 10분 후부터 열립니다.
                              </p>
                            ) : null}
                          </>
                        ) : (
                          <>
                            <Button
                              type="button"
                              size="small"
                              color="primary"
                              onClick={() => {
                                setEditingSessionId(session.id);
                                setRescheduleError('');
                              }}
                            >
                              일정 변경
                            </Button>
                            <Button
                              type="button"
                              size="small"
                              color="outlined"
                              onClick={() => {
                                setActionSessionId(session.id);
                                setActionMode('cancel');
                              }}
                            >
                              일정 취소
                            </Button>
                          </>
                        )
                      ) : (
                        <div className="flex flex-col items-start gap-50">
                          {issueMeta ? (
                            <Badge color={issueMeta.color} shape="round">
                              {issueMeta.label}
                            </Badge>
                          ) : null}
                          {!issueMeta ? (
                            <span className="font-designer-13r text-text-subtle">
                              -
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* 상세 정보 - 상세 정보 버튼 */}
                    <div className="flex items-start justify-end pt-[2px]">
                      <Link
                        href={`/mentoring-management/requests?id=${session.requestId}`}
                      >
                        <Button size="small" color="outlined">
                          상세 정보 &gt;
                        </Button>
                      </Link>
                    </div>

                    {/* 일정 처리 폼 (전체 너비로 표시) */}
                    {isScheduled && isInlineActionOpen && actionMode && (
                      <div className="rounded-100 bg-background-alternative col-span-6 mt-100 p-150">
                        <p className="font-designer-14b text-text-default mb-100">
                          {actionTitle}
                        </p>
                        {actionMode === 'cancel' ? (
                          <div className="mb-100 space-y-100">
                            <div className="flex flex-wrap gap-75">
                              <Button
                                type="button"
                                size="small"
                                color={
                                  cancelIssueType === 'MENTOR_CANCELLED'
                                    ? 'primary'
                                    : 'outlined'
                                }
                                onClick={() =>
                                  setCancelIssueTypeBySession((prev) => ({
                                    ...prev,
                                    [session.id]: 'MENTOR_CANCELLED',
                                  }))
                                }
                              >
                                멘토 취소
                              </Button>
                              <Button
                                type="button"
                                size="small"
                                color={
                                  cancelIssueType === 'MENTEE_CANCELLED'
                                    ? 'primary'
                                    : 'outlined'
                                }
                                onClick={() =>
                                  setCancelIssueTypeBySession((prev) => ({
                                    ...prev,
                                    [session.id]: 'MENTEE_CANCELLED',
                                  }))
                                }
                              >
                                멘티 취소
                              </Button>
                            </div>
                            <div className="rounded-100 border-border-subtle bg-background-default border px-125 py-100">
                              <p className="font-designer-12m text-text-subtle">
                                예상 후속 처리
                              </p>
                              <p className="font-designer-12r text-text-default mt-25">
                                {getCancelPreview({
                                  startsAt: session.startsAt,
                                  issueType: cancelIssueType,
                                })}
                              </p>
                            </div>
                          </div>
                        ) : null}
                        <textarea
                          value={actionNote}
                          onChange={(event) =>
                            setActionNoteBySession((prev) => ({
                              ...prev,
                              [session.id]: event.target.value,
                            }))
                          }
                          className="font-designer-14r rounded-100 border-border-subtle bg-background-default text-text-default min-h-[92px] w-full border px-150 py-125"
                          placeholder={actionPlaceholder}
                        />
                        <div className="mt-100 flex justify-end gap-100">
                          <Button
                            type="button"
                            size="small"
                            color="secondary"
                            onClick={closeInlineAction}
                          >
                            취소
                          </Button>
                          <Button
                            type="button"
                            size="small"
                            color={
                              actionMode === 'cancel' ? 'outlined' : 'primary'
                            }
                            onClick={() => {
                              if (actionMode === 'cancel') {
                                handleCancelSession(session.id);

                                return;
                              }

                              if (actionMode === 'complete') {
                                handleMarkSessionOutcome(
                                  session.id,
                                  'COMPLETED',
                                );

                                return;
                              }

                              if (actionMode === 'mentee-no-show') {
                                handleMarkSessionOutcome(
                                  session.id,
                                  'MENTEE_NO_SHOW',
                                );

                                return;
                              }

                              handleMarkSessionOutcome(
                                session.id,
                                'MENTOR_NO_SHOW',
                              );
                            }}
                          >
                            {actionConfirmLabel}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SurfacePanel>
        )}

        {/* ── 미확정 예정 섹션 ── */}
        {(filteredPending.length > 0 || pendingWithSchedule.length > 0) && (
          <>
            <div className="rounded-100 border-border-warning flex items-center justify-between border px-150 py-100">
              <p className="font-designer-13r text-text-warning">
                {selectedDate
                  ? `${dayjs(selectedDate).format('M월 D일')} 미확정 예정 (${filteredPending.length}건)`
                  : `미확정 예정 (${pendingWithSchedule.length}건)`}
              </p>
              <p className="font-designer-12r text-text-warning">
                수락하면 확정 일정으로 이동됩니다
              </p>
            </div>

            {filteredPending.length === 0 ? (
              <SurfacePanel radius="md" className="px-200 py-200 text-center">
                <p className="font-designer-14r text-text-subtle">
                  {selectedDate
                    ? `${dayjs(selectedDate).format('M월 D일')}에 미확정 예정이 없습니다.`
                    : '이 날짜에 해당하는 미확정 예정이 없습니다.'}
                </p>
              </SurfacePanel>
            ) : (
              <SurfacePanel
                radius="lg"
                overflow="hidden"
                className="border-border-warning"
              >
                {/* 테이블 헤더 */}
                <div className="border-border-subtle bg-background-alternative grid grid-cols-[75px_140px_80px_125px_120px_100px] gap-100 border-b px-200 py-150">
                  <div className="font-designer-14b text-text-default">
                    상태
                  </div>
                  <div className="font-designer-14b text-text-default">
                    신청자
                  </div>
                  <div className="font-designer-14b text-text-default">
                    멘토링 방식
                  </div>
                  <div className="font-designer-14b text-text-default">
                    멘토링 일정
                  </div>
                  <div className="font-designer-14b text-text-default">
                    일정 수정
                  </div>
                  <div className="font-designer-14b text-text-default text-right">
                    상세 정보
                  </div>
                </div>

                {/* 테이블 바디 */}
                <div className="divide-border-subtle divide-y">
                  {filteredPending.map((request) => (
                    <div
                      key={request.id}
                      className="hover:bg-background-alternative grid grid-cols-[75px_140px_80px_125px_120px_100px] gap-100 px-200 py-200 transition-colors"
                    >
                      {/* 상태 */}
                      <div className="flex items-start pt-[2px]">
                        <Badge color="orange" shape="round">
                          미확정
                        </Badge>
                      </div>

                      {/* 신청자 */}
                      <div className="flex flex-col gap-50">
                        <p className="font-designer-15b text-text-default">
                          {request.menteeName}
                        </p>
                        <p className="font-designer-12r text-text-subtle">
                          {request.method === 'offline'
                            ? '수락 후 장소 안내'
                            : '수락 후 진행 채널 안내'}
                        </p>
                        <p className="font-designer-12r text-text-subtle">
                          상세 화면에서 수락 후 일정 확정
                        </p>
                      </div>

                      {/* 멘토링 방식 */}
                      <div className="flex items-start pt-[2px]">
                        <Badge color="blue" shape="round">
                          {getMethodLabel(request.method)}
                        </Badge>
                      </div>

                      {/* 멘토링 일정 */}
                      <div className="flex flex-col gap-50">
                        <p className="font-designer-14r text-text-warning">
                          {dayjs(request.preferredDate).format(
                            'YY. MM. DD. (ddd)',
                          )}
                        </p>
                        <p className="font-designer-14r text-text-warning">
                          {request.preferredTime || '시간 미정'}
                        </p>
                        <p className="font-designer-12r text-text-subtle">
                          멘티 희망
                        </p>
                      </div>

                      {/* 일정 수정 - 일정 변경/취소 버튼 (세로 배치, 비활성) */}
                      <div className="flex flex-col items-start gap-75 pt-[2px]">
                        <Button
                          type="button"
                          size="small"
                          color="primary"
                          disabled
                        >
                          일정 변경
                        </Button>
                        <Button
                          type="button"
                          size="small"
                          color="outlined"
                          disabled
                        >
                          일정 취소
                        </Button>
                      </div>

                      {/* 상세 정보 - 상세 정보 버튼 */}
                      <div className="flex items-start justify-end pt-[2px]">
                        <Link
                          href={`/mentoring-management/requests?id=${request.id}`}
                        >
                          <Button size="small" color="outlined">
                            상세 정보 &gt;
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </SurfacePanel>
            )}
          </>
        )}
      </section>

      <ScheduleEditorModal
        open={!!editingSession}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSessionId(null);
            setRescheduleError('');
          }
        }}
        title="확정 일정 변경"
        description="변경된 일정은 신청 대화에 자동으로 기록됩니다."
        confirmLabel="일정 변경 저장"
        method={editingSession?.method ?? 'simple'}
        durationMinutes={
          editingSession ? methodDurations[editingSession.method] : 30
        }
        defaultDate={
          editingSession
            ? dayjs(editingSession.startsAt).format('YYYY-MM-DD')
            : undefined
        }
        defaultTime={
          editingSession
            ? dayjs(editingSession.startsAt).format('HH:mm')
            : undefined
        }
        defaultPlaceNote={editingSession?.placeNote}
        errorMessage={rescheduleError}
        sessions={sessions}
        excludeSessionId={editingSessionId ?? undefined}
        onConfirm={handleReschedule}
      />
    </>
  );
}
