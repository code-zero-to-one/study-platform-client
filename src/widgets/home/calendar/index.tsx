'use client';

import { ko } from 'date-fns/locale';
import * as React from 'react';
import { cn } from '@/shared/shadcn/lib/utils';
import { Calendar as ShadcnCalendar } from '@/shared/shadcn/ui/calendar';
import { formatCaption } from '@/widgets/home/calendar/calendar.utils';
import { CalendarDay } from '@/widgets/home/calendar/calendarDay';

type CalendarProps = React.ComponentProps<typeof ShadcnCalendar> & {
  completedDays?: Date[];
  monthlyCompletedCount?: number;
  totalCompletedCount?: number;
};

const Calendar = ({
  className,
  completedDays = [],
  monthlyCompletedCount,
  totalCompletedCount,
  ...props
}: CalendarProps) => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;

  return (
    <div
      className={cn(
        'relative',
        'flex flex-col items-start gap-150 self-stretch p-200',
        'rounded-200 border',
        'bg-icon-inverse border-border-subtle',
        className,
      )}
    >
      <ShadcnCalendar
        className="w-full"
        locale={ko}
        formatters={{
          formatCaption,
        }}
        modifiers={{
          completed: completedDays,
          sunday: (date) => date.getDay() === 0,
        }}
        components={{
          Day: CalendarDay,
        }}
        classNames={{
          months: 'flex flex-col',
          caption_label: 'd18b',
          nav: 'absolute right-200 flex items-center',
          button_next: 'p-[4px]',
          button_previous: 'p-[4px]',
          head_row: 'flex',
          row: 'flex w-full',
          weekday: 'pt-[16px]',
          day: 'text-center d14m rounded-full',
        }}
        footer={
          (typeof monthlyCompletedCount === 'number' ||
            typeof totalCompletedCount === 'number') && (
            <div className="flex w-full flex-col gap-75 pt-200">
              {typeof monthlyCompletedCount === 'number' && (
                <div className="rounded-100 bg-background-alternative d14m text-text-default px-150 py-100 text-ellipsis">
                  {currentMonth}월은 {monthlyCompletedCount}번의 스터디를
                  완료했어요.
                </div>
              )}
              {typeof totalCompletedCount === 'number' && (
                <div className="rounded-100 bg-background-alternative d14m text-text-default px-150 py-100 text-ellipsis">
                  총 {totalCompletedCount}번의 스터디를 완료했어요.
                </div>
              )}
            </div>
          )
        }
        {...props}
      />
    </div>
  );
};

export default Calendar;
