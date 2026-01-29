'use client';

import { Calendar, Mic, User, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { StudyHistoryItem } from '@/types/study-history';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { ProfileAvatar } from '@/components/ui/profile-avatar';
import UserProfileModal from '@/entities/user/ui/user-profile-modal';

export const StudyHistoryRow = ({ item }: { item: StudyHistoryItem }) => {
  return (
    <div 
      className="flex gap-400 px-400 py-300 border-b border-border-subtlest transition-colors items-center last:border-0 text-designer-14m"
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

      {/* 상대방 */}
      <div className="w-[150px] shrink-0 flex items-center gap-100">
        <UserProfileModal
          memberId={item.partner.id}
          trigger={
            <div 
              className="flex items-center gap-100 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()} // 행 클릭 이벤트(링크 이동) 방지
            >
              <ProfileAvatar 
                src={item.partner.profileImage || undefined}
                alt={item.partner.name}
                size="sm"
                className="w-8 h-8"
              />
              <span className="text-text-default font-medium truncate">{item.partner.name}</span>
            </div>
          }
        />
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

      {/* 링크 */}
      <div className="w-[80px] shrink-0 flex justify-center">
        {item.link ? (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-100 text-text-subtle hover:text-text-strong transition-all group"
            title="참고 자료 링크"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-5 w-5 transition-transform group-hover:scale-125" />
          </a>
        ) : (
          <div className="flex items-center justify-center p-100 text-text-subtlest cursor-not-allowed">
            <ExternalLink className="h-5 w-5 opacity-20" />
          </div>
        )}
      </div>
    </div>
  );
};
