'use client';

import dayjs from 'dayjs';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { MENTOR_SCREENING_STATUS_META } from '@/features/admin/mentoring/model/screening';
import { useAdminMentoringData } from '@/features/admin/mentoring/model/use-admin-mentoring-data';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useToastStore } from '@/stores/use-toast-store';
import { useMentorScreeningStore } from '@/stores/useMentorScreeningStore';

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

const getStatusToastText = (status: 'APPROVED' | 'REJECTED') => {
  if (status === 'APPROVED') {
    return '멘토 심사 상태를 승인으로 변경했습니다.';
  }

  return '멘토 심사 상태를 반려로 변경했습니다.';
};

const getEnabledMethodLabels = (
  settings:
    | {
        noteEnabled?: boolean;
        phoneEnabled?: boolean;
        onlineEnabled?: boolean;
        offlineEnabled?: boolean;
      }
    | undefined,
) => {
  if (!settings) {
    return '-';
  }

  const labels = [
    settings.noteEnabled ? '쪽지' : '',
    settings.phoneEnabled ? '전화' : '',
    settings.onlineEnabled ? '온라인' : '',
    settings.offlineEnabled ? '대면' : '',
  ].filter(Boolean);

  if (labels.length === 0) {
    return '활성 방식 없음';
  }

  return labels.join(', ');
};

