'use client';

import { useState } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import {
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

const sortSlots = (slots: string[]) => {
  return [...slots].sort((a, b) => a.localeCompare(b));
};

export default function WeeklyScheduleGrid({
  value,
  onChange,
}: WeeklyScheduleGridProps) {
  const [selectedDay, setSelectedDay] = useState<WeekdayKey>(WEEKDAY_KEYS[0]);

  const toggleSlot = (day: WeekdayKey, slot: string) => {
    const currentSlots = value.weekly[day];
    const hasSlot = currentSlots.includes(slot);
    const nextDaySlots = hasSlot
      ? currentSlots.filter((time) => time !== slot)
      : sortSlots([...currentSlots, slot]);

    onChange({
      ...value,
      weekly: {
        ...value.weekly,
        [day]: nextDaySlots,
      },
    });
  };

  return (
    <div className="space-y-125">
      <div className="rounded-100 border-border-default border p-100 md:hidden">
        <div className="mb-100 flex flex-wrap gap-75">
          {WEEKDAY_KEYS.map((day) => {
            const isDaySelected = selectedDay === day;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  'font-designer-13m rounded-100 border px-100 py-75 transition-colors',
                  isDaySelected
                    ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
                    : 'border-border-default bg-background-default text-text-subtle',
                )}
              >
                {WEEKDAY_LABEL_MAP[day]}
              </button>
            );
          })}
        </div>

        <p className="font-designer-12r text-text-subtle mb-100">
          {WEEKDAY_LABEL_MAP[selectedDay]} 요일 가능한 시간을 선택해주세요.
        </p>

        <div className="grid grid-cols-3 gap-75">
          {TIME_SLOTS.map((slot) => {
            const isActive = value.weekly[selectedDay].includes(slot);

            return (
              <button
                key={`${selectedDay}-${slot}`}
                type="button"
                className={cn(
                  'font-designer-12m rounded-75 border px-75 py-100 transition-colors',
                  isActive
                    ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
                    : 'border-border-subtlest bg-background-default text-text-subtle',
                )}
                onClick={() => toggleSlot(selectedDay, slot)}
                aria-label={`${WEEKDAY_LABEL_MAP[selectedDay]} ${slot} ${
                  isActive ? '해제' : '선택'
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-100 border-border-default hidden overflow-auto border md:block">
        <table className="min-w-[760px] border-collapse">
          <thead className="bg-background-alternative sticky top-0 z-10">
            <tr>
              <th className="font-designer-13b text-text-subtle border-border-default border-r px-100 py-125 text-left">
                시간
              </th>
              {WEEKDAY_KEYS.map((day) => (
                <th
                  key={day}
                  className="font-designer-13b text-text-subtle border-border-default border-r px-125 py-125 text-center last:border-r-0"
                >
                  {WEEKDAY_LABEL_MAP[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot) => (
              <tr key={slot} className="border-border-default border-t">
                <td className="font-designer-12r text-text-subtle border-border-default border-r px-100 py-75">
                  {slot}
                </td>
                {WEEKDAY_KEYS.map((day) => {
                  const isActive = value.weekly[day].includes(slot);

                  return (
                    <td
                      key={`${day}-${slot}`}
                      className="border-border-default border-r p-50 last:border-r-0"
                    >
                      <button
                        type="button"
                        className={cn(
                          'rounded-75 h-300 w-full border transition-colors',
                          isActive
                            ? 'border-border-brand bg-fill-brand-subtle-default'
                            : 'border-border-subtlest bg-background-default hover:border-border-brand',
                        )}
                        onClick={() => toggleSlot(day, slot)}
                        aria-label={`${WEEKDAY_LABEL_MAP[day]} ${slot} ${
                          isActive ? '해제' : '선택'
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
