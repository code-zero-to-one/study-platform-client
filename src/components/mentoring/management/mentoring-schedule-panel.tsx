'use client';

import dayjs from 'dayjs';
import { CalendarClock, CalendarX2, MapPin } from 'lucide-react';
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
  type MentoringSession,
  useMentoringManagementStore,
} from '@/stores/useMentoringManagementStore';
import ScheduleEditorModal, {
  type ScheduleEditorSubmitPayload,
} from './schedule-editor-modal';

interface MentoringSchedulePanelProps {
  mentorId: number;
  methodDurations: Record<MentoringMethodType, number>;
}

const statusLabelMap = {
  SCHEDULED: '확정',
  COMPLETED: '완료',
  CANCELLED: '취소',
} as const;

const statusColorMap = {
  SCHEDULED: 'green',
  COMPLETED: 'blue',
  CANCELLED: 'red',
} as const;

const getOverlapCount = (sessions: MentoringSession[]) => {
  const scheduled = sessions
    .filter((session) => session.status === 'SCHEDULED')
    .sort((first, second) => {
      return dayjs(first.startsAt).valueOf() - dayjs(second.startsAt).valueOf();
    });
  let overlaps = 0;

  for (let index = 0; index < scheduled.length; index += 1) {
    const base = scheduled[index];
    const baseEnd = dayjs(base.endsAt);

    for (
      let nextIndex = index + 1;
      nextIndex < scheduled.length;
      nextIndex += 1
    ) {
      const candidate = scheduled[nextIndex];
      const candidateStart = dayjs(candidate.startsAt);
      if (!candidateStart.isBefore(baseEnd)) {
        break;
      }

      overlaps += 1;
    }
  }

  return overlaps;
};

