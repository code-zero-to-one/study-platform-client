'use client';

import React from 'react';
import { StudyCalendar } from '@/features/study/one-to-one/history/ui/study-calendar';
import type { StudyHistoryItem } from '@/types/one-to-one-study/study-history';

interface StudyHistoryCalendarSectionProps {
  items: StudyHistoryItem[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export default function StudyHistoryCalendarSection({
  items,
  currentDate,
  onDateChange,
}: StudyHistoryCalendarSectionProps) {
  return (
    <div className="flex flex-col gap-200">
      <StudyCalendar
        items={items}
        currentDate={currentDate}
        onDateChange={onDateChange}
      />
    </div>
  );
}
