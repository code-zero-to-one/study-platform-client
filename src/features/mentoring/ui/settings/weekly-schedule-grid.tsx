'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  addMinutesToTime,
  createHalfHourTimeSlots,
} from '@/features/mentoring/model/mentor-settings';
import {
  WEEKDAY_KEYS,
  WEEKDAY_LABEL_MAP,
  type MentorWeeklySchedule,
  type WeekdayKey,
} from '@/types/mentoring/settings';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { BaseInput } from '@/components/common/ui/input';

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
const TIME_RANGE_PLACEHOLDER = '예: 09:00~12:00 / 13:30~15:00';
const TIME_RANGE_BLOCK_PLACEHOLDER = '예: 09:00~12:00';
const RANGE_DELIMITER = ' / ';
const RANGE_TOKEN_SPLIT_REGEX = /[,\n/]/;
const RANGE_TEXT_REGEX = /^(\d{2}:\d{2})\s*[~-]\s*(\d{2}:\d{2}|24:00)$/;
const TIME_TEXT_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MINUTES_PER_SLOT = 30;
const DAY_END_MINUTES = 24 * 60;

const DAY_INDEX_MAP = Object.fromEntries(
  WEEKDAY_KEYS.map((day, index) => [day, index]),
) as Record<WeekdayKey, number>;

const SLOT_INDEX_MAP = TIME_SLOTS.reduce<Record<string, number>>(
  (acc, slot, index) => {
    acc[slot] = index;

    return acc;
  },
  {},
);

interface GridPoint {
  dayIndex: number;
  slotIndex: number;
}

const getInterpolatedPoints = (from: GridPoint, to: GridPoint): GridPoint[] => {
  const points: GridPoint[] = [];
  let x = from.dayIndex;
  let y = from.slotIndex;
  const targetX = to.dayIndex;
  const targetY = to.slotIndex;
  const deltaX = Math.abs(targetX - x);
  const stepX = x < targetX ? 1 : -1;
  const deltaY = -Math.abs(targetY - y);
  const stepY = y < targetY ? 1 : -1;
  let error = deltaX + deltaY;

  while (x !== targetX || y !== targetY) {
    points.push({ dayIndex: x, slotIndex: y });

    const doubledError = 2 * error;

    if (doubledError >= deltaY) {
      error += deltaY;
      x += stepX;
    }

    if (doubledError <= deltaX) {
      error += deltaX;
      y += stepY;
    }
  }

  points.push({ dayIndex: targetX, slotIndex: targetY });

  return points;
};

const createWeekdayRecord = <T,>(
  buildValue: (day: WeekdayKey) => T,
): Record<WeekdayKey, T> => {
  const record = {} as Record<WeekdayKey, T>;

  WEEKDAY_KEYS.forEach((day) => {
    record[day] = buildValue(day);
  });

  return record;
};

const buildTimeRangeDrafts = (
  schedule: MentorWeeklySchedule,
): Record<WeekdayKey, string[]> =>
  createWeekdayRecord((day) => {
    return toTimeRanges(schedule.weekly[day]);
  });

const createEmptyTimeRangeErrors = (): Record<WeekdayKey, string> =>
  createWeekdayRecord(() => '');

const parseTimeTextToMinutes = (timeText: string): number | undefined => {
  if (timeText === '24:00') {
    return DAY_END_MINUTES;
  }

  if (!TIME_TEXT_REGEX.test(timeText)) {
    return undefined;
  }

  const [hourText, minuteText] = timeText.split(':');

  return Number(hourText) * 60 + Number(minuteText);
};

