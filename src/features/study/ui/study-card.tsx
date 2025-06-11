'use client';

import { startOfMonth, differenceInCalendarWeeks, getMonth } from 'date-fns';
import { useState } from 'react';
import DateSelector from './data-selector';
import StudyListSection from '../../../widgets/home/study-list-table';
import TodayStudyCard from './today-study-card';

function getWeekOfMonth(date: Date) {
   const start = startOfMonth(date);

   return differenceInCalendarWeeks(date, start, { weekStartsOn: 1 });
}

export default function StudyCard() {
   const [selectedDate, setSelectedDate] = useState(new Date());

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
