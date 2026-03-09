'use client';

import dynamic from 'next/dynamic';
import {
  Calendar,
  Mic,
  User,
  CheckCircle,
  Clock,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import UserAvatar from '@/components/common/ui/avatar';
import { StudyHistoryItem } from '@/types/one-to-one-study/study-history';

const UserProfileModal = dynamic(
  () => import('@/components/common/modals/user-profile-modal'),
  { ssr: false },
);

export const StudyHistoryRow = ({ item }: { item: StudyHistoryItem }) => {
  const partner = item.partner;

  return (
    <div className="border-border-subtlest text-designer-14m flex items-center gap-400 border-b px-400 py-300 transition-colors last:border-0">
      {/* 날짜 */}
      <div className="text-text-subtle flex w-[150px] shrink-0 items-center gap-50 font-medium">
        <Calendar className="text-text-subtlest h-4 w-4" />
        {item.date}
      </div>

      {/* 주제 */}
      <div
        className="text-text-strong min-w-0 flex-1 truncate pr-200 font-bold"
        title={item.subject}
      >
        {item.subject}
      </div>

      {/* 상대방 */}
      <div className="flex w-[150px] shrink-0 items-center gap-100">
        {partner ? (
          <UserProfileModal
            memberId={partner.id}
            trigger={
              <div
                className="flex cursor-pointer items-center gap-100 transition-opacity hover:opacity-80"
                onClick={(e) => e.stopPropagation()} // 행 클릭 이벤트(링크 이동) 방지
              >
                <UserAvatar
                  image={partner.profileImage || undefined}
                  alt={partner.name}
                  size={32}
                  className="h-8 w-8"
                />
                <span className="text-text-default truncate font-medium">
                  {partner.name}
                </span>
              </div>
            }
          />
        ) : (
          <div className="text-text-subtlest flex items-center gap-100">
            <UserAvatar
              image={undefined}
              alt="상대방 정보 없음"
              size={32}
              className="h-8 w-8 opacity-60"
            />
            <span className="truncate font-medium">상대방 정보 없음</span>
          </div>
        )}
      </div>

      {/* 역할 */}
      <div className="flex w-[120px] shrink-0 items-center justify-center gap-50">
        {item.role === 'INTERVIEWER' ? (
          <span className="rounded-50 bg-fill-brand-subtle-default text-text-brand inline-flex items-center gap-50 px-150 py-25 text-[12px] font-medium">
            <Mic className="h-3 w-3" />
            면접자
          </span>
        ) : (
          <span className="rounded-50 bg-fill-information-subtle-default text-text-information inline-flex items-center gap-50 px-150 py-25 text-[12px] font-medium">
            <User className="h-3 w-3" />
            지원자
          </span>
        )}
      </div>

      {/* 역할수행여부 */}
      <div className="flex w-[100px] shrink-0 justify-center">
        {item.attendance === 'ATTENDED' ? (
          <span className="text-text-success flex flex-col items-center gap-25">
            <CheckCircle className="h-4 w-4" />
            <span className="text-[10px] font-bold">역할수행</span>
          </span>
        ) : (
          <span className="text-text-warning flex flex-col items-center gap-25">
            <Clock className="h-4 w-4" />
            <span className="text-[10px] font-bold">미진행</span>
          </span>
        )}
      </div>

      {/* 진행상태 */}
      <div className="flex w-[100px] shrink-0 justify-center">
        {item.status === 'COMPLETED' ? (
          <span className="text-text-success flex flex-col items-center gap-25">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-[10px] font-bold">완료</span>
          </span>
        ) : (
          <span className="text-text-warning flex flex-col items-center gap-25">
            <Clock className="h-4 w-4" />
            <span className="text-[10px] font-bold">진행중</span>
          </span>
        )}
      </div>

      {/* 링크 */}
      <div className="flex w-[80px] shrink-0 justify-center">
        {item.link ? (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-subtle hover:text-text-strong group flex items-center justify-center p-100 transition-all"
            title="참고 자료 링크"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-5 w-5 transition-transform group-hover:scale-125" />
          </a>
        ) : (
          <div className="text-text-subtlest flex cursor-not-allowed items-center justify-center p-100">
            <ExternalLink className="h-5 w-5 opacity-20" />
          </div>
        )}
      </div>
    </div>
  );
};
