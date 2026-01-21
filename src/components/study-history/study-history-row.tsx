'use client';

import { Calendar, Mic, User, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { StudyHistoryItem } from '@/types/study-history';

export const StudyHistoryRow = ({ item }: { item: StudyHistoryItem }) => {
  return (
    <div className="grid grid-cols-12 gap-200 px-400 py-300 border-b border-border-subtlest hover:bg-fill-neutral-subtle-hover transition-colors items-center last:border-0 text-designer-14m">
      {/* 날짜 */}
      <div className="col-span-2 text-text-subtle font-medium flex items-center gap-50">
        <Calendar className="w-4 h-4 text-text-subtlest" />
        {item.date}
      </div>

      {/* 주제 */}
      <div className="col-span-4 text-text-strong font-bold truncate pr-200" title={item.subject}>
        {item.subject}
      </div>

      {/* 역할 */}
      <div className="col-span-2 flex items-center gap-50">
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
      <div className="col-span-1 flex justify-center">
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

      {/* 링크 */}
      <div className="col-span-1 flex justify-center">
        {item.link ? (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-subtle hover:text-text-brand transition-colors p-100 rounded-full hover:bg-fill-neutral-default-default"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        ) : (
          <span className="text-text-disabled">-</span>
        )}
      </div>

      {/* 상태 */}
      <div className="col-span-2 text-right">
        {item.status === 'COMPLETED' ? (
          <span className="text-text-subtle font-medium">완료됨</span>
        ) : (
          <span className="text-text-brand font-bold animate-pulse">진행중</span>
        )}
      </div>
    </div>
  );
};


