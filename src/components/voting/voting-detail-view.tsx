'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, TrendingUp, MessageCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  useBalanceGameDetailQuery,
  useBalanceGameCommentsQuery,
} from '@/features/balance-game/model/use-balance-game-query';
import {
  useVoteBalanceGameMutation,
  useCancelVoteBalanceGameMutation,
  useCreateBalanceGameCommentMutation,
  useDeleteBalanceGameCommentMutation,
  useUpdateBalanceGameCommentMutation,
  useUpdateBalanceGameMutation,
} from '@/features/balance-game/model/use-balance-game-mutation';
import UserAvatar from '@/components/ui/avatar';
import UserProfileModal from '@/entities/user/ui/user-profile-modal';
import VoteResultsChart from '@/components/voting/vote-results-chart';
import VoteTimer from '@/components/voting/vote-timer';
import DailyStatsChart from '@/components/voting/daily-stats-chart';
import CommentList from '@/components/discussion/comment-list';
import CommentForm from '@/components/discussion/comment-form';
import { CommentFormData, VotingCreateFormData } from '@/types/schemas/zod-schema';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { BalanceGameComment } from '@/features/balance-game/types';
import { VotingOption } from '@/types/voting';
import VotingEditModal from './voting-edit-modal';
import { useUserStore } from '@/stores/useUserStore';

interface VotingDetailViewProps {
  votingId: number;
  onBack: () => void;
}

