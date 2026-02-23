'use client';

import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import IconButton from '@/components/ui/icon-button';
import {
  type MentoringRequest,
  type MentoringSession,
} from '@/stores/useMentoringManagementStore';

interface MentoringScheduleCalendarProps {
  sessions: MentoringSession[];
  pendingRequests?: MentoringRequest[];
  selectedDate: string;
  currentMonth: dayjs.Dayjs;
  onDateSelect: (date: string) => void;
  onMonthChange: (month: dayjs.Dayjs) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function buildCalendarCells(month: dayjs.Dayjs): Array<dayjs.Dayjs | null> {
  const startOfMonth = month.startOf('month');
  const daysInMonth = month.daysInMonth();
  const startDow = startOfMonth.day();

  const cells: Array<dayjs.Dayjs | null> = [];
  for (let i = 0; i < startDow; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(startOfMonth.date(d));
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

function getSessionDotStyle(
  session: MentoringSession,
  todayStr: string,
): string {
  if (session.status === 'CANCELLED') {
    return 'bg-border-subtle opacity-60';
  }
  if (session.status === 'COMPLETED') {
    return 'bg-fill-neutral-subtle-default opacity-80';
  }

  const sessionDate = dayjs(session.startsAt).format('YYYY-MM-DD');
  const isPast = dayjs(session.startsAt).isBefore(dayjs(), 'minute');

  if (sessionDate === todayStr) {
    return 'bg-fill-information-default-default';
  }

  if (isPast) {
    return 'bg-fill-neutral-default-default opacity-70';
  }

  return 'bg-fill-success-default-default';
}

export default function MentoringScheduleCalendar({
  sessions,
  pendingRequests = [],
  selectedDate,
  currentMonth,
  onDateSelect,
  onMonthChange,
}: MentoringScheduleCalendarProps) {
  const today = dayjs();
  const todayStr = today.format('YYYY-MM-DD');
  const currentMonthStr = today.format('YYYY-MM');
  const viewingMonthStr = currentMonth.format('YYYY-MM');
  const isViewingCurrentMonth = viewingMonthStr === currentMonthStr;

  const sessionsByDate = useMemo(() => {
    const map: Record<string, MentoringSession[]> = {};
    sessions.forEach((session) => {
      const key = dayjs(session.startsAt).format('YYYY-MM-DD');
      if (!map[key]) map[key] = [];
      map[key].push(session);
    });

    return map;
  }, [sessions]);

  const pendingCountByDate = useMemo(() => {
    const map: Record<string, number> = {};
    pendingRequests.forEach((request) => {
      if (!request.preferredDate) return;
      map[request.preferredDate] = (map[request.preferredDate] ?? 0) + 1;
    });

    return map;
  }, [pendingRequests]);

  const cells = useMemo(() => buildCalendarCells(currentMonth), [currentMonth]);

  const handleDayClick = (date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    onDateSelect(selectedDate === dateStr ? '' : dateStr);
  };

  return (
    <div className="rounded-150 border-border-subtle bg-background-default border p-200">
      {/* 월 이동 헤더 */}
      <div className="mb-125 flex items-center justify-between">
        <IconButton
          onClick={() => onMonthChange(currentMonth.subtract(1, 'month'))}
          label="이전 달"
          className="p-75"
        >
          <ChevronLeft className="text-text-subtle h-16 w-16" />
        </IconButton>

        <div className="flex items-center gap-100">
          <h3 className="font-designer-16b text-text-default">
            {currentMonth.format('YYYY년 M월')}
          </h3>
          {!isViewingCurrentMonth && (
            <button
              type="button"
              onClick={() => onMonthChange(today)}
              className="font-designer-12m text-text-brand hover:text-text-brand rounded-50 border-border-brand border px-75 py-25 transition-colors"
            >
              오늘
            </button>
          )}
        </div>

        <IconButton
          onClick={() => onMonthChange(currentMonth.add(1, 'month'))}
          label="다음 달"
          className="p-75"
        >
          <ChevronRight className="text-text-subtle h-16 w-16" />
        </IconButton>
      </div>

      {/* 요일 헤더 */}
      <div className="mb-50 grid grid-cols-7 text-center">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={`font-designer-12m py-50 ${
              i === 0
                ? 'text-text-error'
                : i === 6
                  ? 'text-text-information'
                  : 'text-text-subtlest'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 달력 셀 */}
      <div className="grid grid-cols-7">
        {cells.map((date, idx) => {
          if (!date) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[68px]"
                aria-hidden="true"
              />
            );
          }

          const dateStr = date.format('YYYY-MM-DD');
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const isPastDay = date.isBefore(today, 'day');
          const isSunday = date.day() === 0;
          const isSaturday = date.day() === 6;
          const daySessions = sessionsByDate[dateStr] ?? [];
          const dayPendingCount = pendingCountByDate[dateStr] ?? 0;
          const totalCount = daySessions.length + dayPendingCount;
          const sessionDotsLimit = Math.min(daySessions.length, dayPendingCount > 0 ? 3 : 4);
          const displayDots = daySessions.slice(0, sessionDotsLimit);
          const pendingDotsCount = Math.min(dayPendingCount, 4 - displayDots.length);
          const extraCount = totalCount - displayDots.length - pendingDotsCount;

          const dayNumberColor = () => {
            if (isToday) return '';
            if (isPastDay) return 'text-text-subtlest';
            if (isSunday) return 'text-text-error';
            if (isSaturday) return 'text-text-information';

            return 'text-text-default';
          };

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => handleDayClick(date)}
              className={`flex min-h-[68px] flex-col items-center rounded-100 px-50 py-75 transition-colors ${
                isSelected
                  ? 'bg-fill-brand-subtle-default'
                  : 'hover:bg-background-alternative'
              }`}
            >
              {/* 날짜 숫자 */}
              <span
                className={`font-designer-13m mb-50 flex h-[24px] w-[24px] items-center justify-center rounded-full ${
                  isToday
                    ? 'bg-fill-brand-default-default font-designer-13b text-text-inverse'
                    : dayNumberColor()
                }`}
              >
                {date.date()}
              </span>

              {/* 세션/예정 점 */}
              {totalCount > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-[3px]">
                  {displayDots.map((session) => (
                    <span
                      key={session.id}
                      className={`block h-[6px] w-[6px] rounded-full ${getSessionDotStyle(session, todayStr)}`}
                    />
                  ))}
                  {Array.from({ length: pendingDotsCount }).map((_, i) => (
                    <span
                      key={`pending-${i}`}
                      className="bg-fill-warning-default-default block h-[6px] w-[6px] rounded-full"
                    />
                  ))}
                  {extraCount > 0 && (
                    <span className="font-designer-10m text-text-subtlest leading-none">
                      +{extraCount}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="border-border-subtle mt-125 flex flex-wrap items-center gap-150 border-t pt-100">
        <div className="flex items-center gap-50">
          <span className="bg-fill-warning-default-default block h-[7px] w-[7px] rounded-full" />
          <span className="font-designer-11m text-text-subtlest">미확정 예정</span>
        </div>
        <div className="flex items-center gap-50">
          <span className="bg-fill-success-default-default block h-[7px] w-[7px] rounded-full" />
          <span className="font-designer-11m text-text-subtlest">확정</span>
        </div>
        <div className="flex items-center gap-50">
          <span className="bg-fill-information-default-default block h-[7px] w-[7px] rounded-full" />
          <span className="font-designer-11m text-text-subtlest">오늘</span>
        </div>
        <div className="flex items-center gap-50">
          <span className="bg-fill-neutral-default-default block h-[7px] w-[7px] rounded-full opacity-70" />
          <span className="font-designer-11m text-text-subtlest">지난 예정</span>
        </div>
        <div className="flex items-center gap-50">
          <span className="bg-fill-neutral-subtle-default block h-[7px] w-[7px] rounded-full opacity-80" />
          <span className="font-designer-11m text-text-subtlest">완료</span>
        </div>
        <div className="flex items-center gap-50">
          <span className="bg-border-subtle block h-[7px] w-[7px] rounded-full opacity-60" />
          <span className="font-designer-11m text-text-subtlest">취소</span>
        </div>
      </div>
    </div>
  );
}
