'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import {
  addMinutesToTime,
  createHalfHourTimeSlots,
  WEEKDAY_KEYS,
  WEEKDAY_LABEL_MAP,
  type MentorWeeklySchedule,
  type WeekdayKey,
} from '@/features/mentoring/model/mentor-settings';

interface WeeklyScheduleGridProps {
  value: MentorWeeklySchedule;
  onChange: (next: MentorWeeklySchedule) => void;
}

const TIME_SLOTS = createHalfHourTimeSlots();

const sortSlots = (slots: string[]) =>
  [...slots].sort((a, b) => a.localeCompare(b));

const toTimeRanges = (slots: string[]): string[] => {
  if (slots.length === 0) return [];
  const sorted = sortSlots(slots);
  const ranges: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    if (addMinutesToTime(prev, 30) === curr) {
      prev = curr;
    } else {
      ranges.push(`${start}~${addMinutesToTime(prev, 30)}`);
      start = curr;
      prev = curr;
    }
  }
  ranges.push(`${start}~${addMinutesToTime(prev, 30)}`);
  return ranges;
};

const getSlotsInRange = (from: string, to: string) =>
  TIME_SLOTS.filter((slot) => slot >= from && slot < to);

const QUICK_RANGES = [
  { label: '새벽', from: '00:00', to: '06:00' },
  { label: '오전', from: '06:00', to: '12:00' },
  { label: '오후', from: '12:00', to: '18:00' },
  { label: '저녁', from: '18:00', to: '24:00' },
] as const;

