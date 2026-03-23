'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { BaseInput } from '@/components/common/ui/input';
import {
  createEmptyMentorScheduleDraftErrors,
  createMentorScheduleTextDrafts,
  createEmptyWeeklySchedule,
  createHalfHourTimeSlots,
  EMPTY_MENTOR_SCHEDULE_DRAFT_MESSAGE,
  getMentorScheduleDraftErrors,
  MENTOR_SCHEDULE_DRAFT_MAX_LENGTH,
  normalizeMentorScheduleTextDrafts,
  parseMentorScheduleTimeRangeText,
  sortMentorScheduleSlots,
  toMentorScheduleTextRanges,
} from '@/features/mentoring/model/mentor-settings';
import type { MentorRegistrationScheduleDraftState } from '@/types/mentoring/registration-view';
import {
  type MentorScheduleTextDrafts,
  WEEKDAY_KEYS,
  WEEKDAY_LABEL_MAP,
  type MentorWeeklySchedule,
  type WeekdayKey,
} from '@/types/mentoring/settings';

interface WeeklyScheduleGridProps {
  value: MentorWeeklySchedule | undefined;
  onChange: (next: MentorWeeklySchedule) => void;
  initialTextDrafts?: MentorScheduleTextDrafts;
  onDraftStateChange?: (state: MentorRegistrationScheduleDraftState) => void;
}

const TIME_SLOTS = createHalfHourTimeSlots();

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

const createFallbackSchedule = (): MentorWeeklySchedule => {
  return {
    timezone: 'Asia/Seoul',
    slotUnitMinutes: 30,
    weekly: createEmptyWeeklySchedule(),
  };
};

const normalizeWeeklySchedule = (
  value: MentorWeeklySchedule | undefined,
): MentorWeeklySchedule => {
  if (!value) {
    return createFallbackSchedule();
  }

  return {
    timezone: value.timezone === 'Asia/Seoul' ? 'Asia/Seoul' : 'Asia/Seoul',
    slotUnitMinutes: value.slotUnitMinutes === 30 ? 30 : 30,
    weekly: createWeekdayRecord((day) => {
      const slots = value.weekly?.[day];

      if (!Array.isArray(slots)) {
        return [];
      }

      return sortMentorScheduleSlots(
        slots.filter((slot): slot is string => typeof slot === 'string'),
      );
    }),
  };
};

const buildTimeRangeDrafts = (
  schedule: MentorWeeklySchedule,
): Record<WeekdayKey, string[]> => createMentorScheduleTextDrafts(schedule);

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

const areSameDraftErrors = (
  left: Record<WeekdayKey, string>,
  right: Record<WeekdayKey, string>,
) => {
  return WEEKDAY_KEYS.every((day) => left[day] === right[day]);
};

