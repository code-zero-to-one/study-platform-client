'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { StudyHistoryItem } from '@/types/study-history';

export const StudyCalendar = ({ 
  items, 
  currentDate, 
  onDateChange 
}: { 
  items: StudyHistoryItem[]; 
  currentDate: Date;
  onDateChange: (date: Date) => void;
}) => {
  const [activeTooltip, setActiveTooltip] = useState<{ id: number; text: string; rect: DOMRect } | null>(null);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const formatDateKey = (year: number, month: number, day: number) =>
    `${year}.${String(month + 1).padStart(2, '0')}.${String(day).padStart(2, '0')}`;

  const itemsByDate = items.reduce((acc, item) => {
    const match = item.date.match(/(\d{4})\.(\d{2})\.(\d{2})/);
    if (match) {
      const key = `${match[1]}.${match[2]}.${match[3]}`;
      acc[key] = acc[key] ? [...acc[key], item] : [item];
    }
    return acc;
  }, {} as Record<string, StudyHistoryItem[]>);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const dayNames = ['일','월','화','수','목','금','토'];

  const renderCalendarDay = (day: number) => {
    const dateKey = formatDateKey(year, month, day);
    const dayItems = itemsByDate[dateKey] || [];
    const hasItems = dayItems.length > 0;

    return (
      <div
        key={day}
        className={cn(
          'min-h-[120px] p-100 border border-border-subtlest bg-background-default hover:bg-fill-neutral-subtle-hover transition-colors relative hover:z-10',
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
              'relative flex items-center gap-50 text-[11px] px-100 py-50 rounded-50 mb-50 truncate font-medium border cursor-pointer transition-all hover:z-20',
              item.attendance === 'ATTENDED' 
                ? 'bg-fill-success-subtle-default border-transparent text-text-success hover:bg-fill-success-default'
                : 'bg-fill-warning-subtle-default border-transparent text-text-warning hover:bg-fill-warning-default',
            )}
          >
            {item.attendance === 'ATTENDED' ? (
              <CheckCircle className="w-3 h-3 shrink-0" />
            ) : (
              <Clock className="w-3 h-3 shrink-0" />
            )}
            <span className="truncate pointer-events-none">{item.subject}</span>
          </div>
        ))}
        {dayItems.length > 2 && (
          <div className="text-[9px] text-text-subtle font-bold">+{dayItems.length - 2}개 더</div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-background-default rounded-200 border border-border-subtle shadow-1">
      <div className="flex items-center justify-between p-400 border-b border-border-subtle bg-background-alternative/50 rounded-t-200">
        <button onClick={() => onDateChange(new Date(year, month - 1, 1))} className="p-100 hover:bg-fill-neutral-subtle-hover rounded-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-text-subtle" />
        </button>
        <h3 className="font-bold-h5 text-text-strong">{year}년 {monthNames[month]}</h3>
        <button onClick={() => onDateChange(new Date(year, month + 1, 1))} className="p-100 hover:bg-fill-neutral-subtle-hover rounded-100 transition-colors">
          <ChevronRight className="w-5 h-5 text-text-subtle" />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-border-subtle">
        {dayNames.map((name, idx) => (
          <div
            key={name}
            className={cn(
              'p-200 text-center font-designer-13b bg-background-alternative/80',
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
          <div key={`empty-${i}`} className="min-h-[80px] border border-border-subtlest bg-fill-neutral-subtle-default/30" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => renderCalendarDay(i + 1))}
      </div>

      {/* Global Tooltip Portal (Fixed Position) */}
      {activeTooltip && (
        <div 
          className="fixed z-[9999] bg-fill-neutral-strong-default text-text-inverse px-200 py-150 rounded-100 text-[12px] font-medium leading-relaxed shadow-3 border border-border-subtle break-words pointer-events-none max-w-[240px]"
          style={{
            top: activeTooltip.rect.top - 8,
            left: activeTooltip.rect.left + (activeTooltip.rect.width / 2),
            transform: 'translate(-50%, -100%)',
          }}
        >
          {/* Arrow (Bottom) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-fill-neutral-strong-default"></div>
          
          {activeTooltip.text}
        </div>
      )}
    </div>
  );
};


