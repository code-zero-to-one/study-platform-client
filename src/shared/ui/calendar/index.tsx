// src/shared/ui/calendar/index.tsx

'use client'

import { ko } from "date-fns/locale"
import * as React from 'react'
import { cn } from '@/shared/shadcn/lib/utils'
import { Calendar as ShadcnCalendar } from '@/shared/shadcn/ui/calendar'
import { formatCaption } from '@/shared/ui/calendar/calendar.utils'
import { CalendarDay } from '@/shared/ui/calendar/calendarDay'

type CalendarProps = React.ComponentProps<typeof ShadcnCalendar> & {
   completedDays?: Date[]
}

const Calendar = ({ className, completedDays = [], ...props }: CalendarProps) => {
   return (
      <div
         className={cn(
            'relative',
            'flex flex-col p-5 gap-4 items-start self-stretch',
            'rounded-[16px] border',
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
            }}
            classNames={{
               months: 'flex flex-col',
               caption_label: 'd18b',
               nav: 'absolute right-0 flex items-center',
               nav_button: 'p-1',
               head_row: 'flex',
               row: 'flex w-full',
               head_cell: 'text-center text-sm text-gray-400 w-[14.28%]',
               cell: 'w-[14.28%] h-14 text-center text-sm relative',
               day: 'text-center d14m',
               day_today: 'text-primary font-bold',
               day_selected: 'bg-black text-white',
               day_disabled: 'text-gray-300 opacity-50',
            }}
            components={{
               Day: CalendarDay,
            }}
            {...props}
         />
      </div>
   )
}

export default Calendar