export default function WeeklyScheduleGrid({
  value,
  onChange,
}: WeeklyScheduleGridProps) {
  const dragModeRef = useRef<'add' | 'remove' | null>(null);
  const [mobileDay, setMobileDay] = useState<WeekdayKey>(WEEKDAY_KEYS[0]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      dragModeRef.current = null;
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const toggleSlot = (day: WeekdayKey, slot: string) => {
    const curr = value.weekly[day];
    const hasSlot = curr.includes(slot);
    onChange({
      ...value,
      weekly: {
        ...value.weekly,
        [day]: hasSlot
          ? curr.filter((s) => s !== slot)
          : sortSlots([...curr, slot]),
      },
    });
  };

  const handleMouseDown = (
    day: WeekdayKey,
    slot: string,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    const isActive = value.weekly[day].includes(slot);
    dragModeRef.current = isActive ? 'remove' : 'add';
    toggleSlot(day, slot);
  };

  const handleMouseEnter = (day: WeekdayKey, slot: string) => {
    if (!dragModeRef.current) return;
    const isActive = value.weekly[day].includes(slot);
    if (dragModeRef.current === 'add' && !isActive) toggleSlot(day, slot);
    if (dragModeRef.current === 'remove' && isActive) toggleSlot(day, slot);
  };

  const toggleDay = (day: WeekdayKey) => {
    const allSelected = TIME_SLOTS.every((slot) =>
      value.weekly[day].includes(slot),
    );
    onChange({
      ...value,
      weekly: {
        ...value.weekly,
        [day]: allSelected ? [] : [...TIME_SLOTS],
      },
    });
  };

  const applyQuickRangeToAll = (from: string, to: string) => {
    const rangeSlots = getSlotsInRange(from, to);
    const newWeekly = { ...value.weekly };
    WEEKDAY_KEYS.forEach((day) => {
      const existing = newWeekly[day];
      const merged = Array.from(new Set([...existing, ...rangeSlots]));
      newWeekly[day] = sortSlots(merged);
    });
    onChange({ ...value, weekly: newWeekly });
  };

  const clearAll = () => {
    const newWeekly = {} as Record<WeekdayKey, string[]>;
    WEEKDAY_KEYS.forEach((day) => {
      newWeekly[day] = [];
    });
    onChange({ ...value, weekly: newWeekly });
  };

  const hasAnySlot = WEEKDAY_KEYS.some((day) => value.weekly[day].length > 0);

  return (
    <div className="space-y-150" ref={containerRef}>
      {/* 퀵 선택 */}
      <div className="flex flex-wrap items-center gap-75">
        <span className="font-designer-12r text-text-subtlest">
          전체 요일에 추가:
        </span>
        {QUICK_RANGES.map(({ label, from, to }) => (
          <button
            key={label}
            type="button"
            onClick={() => applyQuickRangeToAll(from, to)}
            className="font-designer-12m border-border-default text-text-subtle hover:border-border-brand hover:text-text-brand rounded-75 border px-100 py-50 transition-colors"
          >
            {label}
          </button>
        ))}
        {hasAnySlot && (
          <button
            type="button"
            onClick={clearAll}
            className="font-designer-12m text-text-error ml-auto"
          >
            전체 해제
          </button>
        )}
      </div>

      {/* 모바일 뷰 */}
      <div className="md:hidden">
        {/* 요일 탭 */}
        <div className="mb-100 flex gap-50 overflow-x-auto pb-50">
          {WEEKDAY_KEYS.map((day) => {
            const count = value.weekly[day].length;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setMobileDay(day)}
                className={cn(
                  'font-designer-13m rounded-100 shrink-0 border px-125 py-75 transition-colors',
                  mobileDay === day
                    ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
                    : 'border-border-default bg-background-default text-text-subtle',
                )}
              >
                <div>{WEEKDAY_LABEL_MAP[day]}</div>
                {count > 0 && (
                  <div className="font-designer-10r mt-25 opacity-80">
                    {count / 2}h
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 시간 타임그리드 */}
        <div className="border-border-default rounded-125 overflow-hidden border">
          <div className="bg-background-alternative border-border-default flex items-center justify-between border-b px-125 py-100">
            <span className="font-designer-13b text-text-default">
              {WEEKDAY_LABEL_MAP[mobileDay]}요일
            </span>
            <button
              type="button"
              onClick={() => toggleDay(mobileDay)}
              className={cn(
                'font-designer-12m',
                value.weekly[mobileDay].length === TIME_SLOTS.length
                  ? 'text-text-error'
                  : 'text-text-brand',
              )}
            >
              {value.weekly[mobileDay].length === TIME_SLOTS.length
                ? '전체 해제'
                : '전체 선택'}
            </button>
          </div>
          <div className="max-h-[380px] overflow-y-auto select-none">
            {Array.from({ length: 24 }, (_, hour) => {
              const h = String(hour).padStart(2, '0');
              const slot1 = `${h}:00`;
              const slot2 = `${h}:30`;
              const active1 = value.weekly[mobileDay].includes(slot1);
              const active2 = value.weekly[mobileDay].includes(slot2);
              return (
                <div
                  key={h}
                  className="border-border-subtlest flex border-t first:border-t-0"
                >
                  <div className="border-border-subtlest font-designer-11r text-text-subtlest flex w-[44px] shrink-0 items-center border-r px-75">
                    {slot1}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <button
                      type="button"
                      className={cn(
                        'h-[28px] transition-colors',
                        active1
                          ? 'bg-fill-brand-subtle-default'
                          : 'bg-background-default hover:bg-background-alternative',
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        dragModeRef.current = active1 ? 'remove' : 'add';
                        toggleSlot(mobileDay, slot1);
                      }}
                      onMouseEnter={() => handleMouseEnter(mobileDay, slot1)}
                    />
                    <button
                      type="button"
                      className={cn(
                        'border-border-subtlest h-[28px] border-t transition-colors',
                        active2
                          ? 'bg-fill-brand-subtle-default'
                          : 'bg-background-default hover:bg-background-alternative',
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        dragModeRef.current = active2 ? 'remove' : 'add';
                        toggleSlot(mobileDay, slot2);
                      }}
                      onMouseEnter={() => handleMouseEnter(mobileDay, slot2)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 데스크탑 타임그리드 */}
      <div className="border-border-default rounded-125 hidden overflow-hidden border md:block">
        <div
          className="overflow-auto select-none"
          onMouseLeave={() => {
            dragModeRef.current = null;
          }}
        >
          {/* 요일 헤더 */}
          <div className="bg-background-alternative border-border-default sticky top-0 z-10 grid grid-cols-[52px_repeat(7,1fr)] border-b">
            <div className="border-border-subtlest border-r" />
            {WEEKDAY_KEYS.map((day) => {
              const count = value.weekly[day].length;
              const allSelected = count === TIME_SLOTS.length;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  title={allSelected ? '전체 해제' : '전체 선택'}
                  className={cn(
                    'border-border-subtlest border-l py-100 text-center transition-colors first:border-l-0',
                    allSelected
                      ? 'text-text-brand'
                      : 'text-text-default hover:text-text-brand',
                  )}
                >
                  <div className="font-designer-13b">
                    {WEEKDAY_LABEL_MAP[day]}
                  </div>
                  <div
                    className={cn(
                      'font-designer-11r mt-25',
                      count > 0 ? 'text-text-brand' : 'text-text-subtlest',
                    )}
                  >
                    {count > 0 ? `${count / 2}h` : '-'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 슬롯 그리드 */}
          <div className="max-h-[480px] overflow-y-auto">
            {TIME_SLOTS.map((slot) => {
              const isHour = slot.endsWith(':00');
              return (
                <div
                  key={slot}
                  className={cn(
                    'grid grid-cols-[52px_repeat(7,1fr)]',
                    isHour
                      ? 'border-border-subtle border-t'
                      : 'border-border-subtlest border-t',
                  )}
                >
                  <div
                    className={cn(
                      'border-border-subtlest font-designer-11r flex items-center border-r px-75',
                      isHour ? 'text-text-subtle' : 'text-transparent',
                    )}
                  >
                    {slot}
                  </div>
                  {WEEKDAY_KEYS.map((day) => {
                    const isActive = value.weekly[day].includes(slot);
                    return (
                      <div
                        key={`${day}-${slot}`}
                        className={cn(
                          'border-border-subtlest h-[20px] cursor-pointer border-l transition-colors first:border-l-0',
                          isActive
                            ? 'bg-fill-brand-subtle-default hover:opacity-80'
                            : 'bg-background-default hover:bg-background-alternative',
                        )}
                        onMouseDown={(e) => handleMouseDown(day, slot, e)}
                        onMouseEnter={() => handleMouseEnter(day, slot)}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 선택 요약 */}
      {hasAnySlot && (
        <div className="border-border-subtlest rounded-100 space-y-50 border px-150 py-125">
          <p className="font-designer-12r text-text-subtle mb-75">
            선택된 시간
          </p>
          {WEEKDAY_KEYS.map((day) => {
            const ranges = toTimeRanges(value.weekly[day]);
            if (ranges.length === 0) return null;
            return (
              <div key={day} className="flex gap-100">
                <span className="font-designer-13b text-text-subtle w-[20px] shrink-0">
                  {WEEKDAY_LABEL_MAP[day]}
                </span>
                <span className="font-designer-13r text-text-default">
                  {ranges.join('  /  ')}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
