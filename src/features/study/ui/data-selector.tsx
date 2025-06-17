'use client';

import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { useMemo } from 'react';

interface Props {
   value: Date;
   onChange: (date: Date) => void;
}

export default function DateSelector({ value, onChange }: Props) {
   const today = new Date();
   const monday = startOfWeek(today, { weekStartsOn: 1 });
   const dayLabels = ['월', '화', '수', '목', '금'];
   const dates = useMemo(() => Array.from({ length: 5 }, (_, i) => addDays(monday, i)), [monday]);

   return (
      <div className='flex gap-50 w-full'>
         {dates.map((date, index) => {
            const isSelected = isSameDay(date, value);
            const dayLabel = dayLabels[index];
            const dateNum = format(date, 'd');

            return (
               <button
                  key={index}
                  onClick={() => onChange(date)}
                  className={`flex-1 py-300 flex flex-col items-center rounded-150 transition border border-border-default
                     ${isSelected
                        ? 'bg-fill-brand-default-default border-transparent'
                        : 'bg-fill-neutral-subtle-default hover:bg-gray-200'}`}
               >
                  <span className={`font-designer-14m ${isSelected ? 'text-gray-0' : 'text-text-subtle'}`}>
                     {dayLabel}
                  </span>
                  <span className={`font-designer-24b ${isSelected ? 'text-gray-0' : 'text-text-default'}`}>
                     {dateNum}
                  </span>
               </button>
            );
         })}
      </div>
   );
}
