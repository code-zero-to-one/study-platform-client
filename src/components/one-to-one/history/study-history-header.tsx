'use client';

import { History, List, Calendar as CalendarIcon } from 'lucide-react';
import React from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import SectionHeader from '@/components/common/ui/section-header';

interface StudyHistoryHeaderProps {
  viewMode: 'LIST' | 'CALENDAR';
  onViewModeChange: (mode: 'LIST' | 'CALENDAR') => void;
  totalElements: number;
  calendarMonth: number;
  calendarCount: number;
}

export default function StudyHistoryHeader({
  viewMode,
  onViewModeChange,
  totalElements,
  calendarMonth,
  calendarCount,
}: StudyHistoryHeaderProps) {
  return (
    <SectionHeader
      title="나의 스터디 그룹 기록"
      icon={<History className="text-text-brand h-8 w-8" />}
      description={
        <>
          {viewMode === 'CALENDAR' ? (
            <>
              <span className="text-text-strong font-bold">
                {calendarMonth}월
              </span>
              에는{' '}
              <span className="text-text-strong font-bold">
                {calendarCount}
              </span>
              개의 스터디 기록이 있습니다.
              <span className="ml-150">
                연두색: 진행 상태 속성 -{' '}
                <span className="font-bold">참여 완료</span>, 황색: 진행 상태
                속성 - <span className="font-bold">진행 중</span>.
              </span>
            </>
          ) : (
            <>
              총{' '}
              <span className="text-text-strong font-bold">
                {totalElements}
              </span>
              개의 스터디 그룹 기록이 있습니다. 역할 수행 여부 판단 기준은
              지원자: 학습자료 제출, 면접자: 면접 후기 작성이며, 둘 다 진행되면
              진행 상태가 완료됩니다.
            </>
          )}
        </>
      }
      rightSlot={
        <div className="bg-background-default rounded-100 border-border-subtle flex shrink-0 border p-50">
          <button
            type="button"
            onClick={() => onViewModeChange('LIST')}
            className={cn(
              'rounded-75 flex items-center gap-50 p-100 transition-colors',
              viewMode === 'LIST'
                ? 'bg-fill-neutral-default-default text-text-strong shadow-sm'
                : 'text-text-subtlest hover:text-text-subtle',
            )}
            aria-label="리스트 보기"
            aria-pressed={viewMode === 'LIST'}
          >
            <List className="h-4 w-4" />
            <span className="font-designer-13m hidden sm:inline">리스트</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('CALENDAR')}
            className={cn(
              'rounded-75 flex items-center gap-50 p-100 transition-colors',
              viewMode === 'CALENDAR'
                ? 'bg-fill-neutral-default-default text-text-strong shadow-sm'
                : 'text-text-subtlest hover:text-text-subtle',
            )}
            aria-label="달력 보기"
            aria-pressed={viewMode === 'CALENDAR'}
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="font-designer-13m hidden sm:inline">달력</span>
          </button>
        </div>
      }
    />
  );
}
