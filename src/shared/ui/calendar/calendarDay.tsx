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
   const isCompleted = modifiers.completed

   return (
      <td
         className={cn(
            "relative w-[14.28%] h-14 text-center align-top", // 칸 너비와 높이
            className
         )}
         {...props}
      >
         <div className="relative w-full h-full flex items-center justify-center">
            {children}
            {isCompleted && (
               <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-100 rounded-full" />
            )}
         </div>
      </td>
   )
}
