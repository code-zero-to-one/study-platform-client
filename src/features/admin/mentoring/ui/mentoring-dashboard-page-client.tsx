'use client';

import dayjs from 'dayjs';
import Link from 'next/link';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import MetricCard from '@/components/common/ui/metric-card';
import { resolveAdminMentoringViewState } from '@/features/admin/mentoring/model/admin-mentoring-view-state';
import { MENTOR_SCREENING_STATUS_META } from '@/features/admin/mentoring/model/screening';
import { useAdminMentoringOverviewQuery } from '@/features/admin/mentoring/model/use-admin-mentoring-overview-query';
import MentoringFlowGuide from '@/features/admin/mentoring/ui/mentoring-flow-guide';
import { getMentorDisplayTitle } from '@/features/mentoring/model/mentor-profile-utils';
import { isMentoringAdminMockEnabled } from '@/features/mentoring/model/mentoring-feature-flag';
import MentoringStateBoundary from '@/features/mentoring/ui/common/mentoring-state-boundary';
import MentoringTablePanel from '@/features/mentoring/ui/common/mentoring-table-panel';

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

export default function MentoringDashboardPageClient() {
  const { hasHydrated, mentors, metrics } = useAdminMentoringOverviewQuery();
  const shouldShowMockGuide = isMentoringAdminMockEnabled();
  const listState = resolveAdminMentoringViewState({
    hasHydrated,
    itemCount: mentors.length,
    emptyWhenNoData: false,
  });

  return (
    <MentoringStateBoundary
      state={listState}
      ready={
        <div className="flex flex-col gap-200">
          {shouldShowMockGuide && <MentoringFlowGuide />}

          <section className="grid grid-cols-1 gap-200 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              className="bg-background-accent-blue-subtle"
              label="등록 멘토"
              value={`${metrics.registeredMentorCount}명`}
            />
            <MetricCard
              className="bg-background-accent-orange-subtle"
              label="심사 대기"
              value={`${metrics.pendingScreeningCount}명`}
            />
            <MetricCard
              className="bg-background-accent-green-subtle"
              label="승인 멘토"
              value={`${metrics.approvedMentorCount}명`}
            />
            <MetricCard
              className="bg-background-accent-indigo-subtle"
              label="멘티 신청 대기"
              value={`${metrics.pendingRequestCount}건`}
            />
          </section>

          <MentoringTablePanel
            title="최근 멘토 등록/심사 현황"
            description="실제 멘토 등록 폼 데이터와 심사 상태를 기반으로 표시됩니다."
            rightSlot={
              <Link href="/admin/mentoring/mentor-applications">
                <Button color="outlined" size="small">
                  심사 화면 이동
                </Button>
              </Link>
            }
            isEmpty={mentors.length === 0}
            emptyClassName="py-300"
            emptyContent={
              <>
                <p className="font-designer-16b text-text-default">
                  아직 등록된 멘토가 없습니다.
                </p>
                <p className="font-designer-13r text-text-subtle mt-75">
                  멘토가 `/mentoring/become-mentor`에서 등록하면 여기에
                  표시됩니다.
                </p>
              </>
            }
          >
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
                    멘티 신청 대기
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
                          {getMentorDisplayTitle(item.mentor)}
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
          </MentoringTablePanel>
        </div>
      }
    />
  );
}
