'use client';

import { ChevronLeft, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { StudyHistoryItem } from '@/types/one-to-one-study/study-history';

export const StudyCalendar = ({
  items,
  currentDate,
  onDateChange,
}: {
  items: StudyHistoryItem[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
}) => {
  const [activeTooltip, setActiveTooltip] = useState<{
    id: number;
    text: string;
    rect: DOMRect;
  } | null>(null);

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const formatDateKey = (year: number, month: number, day: number) =>
    `${year}.${String(month + 1).padStart(2, '0')}.${String(day).padStart(2, '0')}`;

  const itemsByDate = items.reduce(
    (acc, item) => {
      const match = item.date.match(/(\d{4})\.(\d{2})\.(\d{2})/);
      if (match) {
        const key = `${match[1]}.${match[2]}.${match[3]}`;
        acc[key] = acc[key] ? [...acc[key], item] : [item];
      }

      return acc;
    },
    {} as Record<string, StudyHistoryItem[]>,
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const monthNames = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  const renderCalendarDay = (day: number) => {
    const dateKey = formatDateKey(year, month, day);
    const dayItems = itemsByDate[dateKey] || [];
    const hasItems = dayItems.length > 0;

    return (
      <div
        key={day}
        className={cn(
          'border-border-subtlest bg-background-default hover:bg-fill-neutral-subtle-hover relative min-h-[120px] border p-100 transition-colors hover:z-10',
          hasItems && 'bg-fill-neutral-subtle-default',
        )}
      >
        <div className="font-designer-14b text-text-strong mb-100">{day}</div>
        {dayItems.map((item, itemIndex) => (
          <div
            key={item.id}
            onClick={() => item.link && window.open(item.link, '_blank')}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setActiveTooltip({ id: item.id, text: item.subject, rect });
            }}
            onMouseLeave={() => {
              setActiveTooltip(null);
            }}
            className={cn(
              'rounded-50 relative mb-50 flex cursor-pointer items-center gap-50 truncate border px-100 py-50 text-[11px] font-medium transition-all hover:z-20',
              item.attendance === 'ATTENDED'
                ? 'bg-fill-success-subtle-default text-text-success hover:bg-fill-success-default border-transparent'
                : 'bg-fill-warning-subtle-default text-text-warning hover:bg-fill-warning-default border-transparent',
            )}
          >
            {item.attendance === 'ATTENDED' ? (
              <CheckCircle className="h-3 w-3 shrink-0" />
            ) : (
              <Clock className="h-3 w-3 shrink-0" />
            )}
            <span className="pointer-events-none truncate">{item.subject}</span>
          </div>
        ))}
        {dayItems.length > 2 && (
          <div className="text-text-subtle text-[9px] font-bold">
            +{dayItems.length - 2}개 더
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-background-default rounded-200 border-border-subtle shadow-1 border">
      <div className="border-border-subtle bg-background-alternative/50 rounded-t-200 flex items-center justify-between border-b p-400">
        <button
          onClick={() => onDateChange(new Date(year, month - 1, 1))}
          className="hover:bg-fill-neutral-subtle-hover rounded-100 p-100 transition-colors"
        >
          <ChevronLeft className="text-text-subtle h-5 w-5" />
        </button>
        <h3 className="font-bold-h5 text-text-strong">
          {year}년 {monthNames[month]}
        </h3>
        <button
          onClick={() => onDateChange(new Date(year, month + 1, 1))}
          className="hover:bg-fill-neutral-subtle-hover rounded-100 p-100 transition-colors"
        >
          <ChevronRight className="text-text-subtle h-5 w-5" />
        </button>
      </div>

      <div className="border-border-subtle grid grid-cols-7 border-b">
        {dayNames.map((name, idx) => (
          <div
            key={name}
            className={cn(
              'font-designer-13b bg-background-alternative/80 p-200 text-center',
              idx === 0 && 'text-text-error',
              idx === 6 && 'text-text-information',
            )}
          >
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }, (_, i) => (
          <div
            key={`empty-${i}`}
            className="border-border-subtlest bg-fill-neutral-subtle-default/30 min-h-[80px] border"
          />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) =>
          renderCalendarDay(i + 1),
        )}
      </div>

      {/* Global Tooltip Portal (Fixed Position) */}
      {activeTooltip && (
        <div
          className="bg-fill-neutral-strong-default text-text-inverse rounded-100 shadow-3 border-border-subtle pointer-events-none fixed z-[9999] max-w-[240px] border px-200 py-150 text-[12px] leading-relaxed font-medium break-words"
          style={{
            top: activeTooltip.rect.top - 8,
            left: activeTooltip.rect.left + activeTooltip.rect.width / 2,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {/* Arrow (Bottom) */}
          <div className="border-t-fill-neutral-strong-default absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-t-[6px] border-r-[6px] border-l-[6px] border-r-transparent border-l-transparent" />

          {activeTooltip.text}
        </div>
      )}
    </div>
  );
};
