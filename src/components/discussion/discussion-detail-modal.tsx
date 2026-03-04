import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  X,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Clock,
  MessageCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import UserProfileModal from '@/components/common/modals/user-profile-modal';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/common/ui/avatar';
import { TOPIC_LABELS } from '@/mocks/discussion-mock-data';
import { Discussion, VoteType } from '@/types/discussion';
import { CommentFormData } from '@/types/schemas/zod-schema';
import CommentForm from './comment-form';
import CommentList from './comment-list';

interface DiscussionDetailModalProps {
  discussion: Discussion;
  onClose: () => void;
  onVote?: (discussionId: number, voteType: VoteType) => void;
  onAddComment?: (discussionId: number, content: string) => void;
  onDeleteComment?: (discussionId: number, commentId: number) => void;
  onEditComment?: (
    discussionId: number,
    commentId: number,
    content: string,
  ) => void;
}

export default function DiscussionDetailModal({
  discussion,
  onClose,
  onVote,
  onAddComment,
  onDeleteComment,
  onEditComment,
}: DiscussionDetailModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(discussion.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  const handleVote = (voteType: VoteType) => {
    if (onVote) {
      onVote(discussion.id, voteType);
    }
  };

  const handleCommentSubmit = async (data: CommentFormData) => {
    setIsSubmitting(true);
    try {
      await onAddComment?.(discussion.id, data.content);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-400">
      <div className="rounded-200 bg-background-default shadow-4 flex max-h-[90vh] w-full max-w-[900px] flex-col">
        {/* 헤더 */}
        <div className="border-border-subtle flex shrink-0 items-start justify-between border-b p-500">
          <div className="flex-1">
            {/* 주제 배지 */}
            <div
              className={cn(
                'rounded-100 font-designer-12b mb-200 inline-block px-200 py-50',
                discussion.topic === 'development' &&
                  'bg-blue-50 text-blue-600',
                discussion.topic === 'study' && 'bg-green-50 text-green-600',
                discussion.topic === 'free' && 'bg-purple-50 text-purple-600',
                discussion.topic === 'question' &&
                  'bg-orange-50 text-orange-600',
              )}
            >
              {TOPIC_LABELS[discussion.topic]}
            </div>

            {/* 제목 */}
            <h2 className="font-bold-h4 text-text-strong mb-200">
              {discussion.title}
            </h2>

            {/* 메타 정보 */}
            <div className="flex items-center gap-300">
              {/* 작성자 */}
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
              <div className="font-designer-12r text-text-subtlest flex items-center gap-50">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </div>

              {/* 조회수 */}
              <div className="font-designer-12r text-text-subtlest flex items-center gap-50">
                <Eye className="h-3 w-3" />
                {discussion.viewCount.toLocaleString()}
              </div>
            </div>

            {/* 태그 */}
            {discussion.tags.length > 0 && (
              <div className="mt-200 flex flex-wrap gap-100">
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
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="rounded-100 text-text-subtle hover:bg-fill-neutral-subtle-hover hover:text-text-strong shrink-0 p-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 본문 + 투표 */}
        <div className="flex-1 overflow-y-auto px-500 py-400">
          {/* 본문 */}
          <div className="mb-500">
            <p className="font-designer-15r text-text-strong leading-relaxed whitespace-pre-wrap">
              {discussion.content}
            </p>
          </div>

          {/* 투표 섹션 */}
          <div className="rounded-200 border-border-subtle bg-background-alternative mb-600 border p-400">
            <p className="font-designer-14b text-text-strong mb-300">
              이 토론에 대한 의견은?
            </p>
            <div className="flex gap-200">
              {/* 찬성 버튼 */}
              <button
                onClick={() => handleVote('agree')}
                className={cn(
                  'rounded-100 flex flex-1 flex-col items-center gap-100 border-2 p-300 transition-all',
                  discussion.vote.myVote === 'agree'
                    ? 'border-green-500 bg-green-50'
                    : 'border-border-subtle bg-background-default hover:border-green-500 hover:bg-green-50',
                )}
              >
                <ThumbsUp
                  className={cn(
                    'h-6 w-6',
                    discussion.vote.myVote === 'agree'
                      ? 'fill-green-600 text-green-600'
                      : 'text-text-subtle',
                  )}
                />
                <div className="flex flex-col items-center">
                  <span className="font-designer-13b text-text-strong">
                    찬성
                  </span>
                  <span className="font-designer-18b text-green-600">
                    {discussion.vote.agreeCount}
                  </span>
                </div>
              </button>

              {/* 반대 버튼 */}
              <button
                onClick={() => handleVote('disagree')}
                className={cn(
                  'rounded-100 flex flex-1 flex-col items-center gap-100 border-2 p-300 transition-all',
                  discussion.vote.myVote === 'disagree'
                    ? 'border-red-500 bg-red-50'
                    : 'border-border-subtle bg-background-default hover:border-red-500 hover:bg-red-50',
                )}
              >
                <ThumbsDown
                  className={cn(
                    'h-6 w-6',
                    discussion.vote.myVote === 'disagree'
                      ? 'fill-red-600 text-red-600'
                      : 'text-text-subtle',
                  )}
                />
                <div className="flex flex-col items-center">
                  <span className="font-designer-13b text-text-strong">
                    반대
                  </span>
                  <span className="font-designer-18b text-red-600">
                    {discussion.vote.disagreeCount}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="border-border-subtle border-t pt-400">
            <div className="font-designer-15b text-text-strong mb-300 flex items-center gap-100">
              <MessageCircle className="h-5 w-5" />
              <span>댓글 {discussion.commentCount}</span>
            </div>

            {/* 댓글 목록 */}
            <div className="mb-400">
              <CommentList
                comments={discussion.comments}
                onDelete={(commentId) =>
                  onDeleteComment?.(discussion.id, commentId)
                }
                onEdit={(commentId, content) =>
                  onEditComment?.(discussion.id, commentId, content)
                }
              />
            </div>

            {/* 댓글 작성 폼 */}
            <div className="rounded-200 border-border-subtle bg-background-alternative border p-300">
              <CommentForm
                onSubmit={handleCommentSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
