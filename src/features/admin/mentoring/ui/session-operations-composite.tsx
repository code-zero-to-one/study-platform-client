import dayjs from 'dayjs';
import Link from 'next/link';
import Badge from '@/components/ui/badge';
import { NativeSelect } from '@/components/ui/input';
import MetricCard from '@/components/ui/metric-card';
import SurfacePanel from '@/components/ui/surface-panel';
import {
  DataTable,
  DataTableCell,
  DataTableHead,
  DataTableHeadCell,
  DataTableRow,
} from '@/components/ui/table/data-table';
import {
  MENTORING_PAYMENT_STATUS_META,
  MENTORING_REQUEST_STATUS_META,
  MENTORING_SESSION_STATUS_META,
} from '@/features/mentoring/model/management-status-meta';
import MentoringTablePanel from '@/features/mentoring/ui/common/mentoring-table-panel';
import { getMethodLabel } from '@/mocks/mentoring-mock-data';
import type { AdminMentorItem } from '@/types/mentoring/admin-domain';
import type {
  SessionMentorFilter,
  SessionRequestRow,
  SessionScheduleRow,
} from '@/types/mentoring/admin-session-operations-view';

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
interface SessionOperationsFiltersProps {
  mentors: AdminMentorItem[];
  selectedMentorId: SessionMentorFilter;
  readyToProcessCount: number;
  onSelectMentorId: (mentorId: SessionMentorFilter) => void;
}

export function SessionOperationsFilters({
  mentors,
  selectedMentorId,
  readyToProcessCount,
  onSelectMentorId,
}: SessionOperationsFiltersProps) {
  return (
    <SurfacePanel className="p-200">
      <div className="flex flex-wrap items-center gap-100">
        <p className="font-designer-14b text-text-default">멘토별 현황</p>
        <NativeSelect
          value={selectedMentorId === 'ALL' ? 'ALL' : String(selectedMentorId)}
          onChange={(event) => {
            const value = event.target.value;
            if (value === 'ALL') {
              onSelectMentorId('ALL');

              return;
            }

            const mentorId = Number(value);
            if (!Number.isFinite(mentorId)) {
              onSelectMentorId('ALL');

              return;
            }

            onSelectMentorId(mentorId);
          }}
          className="min-w-[220px]"
        >
          <option value="ALL">전체 멘토</option>
          {mentors.map((mentor) => (
            <option key={mentor.mentorId} value={mentor.mentorId}>
              #{mentor.mentorId}
              {mentor.memberId ? ` (사용자 #${mentor.memberId})` : ''}
            </option>
          ))}
        </NativeSelect>
        <p className="font-designer-13r text-text-subtle">
          결제 확인 후 멘토 처리 가능 대기: {readyToProcessCount}건
        </p>
      </div>
    </SurfacePanel>
  );
}

interface SessionOperationsGridProps {
  totalRequestCount: number;
  pendingPaymentCount: number;
  confirmedPaymentCount: number;
  scheduledSessionCount: number;
}

export function SessionOperationsGrid({
  totalRequestCount,
  pendingPaymentCount,
  confirmedPaymentCount,
  scheduledSessionCount,
}: SessionOperationsGridProps) {
  return (
    <section className="grid grid-cols-1 gap-200 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        className="bg-background-accent-blue-subtle"
        label="전체 신청"
        value={`${totalRequestCount}건`}
      />
      <MetricCard
        className="bg-background-accent-orange-subtle"
        label="결제 대기"
        value={`${pendingPaymentCount}건`}
      />
      <MetricCard
        className="bg-background-accent-green-subtle"
        label="결제 확인"
        value={`${confirmedPaymentCount}건`}
      />
      <MetricCard
        className="bg-background-accent-indigo-subtle"
        label="확정 일정"
        value={`${scheduledSessionCount}건`}
      />
    </section>
  );
}

interface SessionRequestListProps {
  requestRows: SessionRequestRow[];
}

