'use client';

import { addDays, format, isSameDay } from 'date-fns';
import { useMemo } from 'react';
import { getKoreaDisplayMonday } from '@/shared/lib/time';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

export default function DateSelector({ value, onChange }: Props) {
  const dayLabels = ['월', '화', '수', '목', '금'];

  const displayMonday = useMemo(() => getKoreaDisplayMonday(), []);
  const dates = useMemo(
    () => Array.from({ length: 5 }, (_, i) => addDays(displayMonday, i)),
    [displayMonday],
  );

  return (
    <div className="flex w-full gap-50">
      {dates.map((date, index) => {
        const isSelected = isSameDay(date, value);
        const dayLabel = dayLabels[index];
        const dateNum = format(date, 'd');

        return (
          <button
            key={index}
            onClick={() => onChange(date)}
            className={`rounded-150 border-border-default flex flex-1 flex-col items-center border py-300 transition ${
              isSelected
                ? 'bg-fill-brand-default-default border-transparent'
                : 'bg-fill-neutral-subtle-default hover:bg-gray-200'
            }`}
          >
            <span
              className={`font-designer-14m ${isSelected ? 'text-gray-0' : 'text-text-subtle'}`}
            >
              {dayLabel}
            </span>
            <span
              className={`font-designer-24b ${isSelected ? 'text-gray-0' : 'text-text-default'}`}
            >
              {dateNum}
            </span>
          </button>
        );
      })}
    </div>
  );
}