function WeeklyScheduleGrid({
  value,
  onChange,
  initialTextDrafts,
  onDraftStateChange,
}: WeeklyScheduleGridProps) {
  const normalizedValue = useMemo(
    () => normalizeWeeklySchedule(value),
    [value],
  );
  const normalizedInitialTextDrafts = useMemo(
    () => normalizeMentorScheduleTextDrafts(initialTextDrafts, normalizedValue),
    [initialTextDrafts, normalizedValue],
  );
  const normalizedInitialTimeRangeErrors = useMemo(
    () => getMentorScheduleDraftErrors(normalizedInitialTextDrafts),
    [normalizedInitialTextDrafts],
  );
  const displayedWeekly = normalizedValue.weekly;
  const dragModeRef = useRef<'add' | 'remove' | null>(null);
  const dragLastCellRef = useRef<{ day: WeekdayKey; slot: string } | null>(
    null,
  );
  const currentValueRef = useRef(normalizedValue);
  const [mobileDay, setMobileDay] = useState<WeekdayKey>(WEEKDAY_KEYS[0]);
  const [timeRangeDrafts, setTimeRangeDrafts] = useState<
    Record<WeekdayKey, string[]>
  >(() => normalizedInitialTextDrafts);
  const [timeRangeErrors, setTimeRangeErrors] = useState<
    Record<WeekdayKey, string>
  >(() => normalizedInitialTimeRangeErrors);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousIncomingDraftsRef = useRef(normalizedInitialTextDrafts);
  const previousIncomingErrorsRef = useRef(normalizedInitialTimeRangeErrors);

  useEffect(() => {
    currentValueRef.current = normalizedValue;

    if (
      WEEKDAY_KEYS.every((day) =>
        areSameTextRanges(
          previousIncomingDraftsRef.current[day],
          normalizedInitialTextDrafts[day],
        ),
      ) &&
      areSameDraftErrors(
        previousIncomingErrorsRef.current,
        normalizedInitialTimeRangeErrors,
      )
    ) {
      return;
    }

    previousIncomingDraftsRef.current = normalizedInitialTextDrafts;
    previousIncomingErrorsRef.current = normalizedInitialTimeRangeErrors;
    setTimeRangeDrafts(normalizedInitialTextDrafts);
    setTimeRangeErrors(normalizedInitialTimeRangeErrors);
  }, [
    normalizedInitialTextDrafts,
    normalizedInitialTimeRangeErrors,
    normalizedValue,
  ]);

  useEffect(() => {
    if (!onDraftStateChange) {
      return;
    }

    onDraftStateChange({
      drafts: timeRangeDrafts,
      errors: timeRangeErrors,
    });
  }, [onDraftStateChange, timeRangeDrafts, timeRangeErrors]);

  const commitSchedule = useCallback(
    (
      next: MentorWeeklySchedule,
      options?: { syncTextDrafts?: boolean; resetErrors?: boolean },
    ) => {
      const normalizedNext = normalizeWeeklySchedule(next);
      const shouldSyncTextDrafts = options?.syncTextDrafts ?? true;
      const shouldResetErrors = options?.resetErrors ?? shouldSyncTextDrafts;

      currentValueRef.current = normalizedNext;

      if (shouldSyncTextDrafts) {
        const nextDrafts = buildTimeRangeDrafts(normalizedNext);
        setTimeRangeDrafts((prev) =>
          WEEKDAY_KEYS.every((day) =>
            areSameTextRanges(prev[day], nextDrafts[day]),
          )
            ? prev
            : nextDrafts,
        );
      }

      if (shouldResetErrors) {
        setTimeRangeErrors((prev) =>
          WEEKDAY_KEYS.every((day) => prev[day].length === 0)
            ? prev
            : createEmptyMentorScheduleDraftErrors(),
        );
      }

      onChange(normalizedNext);
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
              ? sortMentorScheduleSlots([...daySlots, slot])
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

  const syncTimeRangeText = useCallback(
    ({
      day,
      drafts,
      normalizeDrafts,
    }: {
      day: WeekdayKey;
      drafts: string[];
      normalizeDrafts: boolean;
    }) => {
      const joinedText = drafts
        .map((draft) => draft.trim())
        .filter((draft) => draft.length > 0)
        .join(RANGE_DELIMITER);
      const parsed = parseMentorScheduleTimeRangeText(joinedText);

      if ('error' in parsed) {
        setTimeRangeErrors((prev) => ({
          ...prev,
          [day]: parsed.error,
        }));

        return false;
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

      if (normalizeDrafts) {
        const nextDrafts = toMentorScheduleTextRanges(parsed.slots);
        setTimeRangeDrafts((prev) => {
          if (areSameTextRanges(prev[day], nextDrafts)) {
            return prev;
          }

          return {
            ...prev,
            [day]: nextDrafts,
          };
        });
      }

      const currentSchedule = currentValueRef.current;
      const currentSlots = sortMentorScheduleSlots(currentSchedule.weekly[day]);

      if (areSameSlots(currentSlots, parsed.slots)) {
        return true;
      }

      commitSchedule(
        {
          ...currentSchedule,
          weekly: {
            ...currentSchedule.weekly,
            [day]: parsed.slots,
          },
        },
        {
          syncTextDrafts: false,
          resetErrors: false,
        },
      );
      resetDragState();

      return true;
    },
    [commitSchedule, resetDragState],
  );

  const handleTimeRangeDraftChange = (
    day: WeekdayKey,
    blockIndex: number,
    nextValue: string,
  ) => {
    const nextDrafts = [...timeRangeDrafts[day]];
    nextDrafts[blockIndex] = nextValue;

    setTimeRangeDrafts((prev) => ({
      ...prev,
      [day]: nextDrafts,
    }));
    syncTimeRangeText({
      day,
      drafts: nextDrafts,
      normalizeDrafts: false,
    });
  };

  const handleAddTimeRangeDraft = (day: WeekdayKey) => {
    setTimeRangeDrafts((prev) => ({
      ...prev,
      [day]: [...prev[day], ''],
    }));
    setTimeRangeErrors((prev) => ({
      ...prev,
      [day]: EMPTY_MENTOR_SCHEDULE_DRAFT_MESSAGE,
    }));
  };

  const handleRemoveTimeRangeDraft = (day: WeekdayKey, blockIndex: number) => {
    const currentDrafts = timeRangeDrafts[day];
    if (currentDrafts.length === 1) {
      setTimeRangeDrafts((prev) => ({
        ...prev,
        [day]: [],
      }));
      syncTimeRangeText({
        day,
        drafts: [],
        normalizeDrafts: true,
      });

      return;
    }

    const nextDrafts = currentDrafts.filter((_, index) => index !== blockIndex);
    setTimeRangeDrafts((prev) => ({
      ...prev,
      [day]: nextDrafts,
    }));
    syncTimeRangeText({
      day,
      drafts: nextDrafts,
      normalizeDrafts: true,
    });
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
    syncTimeRangeText({
      day,
      drafts: nextDrafts,
      normalizeDrafts: true,
    });
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
      newWeekly[day] = sortMentorScheduleSlots(merged);
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

  const hasAnySlot = WEEKDAY_KEYS.some(
    (day) => displayedWeekly[day].length > 0,
  );

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
            const count = displayedWeekly[day].length;

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
                displayedWeekly[mobileDay].length === TIME_SLOTS.length
                  ? 'text-text-error'
                  : 'text-text-brand',
              )}
            >
              {displayedWeekly[mobileDay].length === TIME_SLOTS.length
                ? '전체 해제'
                : '전체 선택'}
            </button>
          </div>
          <div className="max-h-[380px] overflow-y-auto select-none">
            {Array.from({ length: 24 }, (_, hour) => {
              const h = String(hour).padStart(2, '0');
              const slot1 = `${h}:00`;
              const slot2 = `${h}:30`;
              const active1 = displayedWeekly[mobileDay].includes(slot1);
              const active2 = displayedWeekly[mobileDay].includes(slot2);

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
              const count = displayedWeekly[day].length;
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
                    const isActive = displayedWeekly[day].includes(slot);

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
                          syncTimeRangeText({
                            day,
                            drafts: nextDrafts,
                            normalizeDrafts: true,
                          });
                        }}
                        onKeyDown={(event) =>
                          handleTimeRangeDraftKeyDown(day, blockIndex, event)
                        }
                        placeholder={TIME_RANGE_BLOCK_PLACEHOLDER}
                        maxLength={MENTOR_SCHEDULE_DRAFT_MAX_LENGTH}
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
  return (
    prev.value === next.value &&
    prev.onChange === next.onChange &&
    prev.initialTextDrafts === next.initialTextDrafts &&
    prev.onDraftStateChange === next.onDraftStateChange
  );
};

export default memo(WeeklyScheduleGrid, areWeeklyScheduleGridPropsEqual);
