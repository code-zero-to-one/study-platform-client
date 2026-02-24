'use client';

import { useMemo, useState } from 'react';
import Button from '@/components/ui/button';
import FieldErrorText from '@/components/ui/form/field-error-text';
import { BaseInput } from '@/components/ui/input';
import { type MentorHoliday } from '@/types/mentoring/settings';

interface HolidayEditorProps {
  holidays: MentorHoliday[];
  onChange: (next: MentorHoliday[]) => void;
}

const hasHolidayOverlap = (
  target: MentorHoliday,
  holidays: MentorHoliday[],
) => {
  return holidays.some((holiday) => {
    if (holiday.id === target.id) {
      return false;
    }

    return (
      holiday.startDate <= target.endDate && target.startDate <= holiday.endDate
    );
  });
};

const formatHolidayLabel = (holiday: MentorHoliday) => {
  return `${holiday.startDate} ~ ${holiday.endDate}`;
};

export default function HolidayEditor({
  holidays,
  onChange,
}: HolidayEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [memo, setMemo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const sortedHolidays = useMemo(() => {
    return [...holidays].sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [holidays]);

  const resetForm = () => {
    setStartDate('');
    setEndDate('');
    setMemo('');
    setErrorMessage('');
  };

  const handleCancel = () => {
    resetForm();
    setIsAdding(false);
  };

  const handleRegister = () => {
    if (!startDate || !endDate || !memo.trim()) {
      setErrorMessage('시작일, 종료일, 휴가 메모를 모두 입력해주세요.');

      return;
    }

    if (startDate > endDate) {
      setErrorMessage('휴가 종료일은 시작일보다 빠를 수 없습니다.');

      return;
    }

    if (memo.trim().length > 100) {
      setErrorMessage('휴가 메모는 100자 이하로 입력해주세요.');

      return;
    }

    const nextHoliday: MentorHoliday = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      startDate,
      endDate,
      memo: memo.trim(),
    };

    if (hasHolidayOverlap(nextHoliday, holidays)) {
      setErrorMessage('이미 등록된 휴가 일정과 기간이 겹칩니다.');

      return;
    }

    onChange([...holidays, nextHoliday]);
    handleCancel();
  };

  return (
    <section className="rounded-150 border-border-default bg-background-default border p-200">
      <div className="mb-150 flex flex-col gap-100 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-designer-18b text-text-default">
            멘토링 휴가 등록
          </h3>
          <p className="font-designer-13r text-text-subtle mt-25">
            반복 설정한 스케줄 중 멘토링이 불가능한 기간을 등록해주세요.
          </p>
        </div>
        {!isAdding && (
          <Button
            type="button"
            color="outlined"
            size="small"
            className="w-full whitespace-nowrap sm:w-auto"
            onClick={() => setIsAdding(true)}
          >
            + 새 휴가 등록하기
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="rounded-100 bg-background-alternative border-border-default mb-150 border p-150">
          <div className="mb-100 grid grid-cols-1 gap-100 md:grid-cols-2">
            <BaseInput
              type="date"
              value={startDate}
              onValueChange={setStartDate}
              placeholder="시작일"
            />
            <BaseInput
              type="date"
              value={endDate}
              onValueChange={setEndDate}
              placeholder="종료일"
            />
          </div>
          <BaseInput
            value={memo}
            onValueChange={setMemo}
            placeholder="휴가 메모"
            maxLength={100}
          />

          <FieldErrorText message={errorMessage} />

          <div className="mt-125 flex flex-col-reverse gap-100 sm:flex-row sm:justify-end">
            <Button
              type="button"
              color="secondary"
              size="small"
              className="w-full sm:w-auto"
              onClick={handleCancel}
            >
              취소
            </Button>
            <Button
              type="button"
              color="primary"
              size="small"
              className="w-full sm:w-auto"
              onClick={handleRegister}
            >
              등록
            </Button>
          </div>
        </div>
      )}

      {sortedHolidays.length === 0 ? (
        <div className="font-designer-14r text-text-subtlest rounded-100 bg-background-alternative px-150 py-250 text-center">
          사용 중인 휴가가 없어요.
        </div>
      ) : (
        <div className="flex flex-col gap-100">
          {sortedHolidays.map((holiday) => (
            <article
              key={holiday.id}
              className="rounded-100 border-border-default bg-background-alternative flex flex-col gap-100 border px-150 py-125 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-designer-14b text-text-default">
                  {formatHolidayLabel(holiday)}
                </p>
                <p className="font-designer-13r text-text-subtle break-words">
                  {holiday.memo}
                </p>
              </div>
              <Button
                type="button"
                color="outlined"
                size="xsmall"
                className="w-full sm:w-auto"
                onClick={() =>
                  onChange(holidays.filter((item) => item.id !== holiday.id))
                }
              >
                삭제
              </Button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
