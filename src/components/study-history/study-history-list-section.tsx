'use client';

import { History } from 'lucide-react';
import React from 'react';
import { StudyHistoryRow } from '@/features/study/one-to-one/history/ui/study-history-row';
import type { StudyHistoryItem } from '@/types/one-to-one-study/study-history';

interface StudyHistoryListSectionProps {
  items: StudyHistoryItem[];
}

export default function StudyHistoryListSection({
  items,
}: StudyHistoryListSectionProps) {
  return (
    <div className="bg-background-default rounded-200 border-border-subtle shadow-1 overflow-hidden border">
      <div className="bg-background-alternative/80 border-border-subtlest font-designer-13b text-text-subtle flex gap-400 border-b px-400 py-250 tracking-wider uppercase">
        <div className="w-[150px] shrink-0">날짜</div>
        <div className="min-w-0 flex-1">오늘의 주제</div>
        <div className="w-[150px] shrink-0">상대방</div>
        <div className="w-[120px] shrink-0 text-center">내 역할</div>
        <div className="w-[100px] shrink-0 text-center">역할수행여부</div>
        <div className="w-[100px] shrink-0 text-center">진행상태</div>
        <div className="w-[80px] shrink-0 text-center">링크</div>
      </div>

      <div className="divide-border-subtlest divide-y">
        {items.length > 0 ? (
          items.map((item) => <StudyHistoryRow key={item.id} item={item} />)
        ) : (
          <div className="text-text-subtlest flex flex-col items-center gap-200 py-800 text-center">
            <History className="h-10 w-10 opacity-20" />
            <p className="font-designer-16m">
              아직 1:1 스터디 기록이 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
