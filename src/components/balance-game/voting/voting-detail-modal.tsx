import dynamic from 'next/dynamic';
import { X, TrendingUp, Info, MessageCircle } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/common/ui/avatar';
import CommentForm from '@/features/study/one-to-one/discussion/ui/comment-form';
import CommentList from '@/features/study/one-to-one/discussion/ui/comment-list';
import { Voting } from '@/types/one-to-one-study/voting';
import { CommentFormData } from '@/types/schemas/zod-schema';
import VoteResultsChart from './vote-results-chart';
import VoteTimer from './vote-timer';

const UserProfileModal = dynamic(
  () => import('@/components/common/modals/user-profile-modal'),
);

interface VotingDetailModalProps {
  voting: Voting;
  onClose: () => void;
  onVote?: (votingId: number, optionId: number) => void;
  onAddComment?: (votingId: number, content: string) => void;
  onDeleteComment?: (votingId: number, commentId: number) => void;
}

export default function VotingDetailModal({
  voting,
  onClose,
  onVote,
  onAddComment,
  onDeleteComment,
}: VotingDetailModalProps) {
  const [selectedOption, setSelectedOption] = useState<number | undefined>(
    voting.myVote,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const hasVoted = voting.myVote !== undefined;

  const handleVote = async () => {
    if (!selectedOption || !voting.isActive) return;

    setIsSubmitting(true);
    try {
      await onVote?.(voting.id, selectedOption);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async (data: CommentFormData) => {
    await onAddComment?.(voting.id, data.content);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-400">
      <div className="rounded-200 bg-background-default shadow-4 flex max-h-[90vh] w-full max-w-[900px] flex-col">
        {/* 헤더 */}
        <div className="border-border-subtle flex shrink-0 items-start justify-between border-b p-500">
          <div className="flex-1">
            {/* 라운드 & 상태 */}
            <div className="mb-200 flex items-center gap-200">
              <div className="rounded-100 bg-fill-brand-default-default flex items-center gap-100 px-250 py-100">
                <TrendingUp className="text-text-inverse h-4 w-4" />
                <span className="font-designer-13b text-text-inverse">
                  {voting.round} 라운드
                </span>
              </div>
              <VoteTimer endsAt={voting.endsAt} isActive={voting.isActive} />
            </div>

            {/* 제목 */}
            <h2 className="font-bold-h4 text-text-strong mb-200">
              {voting.title}
            </h2>

            {/* 작성자 정보 */}
            <div className="mb-200" onClick={(e) => e.stopPropagation()}>
              <UserProfileModal
                memberId={voting.author.id}
                trigger={
                  <div className="hover:ring-fill-brand-default-default flex cursor-pointer items-center gap-200 rounded-full px-200 py-100 ring-1 ring-transparent transition-shadow duration-100 ring-inset">
                    <div>
                      <UserAvatar
                        size={32}
                        image={voting.author.avatar}
                        className="relative z-10"
                      />
                    </div>
                    <span className="font-designer-13b text-text-default">
                      {voting.author.nickname}
                    </span>
                  </div>
                }
              />
            </div>

            {/* 설명 토글 */}
            {voting.description && (
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="rounded-100 border-border-subtle font-designer-12r text-text-subtle hover:border-border-brand hover:text-text-brand flex items-center gap-100 border px-200 py-100 transition-colors"
              >
                <Info className="h-3.5 w-3.5" />
                주제 설명 {showDescription ? '숨기기' : '보기'}
              </button>
            )}

            {showDescription && voting.description && (
              <p className="rounded-100 border-border-subtle bg-background-alternative font-designer-14r text-text-default mt-200 border p-300">
                {voting.description}
              </p>
            )}

            {/* 태그 */}
            {voting.tags &&
              Array.isArray(voting.tags) &&
              voting.tags.length > 0 && (
                <div className="mt-200 flex flex-wrap gap-100">
                  {voting.tags.map((tag, index) => (
                    <span
                      key={tag || index}
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

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-500 py-400">
          {/* 투표 섹션 */}
          {!hasVoted && voting.isActive ? (
            <div className="mb-600">
              <h3 className="font-designer-16b text-text-strong mb-300">
                투표해주세요
              </h3>
              <div className="mb-300 flex flex-col gap-200">
                {voting.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    disabled={isSubmitting}
                    className={cn(
                      'rounded-200 font-designer-15b border-2 p-400 text-left transition-all',
                      selectedOption === option.id
                        ? 'border-fill-brand-default-default bg-fill-brand-subtle-default text-text-brand'
                        : 'border-border-subtle bg-background-default text-text-default hover:border-border-brand',
                      isSubmitting && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleVote}
                disabled={!selectedOption || isSubmitting}
                className={cn(
                  'rounded-100 bg-fill-brand-default-default font-designer-15b text-text-inverse w-full py-300 transition-colors',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'hover:bg-fill-brand-default-hover',
                )}
              >
                {isSubmitting ? '투표 중...' : '투표하기'}
              </button>
            </div>
          ) : (
            <div className="mb-600">
              <h3 className="font-designer-16b text-text-strong mb-300">
                투표 결과
              </h3>
              <VoteResultsChart
                options={voting.options}
                myVote={voting.myVote}
                totalVotes={voting.totalVotes}
              />
            </div>
          )}

          {/* 댓글 섹션 */}
          <div className="border-border-subtle border-t pt-400">
            <div className="font-designer-15b text-text-strong mb-300 flex items-center gap-100">
              <MessageCircle className="h-5 w-5" />
              <span>댓글 {voting.commentCount}</span>
            </div>

            {/* 투표 안 했으면 댓글 작성 불가 안내 */}
            {!hasVoted && voting.isActive ? (
              <div className="rounded-200 border-border-subtle bg-background-alternative mb-400 border p-400 text-center">
                <p className="font-designer-14m text-text-subtle">
                  투표 후 댓글을 작성할 수 있습니다
                </p>
              </div>
            ) : (
              <>
                {/* 댓글 목록 */}
                <div className="mb-400">
                  <CommentList
                    comments={voting.comments}
                    onDelete={(commentId) =>
                      onDeleteComment?.(voting.id, commentId)
                    }
                  />
                </div>

                {/* 댓글 작성 폼 */}
                {voting.isActive && (
                  <div className="rounded-200 border-border-subtle bg-background-alternative border p-300">
                    <CommentForm onSubmit={handleCommentSubmit} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
