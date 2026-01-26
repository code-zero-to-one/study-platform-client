'use client';

import { Calendar, Mic, User, CheckCircle, Clock } from 'lucide-react';
import { StudyHistoryItem } from '@/types/study-history';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

export const StudyHistoryRow = ({ item }: { item: StudyHistoryItem }) => {
  return (
    <div 
      onClick={() => item.link && window.open(item.link, '_blank')}
      className={cn(
        "flex gap-400 px-400 py-300 border-b border-border-subtlest transition-colors items-center last:border-0 text-designer-14m",
        item.link ? "cursor-pointer hover:bg-fill-neutral-subtle-hover" : ""
      )}
    >
      {/* 날짜 */}
      <div className="w-[150px] shrink-0 text-text-subtle font-medium flex items-center gap-50">
        <Calendar className="w-4 h-4 text-text-subtlest" />
        {item.date}
      </div>

      {/* 주제 */}
      <div className="flex-1 min-w-0 text-text-strong font-bold truncate pr-200" title={item.subject}>
        {item.subject}
      </div>

      {/* 역할 */}
      <div className="w-[120px] shrink-0 flex items-center justify-center gap-50">
        {item.role === 'INTERVIEWER' ? (
          <span className="inline-flex items-center gap-50 px-150 py-25 rounded-50 bg-fill-brand-subtle-default text-text-brand font-medium text-[12px]">
            <Mic className="w-3 h-3" />
            면접자
          </span>
        ) : (
          <span className="inline-flex items-center gap-50 px-150 py-25 rounded-50 bg-fill-information-subtle-default text-text-information font-medium text-[12px]">
            <User className="w-3 h-3" />
            답변자
          </span>
        )}
      </div>

      {/* 출석 */}
      <div className="w-[100px] shrink-0 flex justify-center">
        {item.attendance === 'ATTENDED' ? (
          <span className="text-text-success flex flex-col items-center gap-25">
            <CheckCircle className="w-4 h-4" />
            <span className="text-[10px] font-bold">출석</span>
          </span>
        ) : (
          <span className="text-text-warning flex flex-col items-center gap-25">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-bold">미진행</span>
          </span>
        )}
      </div>
    </div>
  );
};