const toSlotText = (minutes: number): string => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const parseTimeRangeText = (
  rawValue: string,
):
  | { slots: string[]; normalizedText: string }
  | { error: string; slots?: never; normalizedText?: never } => {
  const trimmed = rawValue.trim();

  if (trimmed.length === 0) {
    return { slots: [], normalizedText: '' };
  }

  const tokens = trimmed
    .split(RANGE_TOKEN_SPLIT_REGEX)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  if (tokens.length === 0) {
    return { slots: [], normalizedText: '' };
  }

  const slotSet = new Set<string>();

  for (const token of tokens) {
    const match = token.match(RANGE_TEXT_REGEX);

    if (!match) {
      return {
        error: `시간 형식이 올바르지 않아요. ${TIME_RANGE_PLACEHOLDER}`,
      };
    }

    const [, startText, endText] = match;
    const startMinutes = parseTimeTextToMinutes(startText);
    const endMinutes = parseTimeTextToMinutes(endText);

    if (startMinutes === undefined || endMinutes === undefined) {
      return {
        error: `시간은 HH:mm 형식으로 입력해주세요. ${TIME_RANGE_PLACEHOLDER}`,
      };
    }

    if (startMinutes >= DAY_END_MINUTES || endMinutes > DAY_END_MINUTES) {
      return { error: '시간은 00:00~24:00 범위에서 입력해주세요.' };
    }

    if (
      startMinutes % MINUTES_PER_SLOT !== 0 ||
      endMinutes % MINUTES_PER_SLOT !== 0
    ) {
      return { error: '시간은 30분 단위(00, 30)로 입력해주세요.' };
    }

    if (startMinutes >= endMinutes) {
      return { error: '종료 시간은 시작 시간보다 늦어야 합니다.' };
    }

    for (
      let cursor = startMinutes;
      cursor < endMinutes;
      cursor += MINUTES_PER_SLOT
    ) {
      slotSet.add(toSlotText(cursor));
    }
  }

  const slots = sortSlots(Array.from(slotSet));

  return {
    slots,
    normalizedText: toTimeRanges(slots).join(RANGE_DELIMITER),
  };
};

const areSameSlots = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((slot, index) => slot === right[index]);
};

const areSameTextRanges = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
};

