'use client';

import dayjs from 'dayjs';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import SurfacePanel from '@/components/ui/surface-panel';
import { MENTORING_SESSION_STATUS_META } from '@/features/mentoring/model/management-status-meta';
import { getMethodLabel } from '@/mocks/mentoring-mock-data';
import { useToastStore } from '@/stores/use-toast-store';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import type {
  MentoringRequest,
  MentoringSession,
} from '@/types/mentoring/management-domain';
import type { MentoringSchedulePanelProps } from '@/types/mentoring/management-view';
import MentoringScheduleCalendar from './mentoring-schedule-calendar';
import ScheduleEditorModal, {
  type ScheduleEditorSubmitPayload,
} from './schedule-editor-modal';

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

export default function MentoringSchedulePanel({
  mentorId,
  methodDurations,
}: MentoringSchedulePanelProps) {
  const { showToast } = useToastStore();
  const sessions = useMentoringManagementStore(
    (state) => state.sessionsByMentor[mentorId] ?? [],
  );
  const requests = useMentoringManagementStore(
    (state) => state.requestsByMentor[mentorId] ?? [],
  );
  const rescheduleSession = useMentoringManagementStore(
    (state) => state.rescheduleSession,
  );
  const cancelSession = useMentoringManagementStore(
    (state) => state.cancelSession,
  );

  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [rescheduleError, setRescheduleError] = useState('');
  const [cancellingSessionId, setCancellingSessionId] = useState<string | null>(
    null,
  );
  const [cancelReasonBySession, setCancelReasonBySession] = useState<
    Record<string, string>
  >({});

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
    const result = cancelSession({ mentorId, sessionId, reason });

    if (!result.ok) {
      showToast(result.reason ?? '일정 취소에 실패했습니다.', 'error');

      return;
    }

    setCancellingSessionId(null);
    setCancelReasonBySession((prev) => ({ ...prev, [sessionId]: '' }));
    showToast('일정을 취소했습니다.', 'success');
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
                const cancelReason = cancelReasonBySession[session.id] ?? '';
                const isScheduled = session.status === 'SCHEDULED';
                const isOverlapping = overlappingIds.has(session.id);
                const relatedRequest = requests.find(
                  (r) => r.id === session.requestId,
                );

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
                        📞 {relatedRequest ? '+82 010XXXX' : '수락 후'}
                      </p>
                      <p className="font-designer-12r text-text-subtle">
                        ✉️ {relatedRequest ? 'mentee@ex..' : '수락 후'}
                      </p>
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
                    </div>

                    {/* 일정 수정 - 일정 변경/취소 버튼 (세로 배치) */}
                    <div className="flex flex-col items-start gap-75 pt-[2px]">
                      {isScheduled ? (
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
                            onClick={() => setCancellingSessionId(session.id)}
                          >
                            일정 취소
                          </Button>
                        </>
                      ) : (
                        <span className="font-designer-13r text-text-subtle">
                          -
                        </span>
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

                    {/* 일정 취소 폼 (전체 너비로 표시) */}
                    {isScheduled && cancellingSessionId === session.id && (
                      <div className="rounded-100 bg-background-alternative col-span-6 mt-100 p-150">
                        <p className="font-designer-14b text-text-default mb-100">
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
                          className="font-designer-14r rounded-100 border-border-subtle bg-background-default text-text-default min-h-[92px] w-full border px-150 py-125"
                          placeholder="멘티가 다음 일정을 잡을 수 있도록 취소 이유를 남겨주세요."
                        />
                        <div className="mt-100 flex justify-end gap-100">
                          <Button
                            type="button"
                            size="small"
                            color="secondary"
                            onClick={() => setCancellingSessionId(null)}
                          >
                            취소
                          </Button>
                          <Button
                            type="button"
                            size="small"
                            color="outlined"
                            onClick={() => handleCancelSession(session.id)}
                          >
                            일정 취소 확정
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
                          📞 수락 후
                        </p>
                        <p className="font-designer-12r text-text-subtle">
                          ✉️ 수락 후
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
