'use client';

import { ko } from 'date-fns/locale';
import React, { useState } from 'react';
import { HTMLAttributes } from 'react';
import {
  type CalendarDay as DayPickerDay,
  type Modifiers,
} from 'react-day-picker';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { Calendar as ShadcnCalendar } from '@/components/common/ui/(shadcn)/ui/calendar';
import { useMonthlyStudyCalendarQuery } from '@/hooks/queries/use-schedule-query';

interface CalendarDayProps extends HTMLAttributes<HTMLTableCellElement> {
  day: DayPickerDay;
  modifiers?: Modifiers;
  children?: React.ReactNode;
}

export function CalendarDay({
  day,
  modifiers,
  children,
  className,
  ...props
}: CalendarDayProps) {
  const customClass = cn(
    modifiers?.outside && 'text-text-subtlest',
    !modifiers?.outside &&
      modifiers?.completed &&
      'bg-fill-success-default-default text-text-inverse rounded-full',
    !modifiers?.outside &&
      !modifiers?.completed &&
      modifiers?.sunday &&
      'text-text-error',
  );

  return (
    <td className={cn('relative text-center align-top', className)} {...props}>
      <div className="relative w-full">
        <div className="pt-[100%]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              'flex size-[32px] items-center justify-center rounded-full',
              customClass,
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </td>
  );
}

export const formatCaption = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${year}.${month}`;
};

const Calendar = (props: React.ComponentProps<typeof ShadcnCalendar>) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth() + 1;

  const { data, isLoading } = useMonthlyStudyCalendarQuery({ year, month });

  const completedDays = React.useMemo(() => {
    if (!data?.calendar) return [];

    return data.calendar
      .filter((entry) => entry.hasStudy && entry.status === 'COMPLETE')
      .map((entry) => new Date(year, month - 1, entry.day));
  }, [data, year, month]);

  if (isLoading) return <div>로딩 중...</div>;

  const monthlyCount = data?.monthlyCompletedCount;
  const totalCount = data?.totalCompletedCount;
  const showFooter =
    typeof monthlyCount === 'number' && typeof totalCount === 'number';

  return (
    <div
      className={cn(
        'relative',
        'flex flex-col items-start gap-150 self-stretch p-250',
        'rounded-200 border',
        'bg-icon-inverse border-border-subtle',
      )}
    >
      <ShadcnCalendar
        className="w-full"
        locale={ko}
        month={selectedMonth}
        onMonthChange={setSelectedMonth}
        formatters={{ formatCaption }}
        modifiers={{
          completed: completedDays,
          sunday: (date) => date.getDay() === 0,
        }}
        components={{ Day: CalendarDay }}
        classNames={{
          months: 'flex flex-col',
          caption_label: 'font-designer-18b',
          nav: 'absolute right-200 flex items-center',
          button_next: 'p-[4px]',
          button_previous: 'p-[4px]',
          head_row: 'flex',
          row: 'flex w-full',
          weekday: 'pt-200',
          day: 'text-center font-designer-14m rounded-full',
        }}
        footer={
          showFooter ? (
            <div className="flex w-full flex-col gap-75 pt-200">
              <div className="rounded-100 bg-background-alternative font-designer-14m text-text-default px-150 py-100 text-ellipsis">
                {month}월은 {data.monthlyCompletedCount}번의 스터디를
                완료했어요.
              </div>
              <div className="rounded-100 bg-background-alternative font-designer-14m text-text-default px-150 py-100 text-ellipsis">
                총 {data.totalCompletedCount}번의 스터디를 완료했어요.
              </div>
            </div>
          ) : undefined
        }
        {...props}
      />
    </div>
  );
};

export default Calendar;