export default function MentorApplicationsPage() {
  const searchParams = useSearchParams();
  const { memberId: reviewerMemberId } = useAuthReady();
  const { showToast } = useToastStore();
  const { hasHydrated, mentors } = useAdminMentoringData();
  const upsertRecord = useMentorScreeningStore((state) => state.upsertRecord);

  const [selectedMentorId, setSelectedMentorId] = useState<number>();
  const [reviewNote, setReviewNote] = useState('');

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

  useEffect(() => {
    if (!selectedMentor) {
      setReviewNote('');

      return;
    }

    setReviewNote(selectedMentor.screening.note ?? '');
  }, [selectedMentor]);

  const handleUpdateStatus = (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedMentor) {
      return;
    }

    upsertRecord({
      mentorId: selectedMentor.mentorId,
      status,
      note: reviewNote,
      reviewedByMemberId: reviewerMemberId,
    });
    showToast(getStatusToastText(status), 'success');
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
          심사할 멘토 등록 데이터가 없습니다.
        </p>
        <p className="font-designer-14r text-text-subtle mt-75">
          멘토가 등록을 완료하면 심사 큐에 자동으로 표시됩니다.
        </p>
      </section>
    );
  }

  return (
    <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-200">
      <section className="rounded-100 border-border-subtle overflow-hidden border">
        <div className="border-border-subtle border-b p-200">
          <h2 className="font-designer-16b text-text-default">멘토 심사 큐</h2>
          <p className="font-designer-13r text-text-subtle mt-50">
            실제 멘토 등록폼 데이터만 대상으로 심사 상태를 관리합니다.
          </p>
        </div>

        <table className="w-full">
          <thead className="bg-background-neutral-subtle h-[52px]">
            <tr>
              <th className="font-designer-14m text-text-default px-200 text-left">
                멘토 ID
              </th>
              <th className="font-designer-14m text-text-default px-200 text-left">
                연결 사용자
              </th>
              <th className="font-designer-14m text-text-default px-200 text-left">
                멘토링명
              </th>
              <th className="font-designer-14m text-text-default px-200 text-left">
                상태
              </th>
              <th className="font-designer-14m text-text-default px-200 text-left">
                최근 수정
              </th>
            </tr>
          </thead>
          <tbody>
            {mentors.map((mentor, index) => {
              const screeningMeta =
                MENTOR_SCREENING_STATUS_META[mentor.screening.status];

              return (
                <tr
                  key={mentor.mentorId}
                  className={`${
                    index === mentors.length - 1
                      ? ''
                      : 'border-b-border-subtle border-b'
                  } ${
                    selectedMentorId === mentor.mentorId
                      ? 'bg-background-accent-blue-subtle'
                      : ''
                  } cursor-pointer`}
                  onClick={() => setSelectedMentorId(mentor.mentorId)}
                >
                  <td className="font-designer-14b text-text-default px-200 py-150">
                    {mentor.mentorId}
                  </td>
                  <td className="font-designer-14r text-text-default px-200 py-150">
                    {mentor.memberId ? `#${mentor.memberId}` : '-'}
                  </td>
                  <td className="font-designer-14r text-text-default px-200 py-150">
                    <span className="line-clamp-1">
                      {mentor.mentor.mentorSettings?.mentoringTitle ??
                        mentor.mentor.headline}
                    </span>
                  </td>
                  <td className="px-200 py-150">
                    <Badge color={screeningMeta.color} shape="rectangle">
                      {screeningMeta.label}
                    </Badge>
                  </td>
                  <td className="font-designer-14r text-text-subtle px-200 py-150">
                    {formatDateTime(mentor.mentor.mentorSettings?.updatedAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="rounded-100 border-border-subtle border p-200">
        {selectedMentor ? (
          <>
            <div className="border-border-subtle mb-150 border-b pb-150">
              <h3 className="font-designer-16b text-text-default">
                심사 상세
              </h3>
              <p className="font-designer-13r text-text-subtle mt-50">
                현재 선택된 멘토의 기본 정보를 확인하고 심사 상태를 변경합니다.
              </p>
            </div>

            <div className="flex flex-col gap-100">
              <InfoRow label="멘토 ID" value={`#${selectedMentor.mentorId}`} />
              <InfoRow
                label="연결 사용자"
                value={
                  selectedMentor.memberId
                    ? `#${selectedMentor.memberId}`
                    : '연결 정보 없음'
                }
              />
              <InfoRow
                label="멘토링명"
                value={
                  selectedMentor.mentor.mentorSettings?.mentoringTitle ??
                  selectedMentor.mentor.headline
                }
              />
              <InfoRow
                label="직군/직무"
                value={`${selectedMentor.mentor.mentorSettings?.jobGroup ?? '-'} / ${
                  selectedMentor.mentor.mentorSettings?.jobTitle ?? '-'
                }`}
              />
              <InfoRow
                label="상담 방식"
                value={getEnabledMethodLabels(
                  selectedMentor.mentor.mentorSettings,
                )}
              />
              <InfoRow
                label="정산 정보 인증"
                value={
                  selectedMentor.mentor.mentorSettings?.settlementDraft?.verified
                    ? '완료'
                    : '미완료'
                }
              />
              <InfoRow
                label="최종 처리 시각"
                value={formatDateTime(selectedMentor.screening.reviewedAt)}
              />
            </div>

            <div className="mt-150">
              <label className="font-designer-13b text-text-default mb-75 block">
                심사 메모
              </label>
              <textarea
                value={reviewNote}
                onChange={(event) => setReviewNote(event.target.value)}
                className="font-designer-14r rounded-100 border-border-default bg-background-default text-text-default min-h-[120px] w-full border px-125 py-100"
                placeholder="승인/반려 사유, 보완 요청 사항 등을 기록하세요."
              />
            </div>

            <div className="mt-150 flex flex-wrap gap-75">
              <Button
                type="button"
                size="small"
                onClick={() => handleUpdateStatus('APPROVED')}
              >
                승인
              </Button>
              <Button
                type="button"
                size="small"
                color="outlined"
                onClick={() => handleUpdateStatus('REJECTED')}
              >
                반려
              </Button>
            </div>

            <div className="mt-150 flex flex-wrap gap-75">
              <Link
                href={`/admin/mentoring/mentor-operations?mentorId=${selectedMentor.mentorId}`}
                className="font-designer-13b text-text-information"
              >
                등록 정보 전체 보기
              </Link>
              {selectedMentor.memberId ? (
                <Link
                  href={`/admin/detail/${selectedMentor.memberId}/profile`}
                  className="font-designer-13b text-text-information"
                >
                  사용자 정보 보기
                </Link>
              ) : (
                <span className="font-designer-13r text-text-subtlest">
                  연결 사용자 없음
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="font-designer-14r text-text-subtle">
            심사할 멘토를 선택해주세요.
          </div>
        )}
      </section>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-75">
      <p className="font-designer-13m text-text-subtle">{label}</p>
      <p className="font-designer-14r text-text-default">{value}</p>
    </div>
  );
}
