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
            "relative w-[14.28%] text-center align-top",
            className
         )}
         {...props}
      >
         <div className="relative w-full">
            <div className="pt-[100%]" />
            <div className="absolute inset-0 flex items-center justify-center">
               {children}
            </div>
         </div>
      </td>
   )
}
