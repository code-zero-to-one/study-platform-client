import React from 'react';
import { MessageCircle, ThumbsUp, ThumbsDown, Eye, Clock } from 'lucide-react';
import UserAvatar from '@/components/ui/avatar';
import UserProfileModal from '@/entities/user/ui/user-profile-modal';
import { Discussion } from '@/types/discussion';
import { TOPIC_LABELS } from '@/mocks/discussion-mock-data';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface DiscussionCardProps {
  discussion: Discussion;
  onClick?: () => void;
}

export default function DiscussionCard({ discussion, onClick }: DiscussionCardProps) {
  const timeAgo = formatDistanceToNow(new Date(discussion.lastActivityAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div
      onClick={onClick}
      className={cn(
        'group cursor-pointer rounded-200 border border-border-subtle bg-background-default p-400',
        'transition-all duration-200 hover:border-border-brand hover:shadow-2',
      )}
    >
      {/* 헤더: 작성자 정보 & 주제 */}
      <div className="mb-200 flex items-center justify-between">
        <div className="flex items-center gap-200">
          {/* 아바타 */}
          <div onClick={(e) => e.stopPropagation()}>
            <UserProfileModal
              memberId={discussion.author.id}
              trigger={<UserAvatar size={32} image={discussion.author.avatar} />}
            />
          </div>

          {/* 작성자 & 시간 */}
          <div className="flex items-center gap-100">
            <span className="font-designer-13b text-text-default">{discussion.author.nickname}</span>
            <span className="h-[10px] w-[1px] bg-border-subtle"></span>
            <div className="flex items-center gap-50 font-designer-12r text-text-subtlest">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </div>
          </div>
        </div>

        {/* 주제 배지 */}
        <div
          className={cn(
            'rounded-100 px-200 py-50 font-designer-12b',
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
      <h3 className="mb-150 line-clamp-2 font-bold-h5 text-text-strong transition-colors group-hover:text-text-brand">
        {discussion.title}
      </h3>

      {/* 요약 */}
      <p className="mb-300 line-clamp-2 font-designer-14r leading-relaxed text-text-subtle">
        {discussion.summary}
      </p>

      {/* 태그 */}
      {discussion.tags.length > 0 && (
        <div className="mb-300 flex flex-wrap gap-100">
          {discussion.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-100 bg-fill-neutral-subtle-default px-150 py-50 font-designer-12r text-text-subtle"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 하단 메타 정보 */}
      <div className="flex items-center justify-between border-t border-border-subtlest pt-200">
        <div className="flex items-center gap-300">
          {/* 찬성 */}
          <div className="flex items-center gap-50 font-designer-13m text-green-600">
            <ThumbsUp className="h-4 w-4" />
            <span>{discussion.vote.agreeCount}</span>
          </div>

          {/* 반대 */}
          <div className="flex items-center gap-50 font-designer-13m text-red-500">
            <ThumbsDown className="h-4 w-4" />
            <span>{discussion.vote.disagreeCount}</span>
          </div>

          {/* 댓글 */}
          <div className="flex items-center gap-50 font-designer-13m text-text-brand">
            <MessageCircle className="h-4 w-4" />
            <span>{discussion.commentCount}</span>
          </div>

          {/* 조회수 */}
          <div className="flex items-center gap-50 font-designer-13m text-text-subtle">
            <Eye className="h-4 w-4" />
            <span>{discussion.viewCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