export function SessionRequestList({
  requestRows,
}: SessionRequestListProps) {
  return (
    <MentoringTablePanel
      title="멘토링 신청 현황"
      description="결제 확인 상태를 먼저 보고, 이후 멘토 처리 상태를 확인합니다."
      isEmpty={requestRows.length === 0}
      emptyContent={(
        <p className="font-designer-14r text-text-subtle">신청 데이터가 없습니다.</p>
      )}
    >
      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableHeadCell>신청 ID</DataTableHeadCell>
            <DataTableHeadCell>멘토</DataTableHeadCell>
            <DataTableHeadCell>멘티</DataTableHeadCell>
            <DataTableHeadCell>방식</DataTableHeadCell>
            <DataTableHeadCell>결제 상태</DataTableHeadCell>
            <DataTableHeadCell>멘토 처리 상태</DataTableHeadCell>
            <DataTableHeadCell>신청 시각</DataTableHeadCell>
          </tr>
        </DataTableHead>
        <tbody>
          {requestRows.slice(0, 20).map((request, index) => {
            const statusMeta = MENTORING_REQUEST_STATUS_META[request.status];
            const paymentMeta = MENTORING_PAYMENT_STATUS_META[request.paymentStatus];
            const isLastRow = index === Math.min(requestRows.length, 20) - 1;

            return (
              <DataTableRow key={request.id} bordered={!isLastRow}>
                <DataTableCell tone="strong">{request.id}</DataTableCell>
                <DataTableCell tone="inherit">
                  <Link
                    href={`/admin/mentoring/mentor-operations?mentorId=${request.mentorId}`}
                    className="font-designer-14r text-text-information"
                  >
                    #{request.mentorId}
                    {request.mentorMemberId
                      ? ` (사용자 #${request.mentorMemberId})`
                      : ''}
                  </Link>
                </DataTableCell>
                <DataTableCell>{request.menteeName}</DataTableCell>
                <DataTableCell>{getMethodLabel(request.method)}</DataTableCell>
                <DataTableCell tone="inherit">
                  <Badge color={paymentMeta.color} shape="rectangle">
                    {paymentMeta.label}
                  </Badge>
                </DataTableCell>
                <DataTableCell tone="inherit">
                  <Badge color={statusMeta.color} shape="rectangle">
                    {statusMeta.label}
                  </Badge>
                </DataTableCell>
                <DataTableCell tone="subtle">
                  {formatDateTime(request.requestedAt)}
                </DataTableCell>
              </DataTableRow>
            );
          })}
        </tbody>
      </DataTable>
    </MentoringTablePanel>
  );
}

interface SessionScheduleListProps {
  sessionRows: SessionScheduleRow[];
}

export function SessionScheduleList({
  sessionRows,
}: SessionScheduleListProps) {
  return (
    <MentoringTablePanel
      title="멘토링 일정 현황"
      description="멘토가 확정한 일정, 완료/취소 상태를 실제 일정 스토어 기준으로 표시합니다."
      isEmpty={sessionRows.length === 0}
      emptyContent={(
        <p className="font-designer-14r text-text-subtle">일정 데이터가 없습니다.</p>
      )}
    >
      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableHeadCell>세션 ID</DataTableHeadCell>
            <DataTableHeadCell>멘토</DataTableHeadCell>
            <DataTableHeadCell>멘티</DataTableHeadCell>
            <DataTableHeadCell>방식</DataTableHeadCell>
            <DataTableHeadCell>일정</DataTableHeadCell>
            <DataTableHeadCell>상태</DataTableHeadCell>
          </tr>
        </DataTableHead>
        <tbody>
          {sessionRows.slice(0, 20).map((session, index) => {
            const statusMeta = MENTORING_SESSION_STATUS_META[session.status];
            const isLastRow = index === Math.min(sessionRows.length, 20) - 1;

            return (
              <DataTableRow key={session.id} bordered={!isLastRow}>
                <DataTableCell tone="strong">{session.id}</DataTableCell>
                <DataTableCell tone="inherit">
                  <Link
                    href={`/admin/mentoring/mentor-operations?mentorId=${session.mentorId}`}
                    className="font-designer-14r text-text-information"
                  >
                    #{session.mentorId}
                    {session.mentorMemberId
                      ? ` (사용자 #${session.mentorMemberId})`
                      : ''}
                  </Link>
                </DataTableCell>
                <DataTableCell>{session.menteeName}</DataTableCell>
                <DataTableCell>{getMethodLabel(session.method)}</DataTableCell>
                <DataTableCell tone="subtle">
                  {formatDateTime(session.startsAt)} ~ {formatDateTime(session.endsAt)}
                </DataTableCell>
                <DataTableCell tone="inherit">
                  <Badge color={statusMeta.color} shape="rectangle">
                    {statusMeta.label}
                  </Badge>
                </DataTableCell>
              </DataTableRow>
            );
          })}
        </tbody>
      </DataTable>
    </MentoringTablePanel>
  );
}

// 기존 이름 사용처와의 호환성을 위해 유지합니다.
export const SessionOperationsSummaryCards = SessionOperationsGrid;
export const SessionOperationsRequestTable = SessionRequestList;
export const SessionOperationsScheduleTable = SessionScheduleList;
