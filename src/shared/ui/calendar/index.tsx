'use client'

import { ko } from "date-fns/locale"
import * as React from 'react'
import { cn } from '@/shared/shadcn/lib/utils'
import { Calendar as ShadcnCalendar } from '@/shared/shadcn/ui/calendar'
import { formatCaption } from '@/shared/ui/calendar/calendar.utils'
import { CalendarDay } from '@/shared/ui/calendar/calendarDay'


type CalendarProps = React.ComponentProps<typeof ShadcnCalendar> & {
   completedDays?: Date[]
   monthlyCompletedCount?: number
   totalCompletedCount?: number
}

const Calendar = ({
   className,
   completedDays = [],
   monthlyCompletedCount,
   totalCompletedCount,
   ...props
}: CalendarProps) => {
   const today = new Date()
   const currentMonth = today.getMonth() + 1

   return (
      <div
         className={cn(
            'relative',
            'flex flex-col p-200 gap-150 items-start self-stretch',
            'rounded-200 border',
            'bg-[var(--Icon-inverse,#FFF)] border-[var(--border-subtle,#F5F5F5)]',
            className
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
               (typeof monthlyCompletedCount === 'number' || typeof totalCompletedCount === 'number') && (
                  <div className="flex flex-col w-full gap-75 pt-200">
                     {typeof monthlyCompletedCount === 'number' && (
                        <div className="rounded-100 bg-background-alternative px-150 py-100 d14m text-text-default text-ellipsis">
                           {currentMonth}월은 {monthlyCompletedCount}번의 스터디를 완료했어요.
                        </div>
                     )}
                     {typeof totalCompletedCount === 'number' && (
                        <div className="rounded-100 bg-background-alternative px-150 py-100 d14m text-text-default text-ellipsis">
                           총 {totalCompletedCount}번의 스터디를 완료했어요.
                        </div>
                     )}
                  </div>
               )
            }
            {...props}
         />
      </div>
   )
}

export default Calendar
