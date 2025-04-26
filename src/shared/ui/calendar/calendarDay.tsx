'use client'

import { HTMLAttributes } from 'react'
import { type CalendarDay as DayPickerDay, type Modifiers } from 'react-day-picker'
import { cn } from '@/shared/shadcn/lib/utils'

interface CalendarDayProps extends HTMLAttributes<HTMLTableCellElement> {
   day: DayPickerDay
   modifiers: Modifiers
   children: React.ReactNode
}

export function CalendarDay({ day, modifiers, children, className, ...props }: CalendarDayProps) {

   return (
      <td
         className={cn(
            "relative w-[14.28%] h-14 text-center align-top",
            className
         )}
         {...props}
      >
         <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative z-10">
               {children}
            </div>
         </div>
      </td>
   )
}