function WeeklyScheduleGrid({ value, onChange }: WeeklyScheduleGridProps) {
  const dragModeRef = useRef<'add' | 'remove' | null>(null);
  const dragLastCellRef = useRef<{ day: WeekdayKey; slot: string } | null>(
    null,
  );
  const currentValueRef = useRef(value);
  const [mobileDay, setMobileDay] = useState<WeekdayKey>(WEEKDAY_KEYS[0]);
  const [timeRangeDrafts, setTimeRangeDrafts] = useState<
    Record<WeekdayKey, string[]>
  >(() => buildTimeRangeDrafts(value));
  const [timeRangeErrors, setTimeRangeErrors] = useState<
    Record<WeekdayKey, string>
  >(() => createEmptyTimeRangeErrors());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentValueRef.current = value;
    setTimeRangeDrafts(buildTimeRangeDrafts(value));
    setTimeRangeErrors(createEmptyTimeRangeErrors());
  }, [value]);

  const commitSchedule = useCallback(
    (next: MentorWeeklySchedule) => {
      currentValueRef.current = next;
      onChange(next);
    },
    [onChange],
  );

  const resetDragState = useCallback(() => {
    dragModeRef.current = null;
    dragLastCellRef.current = null;
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      resetDragState();
    };
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resetDragState]);

  const applySlotByMode = useCallback(
    (day: WeekdayKey, slot: string, mode: 'add' | 'remove') => {
      const currentSchedule = currentValueRef.current;
      const daySlots = currentSchedule.weekly[day];
      const hasSlot = daySlots.includes(slot);

      if ((mode === 'add' && hasSlot) || (mode === 'remove' && !hasSlot)) {
        return;
      }

      const nextSchedule: MentorWeeklySchedule = {
        ...currentSchedule,
        weekly: {
          ...currentSchedule.weekly,
          [day]:
            mode === 'add'
              ? sortSlots([...daySlots, slot])
              : daySlots.filter((selected) => selected !== slot),
        },
      };

      commitSchedule(nextSchedule);
    },
    [commitSchedule],
  );

  const applyDragPath = useCallback(
    (day: WeekdayKey, slot: string) => {
      const dragMode = dragModeRef.current;
      if (!dragMode) {
        return;
      }

      const nextDayIndex = DAY_INDEX_MAP[day];
      const nextSlotIndex = SLOT_INDEX_MAP[slot];
      if (nextSlotIndex === undefined) {
        return;
      }

      const lastCell = dragLastCellRef.current;
      if (!lastCell) {
        applySlotByMode(day, slot, dragMode);
        dragLastCellRef.current = { day, slot };

        return;
      }

      const previousSlotIndex = SLOT_INDEX_MAP[lastCell.slot];
      if (previousSlotIndex === undefined) {
        applySlotByMode(day, slot, dragMode);
        dragLastCellRef.current = { day, slot };

        return;
      }

      const previousDayIndex = DAY_INDEX_MAP[lastCell.day];
      const points = getInterpolatedPoints(
        { dayIndex: previousDayIndex, slotIndex: previousSlotIndex },
        { dayIndex: nextDayIndex, slotIndex: nextSlotIndex },
      );

      points.forEach(({ dayIndex, slotIndex }) => {
        const targetDay = WEEKDAY_KEYS[dayIndex];
        const targetSlot = TIME_SLOTS[slotIndex];

        if (!targetDay || !targetSlot) {
          return;
        }

        applySlotByMode(targetDay, targetSlot, dragMode);
      });

      dragLastCellRef.current = { day, slot };
    },
    [applySlotByMode],
  );

  const handleMouseDown = (
    day: WeekdayKey,
    slot: string,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    const isActive = currentValueRef.current.weekly[day].includes(slot);
    dragModeRef.current = isActive ? 'remove' : 'add';
    dragLastCellRef.current = null;
    applyDragPath(day, slot);
  };

  const handleMouseEnter = (day: WeekdayKey, slot: string) => {
    applyDragPath(day, slot);
  };

  const handleTimeRangeDraftChange = (
    day: WeekdayKey,
    blockIndex: number,
    nextValue: string,
  ) => {
    setTimeRangeDrafts((prev) => {
      const nextDayDrafts = [...prev[day]];
      nextDayDrafts[blockIndex] = nextValue;

      return {
        ...prev,
        [day]: nextDayDrafts,
      };
    });

    setTimeRangeErrors((prev) => {
      if (!prev[day]) {
        return prev;
      }

      return {
        ...prev,
        [day]: '',
      };
    });
  };

  const applyTimeRangeText = useCallback(
    (day: WeekdayKey, drafts: string[]) => {
      const joinedText = drafts
        .map((draft) => draft.trim())
        .filter((draft) => draft.length > 0)
        .join(RANGE_DELIMITER);
      const parsed = parseTimeRangeText(joinedText);

      if ('error' in parsed) {
        setTimeRangeErrors((prev) => ({
          ...prev,
          [day]: parsed.error,
        }));

        return;
      }

      setTimeRangeErrors((prev) => {
        if (!prev[day]) {
          return prev;
        }

        return {
          ...prev,
          [day]: '',
        };
      });

      const normalizedDrafts = toTimeRanges(parsed.slots);
      const nextDrafts = normalizedDrafts;

      setTimeRangeDrafts((prev) => {
        if (areSameTextRanges(prev[day], nextDrafts)) {
          return prev;
        }

        return {
          ...prev,
          [day]: nextDrafts,
        };
      });

      const currentSchedule = currentValueRef.current;
      const currentSlots = sortSlots(currentSchedule.weekly[day]);

      if (areSameSlots(currentSlots, parsed.slots)) {
        return;
      }

      commitSchedule({
        ...currentSchedule,
        weekly: {
          ...currentSchedule.weekly,
          [day]: parsed.slots,
        },
      });
      resetDragState();
    },
    [commitSchedule, resetDragState],
  );

  const handleAddTimeRangeDraft = (day: WeekdayKey) => {
    setTimeRangeDrafts((prev) => ({
      ...prev,
      [day]: [...prev[day], ''],
    }));
  };

  const handleRemoveTimeRangeDraft = (day: WeekdayKey, blockIndex: number) => {
    const currentDrafts = timeRangeDrafts[day];
    if (currentDrafts.length === 1) {
      setTimeRangeDrafts((prev) => ({
        ...prev,
        [day]: [],
      }));
      applyTimeRangeText(day, []);

      return;
    }

    const nextDrafts = currentDrafts.filter((_, index) => index !== blockIndex);
    setTimeRangeDrafts((prev) => ({
      ...prev,
      [day]: nextDrafts,
    }));
    applyTimeRangeText(day, nextDrafts);
  };

  const handleTimeRangeDraftKeyDown = (
    day: WeekdayKey,
    blockIndex: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    const nextDrafts = [...timeRangeDrafts[day]];
    nextDrafts[blockIndex] = event.currentTarget.value;
    applyTimeRangeText(day, nextDrafts);
  };

  const toggleDay = (day: WeekdayKey) => {
    const currentSchedule = currentValueRef.current;
    const allSelected = TIME_SLOTS.every((slot) =>
      currentSchedule.weekly[day].includes(slot),
    );
    commitSchedule({
      ...currentSchedule,
      weekly: {
        ...currentSchedule.weekly,
        [day]: allSelected ? [] : [...TIME_SLOTS],
      },
    });
    resetDragState();
  };

  const applyQuickRangeToAll = (from: string, to: string) => {
    const currentSchedule = currentValueRef.current;
    const rangeSlots = getSlotsInRange(from, to);
    const newWeekly = { ...currentSchedule.weekly };
    WEEKDAY_KEYS.forEach((day) => {
      const existing = newWeekly[day];
      const merged = Array.from(new Set([...existing, ...rangeSlots]));
      newWeekly[day] = sortSlots(merged);
    });
    commitSchedule({ ...currentSchedule, weekly: newWeekly });
    resetDragState();
  };

  const clearAll = () => {
    const currentSchedule = currentValueRef.current;
    const newWeekly = {} as Record<WeekdayKey, string[]>;
    WEEKDAY_KEYS.forEach((day) => {
      newWeekly[day] = [];
    });
    commitSchedule({ ...currentSchedule, weekly: newWeekly });
    resetDragState();
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
                        'h-[36px] transition-colors',
                        active1
                          ? 'bg-fill-brand-subtle-default'
                          : 'bg-background-default hover:bg-background-alternative',
                      )}
                      onMouseDown={(e) => handleMouseDown(mobileDay, slot1, e)}
                      onMouseEnter={() => handleMouseEnter(mobileDay, slot1)}
                    />
                    <button
                      type="button"
                      className={cn(
                        'border-border-subtlest h-[36px] border-t transition-colors',
                        active2
                          ? 'bg-fill-brand-subtle-default'
                          : 'bg-background-default hover:bg-background-alternative',
                      )}
                      onMouseDown={(e) => handleMouseDown(mobileDay, slot2, e)}
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
        <div className="overflow-auto select-none">
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
                          'border-border-subtlest h-[30px] cursor-pointer border-l transition-colors first:border-l-0',
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

      {/* 선택 요약 + 텍스트 편집 */}
      <div className="border-border-subtlest rounded-100 space-y-75 border px-150 py-125">
        <p className="font-designer-12r text-text-subtle">
          선택된 시간 (텍스트 수정 가능)
        </p>
        <p className="font-designer-11r text-text-subtlest">
          {TIME_RANGE_PLACEHOLDER}
        </p>
        {WEEKDAY_KEYS.map((day) => (
          <div key={day} className="flex items-start gap-100">
            <span className="font-designer-13b text-text-subtle w-[20px] shrink-0 pt-75">
              {WEEKDAY_LABEL_MAP[day]}
            </span>
            <div className="w-full min-w-0">
              <div className="flex flex-wrap items-center gap-75">
                {timeRangeDrafts[day].map((draft, blockIndex) => (
                  <div
                    key={`${day}-${blockIndex}`}
                    className="flex items-center gap-50"
                  >
                    <div className="w-[180px] min-w-[180px]">
                      <BaseInput
                        size="m"
                        value={draft}
                        onValueChange={(nextValue) =>
                          handleTimeRangeDraftChange(day, blockIndex, nextValue)
                        }
                        onBlur={(event) => {
                          const nextDrafts = [...timeRangeDrafts[day]];
                          nextDrafts[blockIndex] = event.currentTarget.value;
                          applyTimeRangeText(day, nextDrafts);
                        }}
                        onKeyDown={(event) =>
                          handleTimeRangeDraftKeyDown(day, blockIndex, event)
                        }
                        placeholder={TIME_RANGE_BLOCK_PLACEHOLDER}
                        color={timeRangeErrors[day] ? 'error' : 'default'}
                        className="font-designer-13r h-[36px] py-75"
                      />
                    </div>
                    {timeRangeDrafts[day].length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveTimeRangeDraft(day, blockIndex)
                        }
                        className="font-designer-13m text-text-subtle hover:text-text-error rounded-75 border-border-default hover:border-border-error inline-flex h-[36px] w-[36px] shrink-0 items-center justify-center border transition-colors"
                        aria-label={`${WEEKDAY_LABEL_MAP[day]}요일 시간 블록 삭제`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddTimeRangeDraft(day)}
                  className="font-designer-12m text-text-brand hover:text-text-default hover:border-border-brand rounded-75 border-border-default inline-flex h-[36px] shrink-0 items-center border px-100 transition-colors"
                  aria-label={`${WEEKDAY_LABEL_MAP[day]}요일 시간 블록 추가`}
                >
                  + 블록
                </button>
              </div>
              {timeRangeErrors[day] && (
                <p className="font-designer-12r text-text-error mt-25">
                  {timeRangeErrors[day]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const areWeeklyScheduleGridPropsEqual = (
  prev: WeeklyScheduleGridProps,
  next: WeeklyScheduleGridProps,
) => {
  return prev.value === next.value && prev.onChange === next.onChange;
};

export default memo(WeeklyScheduleGrid, areWeeklyScheduleGridPropsEqual);
