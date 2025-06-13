'use client';

import { startOfMonth, differenceInCalendarWeeks, getMonth, getDay, addDays, startOfWeek } from 'date-fns';
import { useState } from 'react';
import DateSelector from './data-selector';
import TodayStudyCard from './today-study-card';
import StudyListSection from '../../../widgets/home/study-list-table';

// 스터디 주차 구하는 함수
function getWeekOfMonth(date: Date) {
   const start = startOfMonth(date);

   return differenceInCalendarWeeks(date, start, { weekStartsOn: 1 });
}

// 금요일 보정 함수 (토 or 일 인 경우 금요일로 조정)
function adjustDateToWeekday(date: Date): Date {
   const day = getDay(date);
   if (day >= 5) {
      return addDays(startOfWeek(date, { weekStartsOn: 1 }), 4);  // 그 주 금요일
   }

   return date;
}

export default function StudyCard() {
   const [selectedDate, setSelectedDate] = useState(() => adjustDateToWeekday(new Date()));

   const month = getMonth(selectedDate) + 1;
   const week = getWeekOfMonth(selectedDate);

   return (
      <>
         <div className='flex flex-col gap-300'>
            <div className='font-bold-h3'>{`${month}월 ${week}주차 스터디`}</div>
            <DateSelector value={selectedDate} onChange={setSelectedDate} />
         </div>
         <div className='p-400 border border-border-default rounded-200 flex flex-col gap-500'>
            <TodayStudyCard date={selectedDate} />
            <StudyListSection date={selectedDate} />
         </div >
      </>
   );
}
