'use client';

import { startOfWeek, addDays, format } from 'date-fns';
import { useState } from 'react';

export default function DateSelector() {
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  const dayLabels = ['월', '화', '수', '목', '금'];
  const dates = Array.from({ length: 5 }, (_, i) => addDays(monday, i));

  const [selectedIndex, setSelectedIndex] = useState(
    dates.findIndex(
      (d) => format(d, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
    ),
  );

  return (
    <div className="flex w-full gap-50">
      {dates.map((date, index) => {
        const isSelected = index === selectedIndex;
        const dayLabel = dayLabels[index];
        const dateNum = format(date, 'd');

        return (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`rounded-150 border-border-default flex flex-1 flex-col items-center border py-300 transition ${
              isSelected
                ? 'bg-fill-brand-default-default border-transparent'
                : 'bg-fill-neutral-subtle-default hover:bg-gray-200'
            }`}
          >
            <span
              className={`font-designer-14m ${
                isSelected ? 'text-gray-0' : 'text-text-subtle'
              }`}
            >
              {dayLabel}
            </span>
            <span
              className={`font-designer-24b ${
                isSelected ? 'text-gray-0' : 'text-text-default'
              }`}
            >
              {dateNum}
            </span>
          </button>
        );
      })}
    </div>
  );
}
