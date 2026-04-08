'use client';

import { getMonth, getDay, startOfWeek, getDate } from 'date-fns';
import { useMemo, useState } from 'react';
import SectionHeader from '@/components/common/ui/section-header';
import StudyListSection from '@/components/lists/study-list-table';
import ReservationList from '@/components/participation/reservation-list';
import DateSelector from '@/components/schedule/data-selector';
import TodayStudyCard from '@/components/schedule/today-study-card';
import { useAuthReady } from '@/features/auth/model/use-auth';
import {
  useStudyStatusQuery,
  useWeeklyParticipationQuery,
} from '@/hooks/queries/one-to-one/use-schedule-query';
import {
  formatKoreaYMD,
  getKoreaDate,
  getKoreaDisplayMonday,
} from '@/utils/time';

// 스터디 주차 구하는 함수
function getWeekly(date: Date): { month: number; week: number } {
  const weekStartsOn = 0;
  const targetKST = getKoreaDate(date);
  const currentWeekStart = startOfWeek(targetKST, { weekStartsOn });

  const baseMonth = getMonth(currentWeekStart);

  // 목요일 기준 월의 첫 주 시작일 계산
  const firstOfMonth = new Date(targetKST.getFullYear(), baseMonth, 1);
  const firstWeekStart = startOfWeek(firstOfMonth, { weekStartsOn });
  const firstDayOfWeek = getDay(firstOfMonth);
  const officialFirstWeekStart =
    firstDayOfWeek <= 4
      ? firstWeekStart
      : new Date(firstWeekStart.setDate(firstWeekStart.getDate() + 7));

  // 만약 다음 달의 1일이 포함되어 있고, 그 요일이 일~수라면 → 다음 달 1주차
  let isNextMonthFirstWeek = false;
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    if (getDate(d) === 1 && getMonth(d) !== baseMonth && getDay(d) <= 3) {
      isNextMonthFirstWeek = true;
      break;
    }
  }

  if (isNextMonthFirstWeek) {
    return {
      month: ((baseMonth + 1) % 12) + 1,
      week: 1,
    };
  }

  const diffMs = currentWeekStart.getTime() - officialFirstWeekStart.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));

  return {
    month: baseMonth + 1,
    week: diffWeeks + 1,
  };
}

interface StudyCardProps {
  tutorialMode?: boolean;
  forcedStatus?: 'RECRUITING' | 'STUDYING';
  forcedRole?: 'INTERVIEWEE' | 'INTERVIEWER';
  forceOpenReadyModal?: boolean;
  forceOpenDoneModal?: boolean;
}

export default function StudyCard({
  tutorialMode,
  forcedStatus,
  forcedRole,
  forceOpenReadyModal,
  forceOpenDoneModal,
}: StudyCardProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const studyDate = formatKoreaYMD(selectedDate);

  // 로그인 여부 확인
  const { isAuthReady, memberId } = useAuthReady();
  const isLoggedIn = isAuthReady && !!memberId;

  // 공개 API
  const { data: status } = useStudyStatusQuery();

  // 인증 API (로그인 한 사용자만 호출)
  const { data: participationData } = useWeeklyParticipationQuery(
    studyDate,
    isLoggedIn,
  );
  const isParticipate = tutorialMode
    ? true
    : (participationData?.isParticipate ?? false);

  const displayMonday = useMemo(
    () => getKoreaDisplayMonday(selectedDate),
    [selectedDate],
  );
  const { month, week } = getWeekly(displayMonday);

  const effectiveStatus = forcedStatus ?? status;

  return (
    <>
      {effectiveStatus === 'RECRUITING' && (
        <ReservationList
          month={month}
          week={week}
          studyDate={studyDate}
          pageSize={50}
        />
      )}
      {effectiveStatus === 'STUDYING' && (
        <>
          <SectionHeader
            title={`${month}월 ${week}주차 스터디`}
            className="gap-300"
            titleClassName="font-bold-h3"
          />
          <DateSelector value={selectedDate} onChange={setSelectedDate} />
          <div className="border-border-default rounded-200 flex flex-col gap-500 border p-400">
            {isParticipate && (
              <TodayStudyCard
                studyDate={studyDate}
                tutorialMode={tutorialMode}
                forcedRole={forcedRole}
                forceOpenReadyModal={forceOpenReadyModal}
                forceOpenDoneModal={forceOpenDoneModal}
              />
            )}
            <div data-tutorial="study-progress-list">
              <StudyListSection
                studyDate={studyDate}
                tutorialMode={tutorialMode}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
