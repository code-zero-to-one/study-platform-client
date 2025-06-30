'use client';

import { getMonth, getDay, addDays, startOfWeek, getDate } from 'date-fns';
import { useState } from 'react';
import DateSelector from './data-selector';
import TodayStudyCard from './today-study-card';
import StudyListSection from '../../../widgets/home/study-list-table';

const FRIDAY = 5;
const FRIDAY_OFFSET = 4;

// 스터디 주차 구하는 함수
function getWeekly(date: Date): { month: number; week: number } {
  const weekStartsOn = 0;
  const target = new Date(date);
  const currentWeekStart = startOfWeek(target, { weekStartsOn });

  const baseMonth = getMonth(currentWeekStart);

  // 목요일 기준 월의 첫 주 시작일 계산
  const firstOfMonth = new Date(target.getFullYear(), baseMonth, 1);
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

  // 주차 계산
  const diffMs = currentWeekStart.getTime() - officialFirstWeekStart.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));

  return {
    month: baseMonth + 1,
    week: diffWeeks + 1,
  };
}

// 금요일 보정 함수 (토 or 일 인 경우 금요일로 조정) -> 토, 일인 경우 날짜를 하루 적게 전달
// 해당 함수는 주말에 어떤 값을 보여줄 건지에 따라 변경할 예정
// function adjustDateToWeekday(date: Date): Date {
//   const day = getDay(date);
//   if (day >= FRIDAY) {
//     return addDays(startOfWeek(date, { weekStartsOn: 1 }), FRIDAY_OFFSET);
//   }

//   return date;
// }

export default function StudyCard() {
  // const [selectedDate, setSelectedDate] = useState(() =>
  //   adjustDateToWeekday(new Date()),
  // );
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { month, week } = getWeekly(selectedDate);

  return (
    <>
      <div className="flex flex-col gap-300">
        <div className="font-bold-h3">{`${month}월 ${week}주차 스터디`}</div>
        <DateSelector value={selectedDate} onChange={setSelectedDate} />
      </div>
      <div className="border-border-default rounded-200 flex flex-col gap-500 border p-400">
        <TodayStudyCard date={selectedDate} />
        <StudyListSection date={selectedDate} />
      </div>
    </>
  );
}
