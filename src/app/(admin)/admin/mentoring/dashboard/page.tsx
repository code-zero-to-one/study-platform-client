'use client';

import dayjs from 'dayjs';
import Link from 'next/link';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { MENTOR_SCREENING_STATUS_META } from '@/features/admin/mentoring/model/screening';
import { useAdminMentoringData } from '@/features/admin/mentoring/model/use-admin-mentoring-data';

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

export default function MentoringDashboardPage() {
  const { hasHydrated, mentors, metrics } = useAdminMentoringData();

  if (!hasHydrated) {
    return (
      <div className="rounded-200 bg-background-alternative h-[360px] animate-pulse" />
    );
  }

  return (
    <div className="flex flex-col gap-200">
      <section className="grid grid-cols-1 gap-200 sm:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-100 border-border-subtle bg-background-accent-blue-subtle border p-200">
          <p className="font-designer-14m text-text-subtle">등록 멘토</p>
          <p className="font-designer-24b text-text-strong">
            {metrics.registeredMentorCount}명
          </p>
        </article>
        <article className="rounded-100 border-border-subtle bg-background-accent-orange-subtle border p-200">
          <p className="font-designer-14m text-text-subtle">심사 대기</p>
          <p className="font-designer-24b text-text-strong">
            {metrics.pendingScreeningCount}명
          </p>
        </article>
        <article className="rounded-100 border-border-subtle bg-background-accent-purple-subtle border p-200">
          <p className="font-designer-14m text-text-subtle">심사 검토중</p>
          <p className="font-designer-24b text-text-strong">
            {metrics.inReviewScreeningCount}명
          </p>
        </article>
        <article className="rounded-100 border-border-subtle bg-background-accent-green-subtle border p-200">
          <p className="font-designer-14m text-text-subtle">승인 멘토</p>
          <p className="font-designer-24b text-text-strong">
            {metrics.approvedMentorCount}명
          </p>
        </article>
        <article className="rounded-100 border-border-subtle bg-background-accent-indigo-subtle border p-200">
          <p className="font-designer-14m text-text-subtle">신청 대기</p>
          <p className="font-designer-24b text-text-strong">
            {metrics.pendingRequestCount}건
          </p>
        </article>
      </section>

      <section className="rounded-100 border-border-subtle overflow-hidden border">
        <div className="border-border-subtle flex items-center justify-between border-b p-200">
          <div>
            <h2 className="font-designer-16b text-text-default">
              최근 멘토 등록/심사 현황
            </h2>
            <p className="font-designer-13r text-text-subtle">
              실제 멘토 등록 폼 데이터와 심사 상태를 기반으로 표시됩니다.
            </p>
          </div>
          <Link href="/admin/mentoring/mentor-applications">
            <Button color="outlined" size="small">
              심사 화면 이동
            </Button>
          </Link>
        </div>

        {mentors.length === 0 ? (
          <div className="px-200 py-300 text-center">
            <p className="font-designer-16b text-text-default">
              아직 등록된 멘토가 없습니다.
            </p>
            <p className="font-designer-13r text-text-subtle mt-75">
              멘토가 `/mentoring/become-mentor`에서 등록하면 여기에 표시됩니다.
            </p>
          </div>
        ) : (
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
                  심사 상태
                </th>
                <th className="font-designer-14m text-text-default px-200 text-left">
                  신청 대기
                </th>
                <th className="font-designer-14m text-text-default px-200 text-left">
                  최근 수정
                </th>
                <th className="font-designer-14m text-text-default px-200 text-left">
                  이동
                </th>
              </tr>
            </thead>
            <tbody>
              {mentors.slice(0, 8).map((item, index) => {
                const screeningMeta =
                  MENTOR_SCREENING_STATUS_META[item.screening.status];

                return (
                  <tr
                    key={item.mentorId}
                    className={`${
                      index === Math.min(mentors.length, 8) - 1
                        ? ''
                        : 'border-b-border-subtle border-b'
                    }`}
                  >
                    <td className="font-designer-14b text-text-default px-200 py-150">
                      {item.mentorId}
                    </td>
                    <td className="font-designer-14r text-text-default px-200 py-150">
                      {item.memberId ? `#${item.memberId}` : '-'}
                    </td>
                    <td className="font-designer-14r text-text-default px-200 py-150">
                      <span className="line-clamp-1">
                        {item.mentor.mentorSettings?.mentoringTitle ??
                          item.mentor.headline}
                      </span>
                    </td>
                    <td className="px-200 py-150">
                      <Badge color={screeningMeta.color} shape="rectangle">
                        {screeningMeta.label}
                      </Badge>
                    </td>
                    <td className="font-designer-14r text-text-default px-200 py-150">
                      {item.counts.pendingRequests}건
                    </td>
                    <td className="font-designer-14r text-text-subtle px-200 py-150">
                      {formatDateTime(item.mentor.mentorSettings?.updatedAt)}
                    </td>
                    <td className="px-200 py-150">
                      <div className="flex items-center gap-75">
                        <Link
                          href={`/admin/mentoring/mentor-applications?mentorId=${item.mentorId}`}
                          className="font-designer-13b text-text-information"
                        >
                          심사
                        </Link>
                        <Link
                          href={`/admin/mentoring/mentor-operations?mentorId=${item.mentorId}`}
                          className="font-designer-13b text-text-information"
                        >
                          등록정보
                        </Link>
                        <Link
                          href={`/admin/mentoring/sessions?mentorId=${item.mentorId}`}
                          className="font-designer-13b text-text-information"
                        >
                          신청/일정
                        </Link>
                      </div>
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
