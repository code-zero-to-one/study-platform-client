'use client';

import React from 'react';

interface StudyHistorySummaryProps {
  totalElements: number;
}

export default function StudyHistorySummary({
  totalElements,
}: StudyHistorySummaryProps) {
  return (
    <div className="font-designer-16m text-text-subtle whitespace-nowrap">
      총 <span className="text-text-strong font-bold">{totalElements}</span>개의
      1:1 스터디 기록이 있습니다.
    </div>
  );
}
