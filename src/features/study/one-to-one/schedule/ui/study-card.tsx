'use client';

import { getMonth, getDay, startOfWeek, getDate } from 'date-fns';
import { useMemo, useState } from 'react';
import ReservationList from '@/features/study/participation/ui/reservation-list';
import {
  useStudyStatusQuery,
  useWeeklyParticipation,
} from '@/features/study/one-to-one/schedule/model/use-schedule-query';
import DateSelector from '@/features/study/one-to-one/schedule/ui/data-selector';
import TodayStudyCard from '@/features/study/one-to-one/schedule/ui/today-study-card';
import {
  formatKoreaYMD,
  getKoreaDate,
  getKoreaDisplayMonday,
} from '@/utils/time';
import StudyListSection from '@/widgets/home/study-list-table';

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

export default function StudyCard() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const studyDate = formatKoreaYMD(selectedDate);

  const { data: status } = useStudyStatusQuery();

  const { data: participationData } = useWeeklyParticipation(studyDate);
  const isParticipate = participationData?.isParticipate ?? false;

  const displayMonday = useMemo(
    () => getKoreaDisplayMonday(selectedDate),
    [selectedDate],
  );
  const { month, week } = getWeekly(displayMonday);

  return (
    <>
      {status === 'RECRUITING' && (
        <ReservationList
          month={month}
          week={week}
          studyDate={studyDate}
          pageSize={50}
        />
      )}
      {status === 'STUDYING' && (
        <>
          <div className="flex flex-col gap-300">
            <div className="font-bold-h3">{`${month}월 ${week}주차 스터디`}</div>
            <DateSelector value={selectedDate} onChange={setSelectedDate} />
          </div>
          <div className="border-border-default rounded-200 flex flex-col gap-500 border p-400">
            {isParticipate && <TodayStudyCard studyDate={studyDate} />}
            <StudyListSection studyDate={studyDate} />
          </div>
        </>
      )}
    </>
  );
}
