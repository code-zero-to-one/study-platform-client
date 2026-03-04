'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { BaseInput } from '@/components/common/ui/input';
import type { VotingCreateFormData } from '@/types/schemas/zod-schema';

export default function VotingDeadlineField() {
  const { watch, setValue } = useFormContext<VotingCreateFormData>();
  const watchedEndsAt = watch('endsAt') || '';

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      setValue('endsAt', `${selectedDate}T23:59`);
    } else {
      setValue('endsAt', '');
    }
  };

  const selectedDateOnly = watchedEndsAt ? watchedEndsAt.split('T')[0] : '';

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  return (
    <div className="flex flex-col gap-200">
      <div className="font-designer-14b text-text-strong">
        투표 마감 시간 (선택)
      </div>
      <BaseInput
        type="date"
        value={selectedDateOnly}
        onChange={handleDateChange}
        min={getTodayDateString()}
      />
      {selectedDateOnly ? (
        <p className="font-designer-12r text-text-subtle">
          선택한 날짜의 23시 59분에 마감됩니다
        </p>
      ) : (
        <p className="font-designer-12r text-text-subtlest">
          미입력 시 7일 후 자동 마감됩니다
        </p>
      )}
    </div>
  );
}
