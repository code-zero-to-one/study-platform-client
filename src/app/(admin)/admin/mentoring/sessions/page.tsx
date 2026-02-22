'use client';

import dayjs from 'dayjs';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Badge from '@/components/ui/badge';
import { useAdminMentoringData } from '@/features/admin/mentoring/model/use-admin-mentoring-data';
import { getMethodLabel } from '@/mocks/mentoring-mock-data';

const REQUEST_STATUS_META = {
  PENDING: {
    label: '대기중',
    color: 'orange',
  },
  ACCEPTED: {
    label: '수락됨',
    color: 'green',
  },
  REJECTED: {
    label: '거절됨',
    color: 'red',
  },
} as const;

const PAYMENT_STATUS_META = {
  PENDING_TRANSFER: {
    label: '입금 대기',
    color: 'orange',
  },
  CONFIRMED: {
    label: '입금 확인',
    color: 'green',
  },
} as const;

const SESSION_STATUS_META = {
  SCHEDULED: {
    label: '예정',
    color: 'green',
  },
  COMPLETED: {
    label: '완료',
    color: 'blue',
  },
  CANCELLED: {
    label: '취소',
    color: 'red',
  },
} as const;

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

type MentorFilter = 'ALL' | number;

export default function SessionOperationsPage() {
  const searchParams = useSearchParams();
  const { hasHydrated, mentors } = useAdminMentoringData();
  const [selectedMentorId, setSelectedMentorId] = useState<MentorFilter>('ALL');

  useEffect(() => {
    if (mentors.length === 0) {
      setSelectedMentorId('ALL');

      return;
    }

    const mentorIdQuery = Number(searchParams.get('mentorId'));
    const hasMentorIdQuery = Number.isFinite(mentorIdQuery);
    if (
      hasMentorIdQuery &&
      mentors.some((mentor) => mentor.mentorId === mentorIdQuery)
    ) {
      setSelectedMentorId(mentorIdQuery);

      return;
    }

    if (
      selectedMentorId !== 'ALL' &&
      !mentors.some((mentor) => mentor.mentorId === selectedMentorId)
    ) {
      setSelectedMentorId('ALL');
    }
  }, [mentors, searchParams, selectedMentorId]);

  const filteredMentors = useMemo(() => {
    if (selectedMentorId === 'ALL') {
      return mentors;
    }

    return mentors.filter((mentor) => mentor.mentorId === selectedMentorId);
  }, [mentors, selectedMentorId]);

  const requestRows = useMemo(() => {
    return filteredMentors
      .flatMap((mentor) =>
        mentor.requests.map((request) => ({
          mentorId: mentor.mentorId,
          mentorMemberId: mentor.memberId,
          mentorTitle:
            mentor.mentor.mentorSettings?.mentoringTitle ?? mentor.mentor.headline,
          ...request,
        })),
      )
      .sort((first, second) => {
        return (
          dayjs(second.requestedAt).valueOf() - dayjs(first.requestedAt).valueOf()
        );
      });
  }, [filteredMentors]);

  const sessionRows = useMemo(() => {
    return filteredMentors
      .flatMap((mentor) =>
        mentor.sessions.map((session) => ({
          mentorId: mentor.mentorId,
          mentorMemberId: mentor.memberId,
          mentorTitle:
            mentor.mentor.mentorSettings?.mentoringTitle ?? mentor.mentor.headline,
          ...session,
        })),
      )
      .sort((first, second) => {
        return (
          dayjs(second.startsAt).valueOf() - dayjs(first.startsAt).valueOf()
        );
      });
  }, [filteredMentors]);

  const summary = useMemo(() => {
    return {
      totalRequestCount: requestRows.length,
      pendingPaymentCount: requestRows.filter(
        (request) => request.paymentStatus === 'PENDING_TRANSFER',
      ).length,
      confirmedPaymentCount: requestRows.filter(
        (request) => request.paymentStatus === 'CONFIRMED',
      ).length,
      scheduledSessionCount: sessionRows.filter(
        (session) => session.status === 'SCHEDULED',
      ).length,
      readyToProcessCount: requestRows.filter(
        (request) =>
          request.paymentStatus === 'CONFIRMED' && request.status === 'PENDING',
      ).length,
    };
  }, [requestRows, sessionRows]);

  if (!hasHydrated) {
    return (
      <div className="rounded-200 bg-background-alternative h-[360px] animate-pulse" />
    );
  }

  return (
    <div className="flex flex-col gap-200">
      <section className="rounded-100 border-border-subtle border p-200">
        <div className="flex flex-wrap items-center gap-100">
          <p className="font-designer-14b text-text-default">멘토별 현황</p>
          <select
            value={
              selectedMentorId === 'ALL' ? 'ALL' : String(selectedMentorId)
            }
            onChange={(event) => {
              const value = event.target.value;
              if (value === 'ALL') {
                setSelectedMentorId('ALL');

                return;
              }

              const mentorId = Number(value);
              if (!Number.isFinite(mentorId)) {
                setSelectedMentorId('ALL');

                return;
              }

              setSelectedMentorId(mentorId);
            }}
            className="font-designer-13r rounded-100 border-border-default bg-background-default text-text-default h-400 min-w-[220px] border px-100"
          >
            <option value="ALL">전체 멘토</option>
            {mentors.map((mentor) => (
              <option key={mentor.mentorId} value={mentor.mentorId}>
                #{mentor.mentorId}
                {mentor.memberId ? ` (사용자 #${mentor.memberId})` : ''}
              </option>
            ))}
          </select>
          <p className="font-designer-13r text-text-subtle">
            결제 확인 후 멘토 처리 가능 대기: {summary.readyToProcessCount}건
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-200 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-100 border-border-subtle bg-background-accent-blue-subtle border p-200">
          <p className="font-designer-14m text-text-subtle">전체 신청</p>
          <p className="font-designer-24b text-text-strong">
            {summary.totalRequestCount}건
          </p>
        </article>
        <article className="rounded-100 border-border-subtle bg-background-accent-orange-subtle border p-200">
          <p className="font-designer-14m text-text-subtle">결제 대기</p>
          <p className="font-designer-24b text-text-strong">
            {summary.pendingPaymentCount}건
          </p>
        </article>
        <article className="rounded-100 border-border-subtle bg-background-accent-green-subtle border p-200">
          <p className="font-designer-14m text-text-subtle">결제 확인</p>
          <p className="font-designer-24b text-text-strong">
            {summary.confirmedPaymentCount}건
          </p>
        </article>
        <article className="rounded-100 border-border-subtle bg-background-accent-indigo-subtle border p-200">
          <p className="font-designer-14m text-text-subtle">확정 일정</p>
          <p className="font-designer-24b text-text-strong">
            {summary.scheduledSessionCount}건
          </p>
        </article>
      </section>

      <section className="rounded-100 border-border-subtle overflow-hidden border">
        <div className="border-border-subtle border-b p-200">
          <h2 className="font-designer-16b text-text-default">
            멘토링 신청 현황
          </h2>
          <p className="font-designer-13r text-text-subtle mt-50">
            결제 확인 상태를 먼저 보고, 이후 멘토 처리 상태를 확인합니다.
          </p>
        </div>

        {requestRows.length === 0 ? (
          <div className="px-200 py-250 text-center">
            <p className="font-designer-14r text-text-subtle">
              신청 데이터가 없습니다.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-background-neutral-subtle h-[52px]">
              <tr>
                <th className="font-designer-14m text-text-default px-200 text-left">
                  신청 ID
                </th>
                <th className="font-designer-14m text-text-default px-200 text-left">
                  멘토
                </th>
                <th className="font-designer-14m text-text-default px-200 text-left">
                  멘티
                </th>
                <th className="font-designer-14m text-text-default px-200 text-left">
                  방식
                </th>
                <th className="font-designer-14m text-text-default px-200 text-left">
                  결제 상태
                </th>
                <th className="font-designer-14m text-text-default px-200 text-left">
                  멘토 처리 상태
                </th>
                <th className="font-designer-14m text-text-default px-200 text-left">
                  신청 시각
                </th>
              </tr>
            </thead>
            <tbody>
              {requestRows.slice(0, 20).map((request, index) => {
                const statusMeta = REQUEST_STATUS_META[request.status];
                const paymentMeta = PAYMENT_STATUS_META[request.paymentStatus];

                return (
                  <tr
                    key={request.id}
                    className={`${
                      index === Math.min(requestRows.length, 20) - 1
                        ? ''
                        : 'border-b-border-subtle border-b'
                    }`}
                  >
                    <td className="font-designer-14b text-text-default px-200 py-150">
                      {request.id}
                    </td>
                    <td className="px-200 py-150">
                      <Link
                        href={`/admin/mentoring/mentor-operations?mentorId=${request.mentorId}`}
                        className="font-designer-14r text-text-information"
                      >
                        #{request.mentorId}
                        {request.mentorMemberId
                          ? ` (사용자 #${request.mentorMemberId})`
                          : ''}
                      </Link>
                    </td>
                    <td className="font-designer-14r text-text-default px-200 py-150">
                      {request.menteeName}
                    </td>
                    <td className="font-designer-14r text-text-default px-200 py-150">
                      {getMethodLabel(request.method)}
                    </td>
                    <td className="px-200 py-150">
                      <Badge color={paymentMeta.color} shape="rectangle">
                        {paymentMeta.label}
                      </Badge>
                    </td>
                    <td className="px-200 py-150">
                      <Badge color={statusMeta.color} shape="rectangle">
                        {statusMeta.label}
                      </Badge>
                    </td>
                    <td className="font-designer-14r text-text-subtle px-200 py-150">
                      {formatDateTime(request.requestedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-100 border-border-subtle overflow-hidden border">
        <div className="border-border-subtle border-b p-200">
          <h2 className="font-designer-16b text-text-default">
            멘토링 일정 현황
          </h2>
          <p className="font-designer-13r text-text-subtle mt-50">
            멘토가 확정한 일정, 완료/취소 상태를 실제 일정 스토어 기준으로
            표시합니다.
          </p>
        </div>

        {sessionRows.length === 0 ? (
          <div className="px-200 py-250 text-center">
            <p className="font-designer-14r text-text-subtle">
              일정 데이터가 없습니다.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-background-neutral-subtle h-[52px]">
              <tr>
                <th className="font-designer-14m text-text-default px-200 text-left">
                  세션 ID
                </th>
                <th className="font-designer-14m text-text-default px-200 text-left">
                  멘토
                </th>
                <th className="font-designer-14m text-text-default px-200 text-left">
                  멘티
                </th>
                <th className="font-designer-14m text-text-default px-200 text-left">
                  방식
                </th>
                <th className="font-designer-14m text-text-default px-200 text-left">
                  일정
                </th>
                <th className="font-designer-14m text-text-default px-200 text-left">
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {sessionRows.slice(0, 20).map((session, index) => {
                const statusMeta = SESSION_STATUS_META[session.status];

                return (
                  <tr
                    key={session.id}
                    className={`${
                      index === Math.min(sessionRows.length, 20) - 1
                        ? ''
                        : 'border-b-border-subtle border-b'
                    }`}
                  >
                    <td className="font-designer-14b text-text-default px-200 py-150">
                      {session.id}
                    </td>
                    <td className="px-200 py-150">
                      <Link
                        href={`/admin/mentoring/mentor-operations?mentorId=${session.mentorId}`}
                        className="font-designer-14r text-text-information"
                      >
                        #{session.mentorId}
                        {session.mentorMemberId
                          ? ` (사용자 #${session.mentorMemberId})`
                          : ''}
                      </Link>
                    </td>
                    <td className="font-designer-14r text-text-default px-200 py-150">
                      {session.menteeName}
                    </td>
                    <td className="font-designer-14r text-text-default px-200 py-150">
                      {getMethodLabel(session.method)}
                    </td>
                    <td className="font-designer-14r text-text-subtle px-200 py-150">
                      {formatDateTime(session.startsAt)} ~{' '}
                      {formatDateTime(session.endsAt)}
                    </td>
                    <td className="px-200 py-150">
                      <Badge color={statusMeta.color} shape="rectangle">
                        {statusMeta.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
