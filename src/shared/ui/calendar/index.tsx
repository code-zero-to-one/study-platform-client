'use client'

import { ko } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/shared/shadcn/lib/utils'
import { Calendar as ShadcnCalendar } from '@/shared/shadcn/ui/calendar'

// 타입 가져오기
type CalendarProps = React.ComponentProps<typeof ShadcnCalendar>

const Calendar = ({ className, ...props }: CalendarProps) => {
   return (
      <ShadcnCalendar
         className={cn('w-full', className)}
         locale={ko}
         formatters={{
            formatCaption: (date) => {
               const year = date.getFullYear()
               const month = String(date.getMonth() + 1).padStart(2, "0")

               return `${year}.${month}`
            },
         }}
         modifiers={{
            sunday: (date) => date.getDay() === 0, // ✅ 일요일만
         }}
         modifiersClassNames={{
            sunday: "text-error", // ✅ 일요일에 적용할 클래스
         }}
         classNames={{
            months: 'w-full flex flex-col',
            caption: 'justify-center items-center relative mb-4', // 가운데 정렬 + 여백
            caption_label: 'text-lg font-semibold',
            nav: 'absolute right-0 flex items-center gap-2', // 오른쪽에 버튼 배치
            nav_button: 'opacity-70 hover:opacity-100', // 네비 버튼 스타일

            head_cell: 'text-center text-sm text-gray-400', // 요일(일-토) 스타일
            cell: 'w-[14.28%] h-14 text-center text-sm relative', // 정사각형 셀

            day: 'text-center d14m aria-selected:bg-black aria-selected:text-white',
            day_today: 'text-primary font-bold', // 오늘 날짜 강조
            day_outside: 'text-gray-300', // 지난달/다음달 날짜 연하게
            day_selected: 'bg-black text-white', // 선택된 날짜
            day_disabled: 'text-gray-300 opacity-50',
            day_hidden: 'invisible',
         }}
         {...props}
      />
   )
}

export default Calendar