export default function MentoringSchedulePanel({
  mentorId,
  methodDurations,
}: MentoringSchedulePanelProps) {
  const { showToast } = useToastStore();
  const sessions = useMentoringManagementStore(
    (state) => state.sessionsByMentor[mentorId] ?? [],
  );
  const rescheduleSession = useMentoringManagementStore(
    (state) => state.rescheduleSession,
  );
  const cancelSession = useMentoringManagementStore(
    (state) => state.cancelSession,
  );

  const [dateFilter, setDateFilter] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [rescheduleError, setRescheduleError] = useState('');
  const [cancellingSessionId, setCancellingSessionId] = useState<string | null>(
    null,
  );
  const [cancelReasonBySession, setCancelReasonBySession] = useState<
    Record<string, string>
  >({});

  const filteredSessions = useMemo(() => {
    if (!dateFilter) {
      return sessions;
    }

    return sessions.filter((session) => {
      return dayjs(session.startsAt).format('YYYY-MM-DD') === dateFilter;
    });
  }, [dateFilter, sessions]);

  const overlapCount = useMemo(() => {
    return getOverlapCount(sessions);
  }, [sessions]);

  const todaySessionCount = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');

    return sessions.filter((session) => {
      return (
        session.status === 'SCHEDULED' &&
        dayjs(session.startsAt).format('YYYY-MM-DD') === today
      );
    }).length;
  }, [sessions]);

  const editingSession = useMemo(() => {
    if (!editingSessionId) {
      return undefined;
    }

    return sessions.find((session) => session.id === editingSessionId);
  }, [editingSessionId, sessions]);

  const handleReschedule = (payload: ScheduleEditorSubmitPayload) => {
    if (!editingSession) {
      return;
    }

    const result = rescheduleSession({
      mentorId,
      sessionId: editingSession.id,
      startsAt: payload.startsAt,
      endsAt: payload.endsAt,
      placeNote: payload.placeNote,
      mentorNote: payload.mentorNote,
    });

    if (!result.ok) {
      const reason = result.reason ?? '일정 변경에 실패했습니다.';
      setRescheduleError(reason);
      showToast(reason, 'error');

      return;
    }

    setRescheduleError('');
    setEditingSessionId(null);
    showToast('일정을 변경했습니다.', 'success');
  };

  const handleCancelSession = (sessionId: string) => {
    const reason = cancelReasonBySession[sessionId] ?? '';
    const result = cancelSession({
      mentorId,
      sessionId,
      reason,
    });

    if (!result.ok) {
      showToast(result.reason ?? '일정 취소에 실패했습니다.', 'error');

      return;
    }

    setCancellingSessionId(null);
    setCancelReasonBySession((prev) => ({
      ...prev,
      [sessionId]: '',
    }));
    showToast('일정을 취소했습니다.', 'success');
  };

  return (
    <>
      <section className="rounded-200 border-border-subtle bg-background-default border p-300">
        <header className="mb-200 flex flex-wrap items-center justify-between gap-100">
          <div>
            <h3 className="font-designer-20b text-text-default">일정 관리</h3>
            <p className="font-designer-14r text-text-subtle mt-50">
              확정된 상담 일정을 변경하거나 취소하고, 같은 시간 중복 예약을
              방지합니다.
            </p>
          </div>
          <div className="flex items-center gap-75">
            <Badge color="green" shape="round">
              오늘 일정 {todaySessionCount}건
            </Badge>
            <Badge color={overlapCount > 0 ? 'red' : 'blue'} shape="round">
              중복 리스크 {overlapCount}건
            </Badge>
          </div>
        </header>

        <div className="rounded-100 bg-background-alternative mb-150 px-150 py-125">
          <div className="flex flex-wrap items-center justify-between gap-100">
            <p className="font-designer-13r text-text-subtle">
              날짜별로 일정을 빠르게 조회할 수 있어요.
            </p>
            <div className="w-[220px]">
              <BaseInput
                type="date"
                value={dateFilter}
                onValueChange={setDateFilter}
                size="m"
              />
            </div>
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="rounded-150 border-border-subtle border px-200 py-250 text-center">
            <p className="font-designer-16b text-text-default">
              조건에 맞는 일정이 없습니다.
            </p>
            <p className="font-designer-13r text-text-subtle mt-50">
              신청을 수락하면 확정 일정이 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="space-y-150">
            {filteredSessions.map((session) => {
              const cancelReason = cancelReasonBySession[session.id] ?? '';
              const isScheduled = session.status === 'SCHEDULED';

              return (
                <article
                  key={session.id}
                  className="rounded-150 border-border-subtle border p-200"
                >
                  <div className="mb-100 flex flex-wrap items-center justify-between gap-100">
                    <div className="flex items-center gap-75">
                      <CalendarClock className="text-text-subtle h-16 w-16" />
                      <p className="font-designer-16b text-text-default">
                        {session.menteeName}
                      </p>
                      <Badge color="blue" shape="round">
                        {getMethodLabel(session.method)}
                      </Badge>
                    </div>
                    <Badge color={statusColorMap[session.status]} shape="round">
                      {statusLabelMap[session.status]}
                    </Badge>
                  </div>

                  <p className="font-designer-16b text-text-default mb-75">
                    {dayjs(session.startsAt).format('YYYY.MM.DD HH:mm')} ~{' '}
                    {dayjs(session.endsAt).format('HH:mm')}
                  </p>

                  <p className="font-designer-13r text-text-subtle inline-flex items-center gap-50">
                    <MapPin className="h-14 w-14" />
                    {session.placeNote}
                  </p>

                  {isScheduled && (
                    <div className="mt-125 flex flex-wrap gap-100">
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
                        icon={<CalendarX2 className="h-14 w-14" />}
                        onClick={() => setCancellingSessionId(session.id)}
                      >
                        일정 취소
                      </Button>
                    </div>
                  )}

                  {isScheduled && cancellingSessionId === session.id && (
                    <div className="rounded-100 bg-background-alternative mt-125 p-125">
                      <p className="font-designer-13b text-text-default mb-75">
                        취소 사유
                      </p>
                      <textarea
                        value={cancelReason}
                        onChange={(event) =>
                          setCancelReasonBySession((prev) => ({
                            ...prev,
                            [session.id]: event.target.value,
                          }))
                        }
                        className="font-designer-13r rounded-100 border-border-subtle bg-background-default text-text-default min-h-[92px] w-full border px-125 py-100"
                        placeholder="멘티가 다음 일정을 잡을 수 있도록 취소 이유를 남겨주세요."
                      />
                      <div className="mt-100 flex flex-wrap justify-end gap-75">
                        <Button
                          type="button"
                          size="xsmall"
                          color="secondary"
                          onClick={() => setCancellingSessionId(null)}
                        >
                          취소
                        </Button>
                        <Button
                          type="button"
                          size="xsmall"
                          color="outlined"
                          onClick={() => handleCancelSession(session.id)}
                        >
                          일정 취소 확정
                        </Button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
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
        onConfirm={handleReschedule}
      />
    </>
  );
}