export default function VotingDetailView({
  votingId,
  onBack,
}: VotingDetailViewProps) {
  const [selectedOption, setSelectedOption] = useState<number | undefined>();
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // User Info
  const memberId = useUserStore((state) => state.memberId);

  // Queries
  const { data: voting, isLoading, error } = useBalanceGameDetailQuery(votingId);
  
  // 투표 여부 확인 (투표를 한 경우에만 댓글 목록 가져오기)
  const hasVoted = voting?.myVote !== undefined && voting?.myVote !== null;
  
  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useBalanceGameCommentsQuery(votingId, { enabled: !!hasVoted });

  // Mutations
  const voteMutation = useVoteBalanceGameMutation(votingId);
  const cancelVoteMutation = useCancelVoteBalanceGameMutation(votingId);
  const createCommentMutation = useCreateBalanceGameCommentMutation(votingId);
  const updateCommentMutation = useUpdateBalanceGameCommentMutation(votingId);
  const deleteCommentMutation = useDeleteBalanceGameCommentMutation(votingId);
  const updateGameMutation = useUpdateBalanceGameMutation(votingId);

  // Set selected option when voting loads
  useEffect(() => {
    if (voting?.myVote) {
      setSelectedOption(voting.myVote);
    }
  }, [voting?.myVote]);

  const comments = React.useMemo(() => {
    const allComments = commentsData?.pages.flatMap((page) => page.content) || [];
    // 중복 제거 (key prop warning 방지)
    const seen = new Set();
    return allComments.filter(comment => {
        if (seen.has(comment.id)) return false;
        seen.add(comment.id);
        return true;
    });
  }, [commentsData]);

  // isActive는 백엔드가 내려줄 수도 있고(권장), 없으면 endsAt 기준으로 프론트에서 계산
  // VoteTimer도 endsAt으로 "종료"를 판단하므로, 두 로직이 어긋나지 않게 맞춘다.
  const isActiveByEndsAt = React.useMemo(() => {
    if (!voting?.endsAt) return true;
    return new Date(voting.endsAt).getTime() > Date.now();
  }, [voting?.endsAt]);

  const isActive = voting?.isActive ?? isActiveByEndsAt;

  const handleVote = async () => {
    if (!selectedOption || !isActive) return;
    try {
      await voteMutation.mutateAsync(selectedOption);
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const handleRevote = async () => {
     try {
         if (voting?.myVote) {
             await cancelVoteMutation.mutateAsync();
             setSelectedOption(undefined);
         }
     } catch (error) {
         console.error('Cancel vote failed:', error);
     }
  };

  const handleAddComment = async (data: CommentFormData) => {
    if (!voting) return;
    try {
      await createCommentMutation.mutateAsync(data.content);
    } catch (error) {
      console.error('Add comment failed:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteCommentMutation.mutateAsync(commentId);
    } catch (error) {
      console.error('Delete comment failed:', error);
    }
  };

  const handleStartEditComment = (commentId: number, content: string) => {
    setEditingCommentId(commentId);
    setEditingCommentContent(content);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const handleUpdateComment = async (data: CommentFormData) => {
    if (!editingCommentId) return;
    try {
      await updateCommentMutation.mutateAsync({
        commentId: editingCommentId,
        content: data.content,
      });
      handleCancelEditComment();
    } catch (error) {
      console.error('Update comment failed:', error);
    }
  };

  const handleUpdateGame = async (data: Partial<VotingCreateFormData>) => {
      try {
          await updateGameMutation.mutateAsync({
              title: data.title,
              description: data.description,
              tags: data.tags
          });
      } catch (error) {
          console.error('Update game failed:', error);
      }
  };
  
  // Check if current user is author
  const isAuthor = voting?.author.id === memberId;

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-400">
          <Loader2 className="h-8 w-8 animate-spin text-text-brand" />
          <p className="font-designer-16m text-text-subtle">투표를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !voting) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-400">
          <p className="font-designer-16m text-text-subtle">
            데이터를 불러오는데 실패했습니다.
          </p>
          <button
            onClick={onBack}
            className="rounded-100 bg-fill-brand-default-default px-400 py-200 font-designer-14b text-text-inverse transition-colors hover:bg-fill-brand-default-hover"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // Adapt BalanceGame options to VotingOption for compatibility
  const votingOptions: VotingOption[] = voting.options.map(opt => ({
      ...opt,
  }));
  
  // 디버깅용 로그 추가
  console.log('Voting Data:', {
    myVote: voting.myVote,
    hasVoted,
    endsAt: voting.endsAt,
    rawIsActive: voting.isActive,
    isActiveByEndsAt,
    isActive,
  });

  const showVoteOptions = !hasVoted && isActive;

  return (
    <div className="transition-all duration-300">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={onBack}
        className="mb-400 flex items-center gap-100 font-designer-14m text-text-subtle transition-colors hover:text-text-strong"
      >
        <ArrowLeft className="h-4 w-4" />
        돌아가기
      </button>

      {/* 헤더 */}
      <div className="mb-500 rounded-200 border border-border-subtle bg-background-default p-500 shadow-1">
        {/* 작성자 & 상태 */}
        <div className="mb-300 flex items-center justify-between gap-300">
          {/* 작성자 정보 */}
          <div onClick={(e) => e.stopPropagation()}>
            <UserProfileModal
              memberId={voting.author.id}
              trigger={
                <div className="flex items-center gap-200 cursor-pointer rounded-full px-200 py-100 transition-shadow duration-100 ring-1 ring-inset ring-transparent hover:ring-fill-brand-default-default">
                  <div>
                    <UserAvatar 
                      size={32} 
                      image={voting.author.profileImage || undefined}
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

          {/* 우측 컨트롤: 타이머 + 작성자 메뉴 (겹침 방지) */}
          <div className="flex items-center gap-150">
            <VoteTimer endsAt={voting.endsAt} isActive={isActive} />

            {isAuthor && (
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="rounded-100 p-100 text-text-subtle hover:bg-fill-neutral-subtle-default transition-colors"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-100 w-[120px] rounded-100 border border-border-subtle bg-background-default py-100 shadow-3">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsEditModalOpen(true);
                        }}
                        className="flex w-full items-center gap-200 px-300 py-200 font-designer-13r text-text-default hover:bg-fill-neutral-subtle-default"
                      >
                        <Edit className="h-4 w-4" />
                        수정
                      </button>
                      {/* 삭제 기능은 API 명세에 없었으므로 일단 생략하거나 추후 추가 */}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 제목 */}
        <h1 className="mb-200 font-bold-h3 text-text-strong">{voting.title}</h1>

        {/* 설명 */}
        {voting.description && (
          <p className="mb-200 rounded-100 border border-border-subtle bg-background-alternative p-300 font-designer-14r text-text-default">
            {voting.description}
          </p>
        )}

        {/* 태그 */}
        {voting.tags && voting.tags.length > 0 && (
          <div className="flex flex-wrap gap-100">
            {voting.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-100 bg-fill-neutral-subtle-default px-150 py-50 font-designer-12r text-text-subtle"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 투표 섹션 */}
      <div className="mb-500 rounded-200 border border-border-subtle bg-background-default p-500 shadow-1">
        {showVoteOptions ? (
          <>
            {/* 헤더 */}
            <div className="mb-400 flex items-center justify-between">
              <h2 className="font-designer-18b text-text-strong">투표해주세요</h2>
              
              {/* 현재 투표 참여 인원 */}
              <div className="flex items-center gap-200 rounded-100 border border-border-subtle bg-background-alternative px-300 py-150">
                <div 
                  className="flex items-center justify-center rounded-full bg-fill-brand-default-default"
                  style={{ width: '32px', height: '32px' }}
                >
                  <TrendingUp 
                    className="text-text-inverse" 
                    style={{ width: '20px', height: '20px' }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-designer-11r text-text-subtle">현재 참여</span>
                  <span className="font-designer-14b text-text-strong">
                    {voting.totalVotes.toLocaleString()}명
                  </span>
                </div>
              </div>
            </div>

            {/* 선택지 */}
            <div className="mb-400 flex flex-col gap-300">
              {voting.options.map((option, index) => {
                const isSelected = selectedOption === option.id;
                const colors = [
                  { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-500', primary: 'bg-blue-500' },
                  { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-600', ring: 'ring-green-500', primary: 'bg-green-500' },
                  { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-500', primary: 'bg-purple-500' },
                  { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-600', ring: 'ring-orange-500', primary: 'bg-orange-500' },
                  { border: 'border-pink-500', bg: 'bg-pink-50', text: 'text-pink-600', ring: 'ring-pink-500', primary: 'bg-pink-500' },
                ];
                const color = colors[index % colors.length];

                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    disabled={voteMutation.isPending}
                    className={cn(
                      'group relative rounded-200 border-2 p-300 text-left transition-all duration-200',
                      isSelected
                        ? cn('shadow-lg', color.border, color.bg)
                        : 'border-border-subtle bg-background-default hover:border-border-brand hover:shadow-1',
                      voteMutation.isPending && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <div className="flex items-center gap-200">
                      {/* 번호 배지 */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fill-neutral-subtle-default font-bold text-text-subtle">
                        {index + 1}
                      </div>
                      
                      <span
                        className={cn(
                          'font-designer-15b transition-colors',
                          isSelected ? color.text : 'text-text-default',
                        )}
                      >
                        {option.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 투표하기 버튼 */}
            <button
              onClick={handleVote}
              disabled={!selectedOption || voteMutation.isPending}
              className={cn(
                'w-full rounded-100 py-300 font-designer-15b text-text-inverse shadow-lg transition-all duration-200',
                'bg-gradient-to-r from-fill-brand-default-default to-fill-brand-default-hover',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
                'hover:scale-[1.02] hover:shadow-xl',
              )}
            >
              {voteMutation.isPending ? (
                <div className="flex items-center justify-center gap-200">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  투표 중...
                </div>
              ) : (
                '투표하기'
              )}
            </button>
          </>
        ) : (
          <>
            <div className="mb-400 flex items-center justify-between">
              <h2 className="font-designer-18b text-text-strong">투표 결과</h2>
              {isActive && hasVoted && (
                <button
                  onClick={handleRevote}
                  disabled={cancelVoteMutation.isPending}
                  className="font-designer-12r text-text-subtle underline hover:text-text-default disabled:opacity-50"
                >
                  {cancelVoteMutation.isPending ? '취소 중...' : '투표 취소하고 다시하기'}
                </button>
              )}
            </div>
            <VoteResultsChart
              options={votingOptions}
              myVote={voting.myVote || undefined}
              totalVotes={voting.totalVotes}
            />
          </>
        )}
      </div>

      {/* 일별 통계 (투표 후에만 표시) */}
      {hasVoted && voting.dailyStats && voting.dailyStats.length > 0 && (
        <div className="mb-500">
          <DailyStatsChart
            dailyStats={voting.dailyStats}
            options={votingOptions}
            myVote={voting.myVote || undefined}
          />
        </div>
      )}

      {/* 댓글 섹션 */}
      <div className="rounded-200 border border-border-subtle bg-background-default p-500 shadow-1">
        <div className="mb-400 flex items-center gap-100 font-designer-16b text-text-strong">
          <MessageCircle className="h-5 w-5" />
          <span>댓글 {voting.commentCount || 0}</span>
        </div>

        {/* 댓글 목록 (항상 표시) */}
        <div className="mb-400">
          <CommentList 
            comments={comments} 
            onDelete={handleDeleteComment}
            onEdit={handleStartEditComment}
            votingOptions={votingOptions}
            editingCommentId={editingCommentId}
            editingCommentContent={editingCommentContent}
            onUpdateComment={handleUpdateComment}
            onCancelEdit={handleCancelEditComment}
          />
          
          {hasNextPage && (
              <button 
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="mt-300 w-full rounded-100 border border-border-subtle py-200 font-designer-13r text-text-subtle hover:bg-background-alternative"
              >
                  {isFetchingNextPage ? '불러오는 중...' : '더 보기'}
              </button>
          )}
        </div>

        {/* 댓글 작성 폼 */}
        {isActive && (
          <>
            {!hasVoted ? (
              <div className="rounded-200 border border-border-subtle bg-background-alternative p-400 text-center">
                <p className="font-designer-14m text-text-subtle">
                  투표 후 댓글을 작성할 수 있습니다
                </p>
              </div>
            ) : editingCommentId === null ? (
              <div className="rounded-200 border border-border-subtle bg-background-alternative p-300">
                <CommentForm onSubmit={handleAddComment} isSubmitting={createCommentMutation.isPending} />
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* 수정 모달 */}
      <VotingEditModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateGame}
          initialData={voting}
      />
    </div>
  );
}
