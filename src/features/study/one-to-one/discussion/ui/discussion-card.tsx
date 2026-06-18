import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MessageCircle, ThumbsUp, ThumbsDown, Eye, Clock } from 'lucide-react';
import dynamic from 'next/dynamic';
import React from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/common/ui/avatar';
import { TOPIC_LABELS } from '@/mocks/discussion-mock-data';
import { Discussion } from '@/types/one-to-one-study/discussion';

const UserProfileModal = dynamic(
  () => import('@/components/common/modals/user-profile-modal'),
);

interface DiscussionCardProps {
  discussion: Discussion;
  onClick?: () => void;
}

export default function DiscussionCard({
  discussion,
  onClick,
}: DiscussionCardProps) {
  const timeAgo = formatDistanceToNow(new Date(discussion.lastActivityAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div
      onClick={onClick}
      className={cn(
        'group rounded-200 bg-background-default ring-border-subtle cursor-pointer p-400 ring-1 ring-inset',
        'hover:ring-border-brand transition-shadow duration-150',
      )}
    >
      {/* 헤더: 작성자 정보 & 주제 */}
      <div className="mb-200 flex items-center justify-between">
        <div className="flex items-center gap-200">
          {/* 아바타 & 닉네임 */}
          <div onClick={(e) => e.stopPropagation()}>
            <UserProfileModal
              memberId={discussion.author.id}
              trigger={
                <div className="hover:ring-fill-brand-default-default flex cursor-pointer items-center gap-200 rounded-full px-200 py-100 ring-1 ring-transparent transition-shadow duration-100 ring-inset">
                  <div>
                    <UserAvatar
                      size={32}
                      image={discussion.author.avatar}
                      className="relative z-10"
                    />
                  </div>
                  <span className="font-designer-13b text-text-default">
                    {discussion.author.nickname}
                  </span>
                </div>
              }
            />
          </div>

          {/* 시간 */}
          <div className="flex items-center gap-100">
            <span className="bg-border-subtle h-[10px] w-[1px]" />
            <div className="font-designer-12r text-text-subtlest flex items-center gap-50">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </div>
          </div>
        </div>

        {/* 주제 배지 */}
        <div
          className={cn(
            'rounded-100 font-designer-12b px-200 py-50',
            discussion.topic === 'development' && 'bg-blue-50 text-blue-600',
            discussion.topic === 'study' && 'bg-green-50 text-green-600',
            discussion.topic === 'free' && 'bg-purple-50 text-purple-600',
            discussion.topic === 'question' && 'bg-orange-50 text-orange-600',
          )}
        >
          {TOPIC_LABELS[discussion.topic]}
        </div>
      </div>

      {/* 제목 */}
      <h3 className="font-designer-20b text-text-strong group-hover:text-text-brand mb-150 line-clamp-2 transition-colors">
        {discussion.title}
      </h3>

      {/* 요약 */}
      <p className="font-designer-14r text-text-subtle mb-300 line-clamp-2 leading-relaxed">
        {discussion.summary}
      </p>

      {/* 태그 */}
      {discussion.tags.length > 0 && (
        <div className="mb-300 flex flex-wrap gap-100">
          {discussion.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-100 bg-fill-neutral-subtle-default font-designer-12r text-text-subtle px-150 py-50"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 하단 메타 정보 */}
      <div className="border-border-subtlest flex items-center justify-between border-t pt-200">
        <div className="flex items-center gap-300">
          {/* 찬성 */}
          <div className="font-designer-13m flex items-center gap-50 text-green-600">
            <ThumbsUp className="h-4 w-4" />
            <span>{discussion.vote.agreeCount}</span>
          </div>

          {/* 반대 */}
          <div className="font-designer-13m flex items-center gap-50 text-red-500">
            <ThumbsDown className="h-4 w-4" />
            <span>{discussion.vote.disagreeCount}</span>
          </div>

          {/* 댓글 */}
          <div className="font-designer-13m text-text-brand flex items-center gap-50">
            <MessageCircle className="h-4 w-4" />
            <span>{discussion.commentCount}</span>
          </div>

          {/* 조회수 */}
          <div className="font-designer-13m text-text-subtle flex items-center gap-50">
            <Eye className="h-4 w-4" />
            <span>{discussion.viewCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
