'use client';

import {
  Loader2,
  ArrowLeft,
  TrendingUp,
  MessageCircle,
  MoreVertical,
  Edit,
  Trash2,
  Lock,
  Share2,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/common/ui/avatar';
import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';
import Toast from '@/components/common/ui/toast';
import DailyStatsChart from '@/components/one-to-one/balance-game/voting/daily-stats-chart';
import VoteResultsChart from '@/components/one-to-one/balance-game/voting/vote-results-chart';
import VoteTimer from '@/components/one-to-one/balance-game/voting/vote-timer';
import { useAuthReady } from '@/features/auth/model/use-auth';
import CommentForm from '@/features/study/one-to-one/discussion/ui/comment-form';
import CommentList from '@/features/study/one-to-one/discussion/ui/comment-list';
import {
  useVoteBalanceGameMutation,
  useCancelVoteBalanceGameMutation,
  useCreateBalanceGameCommentMutation,
  useDeleteBalanceGameCommentMutation,
  useDeleteBalanceGameMutation,
  useUpdateBalanceGameCommentMutation,
  useUpdateBalanceGameMutation,
} from '@/hooks/queries/one-to-one/use-balance-game-mutation';
import {
  useBalanceGameDetailQuery,
  useBalanceGameCommentsQuery,
} from '@/hooks/queries/one-to-one/use-balance-game-query';
import { useToastStore } from '@/stores/use-toast-store';
import { useUserStore } from '@/stores/use-user-store';
import { BalanceGameComment } from '@/types/one-to-one-study/balance-game';
import { VotingOption } from '@/types/one-to-one-study/voting';
import {
  CommentFormData,
  VotingCreateFormData,
} from '@/types/schemas/zod-schema';
import VotingEditModal from './voting-edit-modal';

const LoginModal = dynamic(
  () => import('@/components/auth/modals/login-modal'),
  { ssr: false },
);

const UserProfileModal = dynamic(
  () => import('@/components/common/modals/user-profile-modal'),
  { ssr: false },
);

const OPTION_COLORS = [
  {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    ring: 'ring-blue-500',
    primary: 'bg-blue-500',
  },
  {
    border: 'border-green-500',
    bg: 'bg-green-50',
    text: 'text-green-600',
    ring: 'ring-green-500',
    primary: 'bg-green-500',
  },
  {
    border: 'border-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    ring: 'ring-purple-500',
    primary: 'bg-purple-500',
  },
  {
    border: 'border-orange-500',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    ring: 'ring-orange-500',
    primary: 'bg-orange-500',
  },
  {
    border: 'border-pink-500',
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    ring: 'ring-pink-500',
    primary: 'bg-pink-500',
  },
];

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
  const [editingCommentContent, setEditingCommentContent] =
    useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [shareToastMessage, setShareToastMessage] = useState(
    '링크가 복사되었습니다.',
  );

  // User Info
  const memberId = useUserStore((state) => state.memberId);
  const showToast = useToastStore((state) => state.showToast);
  const { isAuthReady } = useAuthReady();

  // Queries
  const {
    data: voting,
    isLoading,
    error,
  } = useBalanceGameDetailQuery(votingId);

  // 투표 여부 확인 (투표를 한 경우에만 댓글 목록 가져오기)
  const hasVoted = voting?.myVote !== undefined && voting?.myVote !== null;

  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBalanceGameCommentsQuery(votingId, { enabled: !!hasVoted });

  // Mutations
  const voteMutation = useVoteBalanceGameMutation(votingId);
  const cancelVoteMutation = useCancelVoteBalanceGameMutation(votingId);
  const createCommentMutation = useCreateBalanceGameCommentMutation(votingId);
  const updateCommentMutation = useUpdateBalanceGameCommentMutation(votingId);
  const deleteCommentMutation = useDeleteBalanceGameCommentMutation(votingId);
  const updateGameMutation = useUpdateBalanceGameMutation(votingId);
  const deleteGameMutation = useDeleteBalanceGameMutation(votingId);

  // Set selected option when voting loads
  useEffect(() => {
    if (voting?.myVote) {
      setSelectedOption(voting.myVote);
    }
  }, [voting?.myVote]);

  const comments = React.useMemo(() => {
    const allComments =
      commentsData?.pages.flatMap((page) => page.content) || [];
    // 중복 제거 (key prop warning 방지)
    const seen = new Set();

    return allComments.filter((comment) => {
      if (seen.has(comment.id)) return false;
      seen.add(comment.id);

      return true;
    });
  }, [commentsData]);

  const commentTotalCount =
    typeof voting?.commentCount === 'number'
      ? voting.commentCount
      : (commentsData?.pages?.[0]?.totalElements ?? comments.length);

  // isActive는 백엔드가 내려줄 수도 있고(권장), 없으면 endsAt 기준으로 프론트에서 계산
  // VoteTimer도 endsAt으로 "종료"를 판단하므로, 두 로직이 어긋나지 않게 맞춘다.
  const isActiveByEndsAt = voting?.endsAt
    ? new Date(voting.endsAt).getTime() > Date.now()
    : true;

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
        tags: data.tags || [], // tags가 undefined일 경우 빈 배열로 전달
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Update game failed:', error);
    }
  };

  const handleDeleteGame = async () => {
    try {
      await deleteGameMutation.mutateAsync();
      setIsDeleteModalOpen(false);
      onBack(); // 삭제 후 목록으로 돌아가기
    } catch (error) {
      console.error('Delete game failed:', error);
      showToast('투표 삭제에 실패했습니다. 다시 시도해주세요.', 'error');
    }
  };

  const openShareToast = (message: string) => {
    setShareToastMessage(message);
    setShowShareToast(false);
    requestAnimationFrame(() => setShowShareToast(true));
  };

  const openManualCopyPrompt = (shareUrl: string) => {
    const result = window.prompt('링크를 복사해 공유하세요.', shareUrl);

    return typeof result === 'string';
  };

  const fallbackCopy = (shareUrl: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (copied) return true;
    } catch (error) {
      // ignore and fallback
    }

    return false;
  };

  const handleShare = async () => {
    if (!voting) return;
    const shareUrl = window.location.href;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        openShareToast('링크가 복사되었습니다.');

        return;
      } catch (error) {
        // continue to fallback
      }
    }

    const copied = fallbackCopy(shareUrl);
    if (copied) {
      openShareToast('링크가 복사되었습니다.');

      return;
    }

    const manualCopy = openManualCopyPrompt(shareUrl);
    if (manualCopy) {
      openShareToast('링크가 복사되었습니다.');
    }
  };

  // Check if current user is author
  const isAuthor = voting?.author.id === memberId;
  const authorImage =
    typeof voting?.author.profileImage === 'string'
      ? voting?.author.profileImage
      : voting?.author.profileImage?.resizedImages?.[0]?.resizedImageUrl;

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-400">
          <Loader2 className="text-text-brand h-8 w-8 animate-spin" />
          <p className="font-designer-16m text-text-subtle">
            투표를 불러오는 중...
          </p>
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
            className="rounded-100 bg-fill-brand-default-default font-designer-14b text-text-inverse hover:bg-fill-brand-default-hover px-400 py-200 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // Adapt BalanceGame options to VotingOption for compatibility
  const votingOptions: VotingOption[] = voting.options;

  const showVoteOptions = isAuthReady && !hasVoted && isActive;

  return (
    <div className="transition-all duration-300">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={onBack}
        className="font-designer-14m text-text-subtle hover:text-text-strong mb-400 flex items-center gap-100 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        돌아가기
      </button>

      {/* 헤더 */}
      <div className="rounded-200 border-border-subtle bg-background-default shadow-1 mb-500 border p-500">
        {/* 작성자 & 상태 */}
        <div className="mb-300 flex items-center justify-between gap-300">
          {/* 작성자 정보 */}
          <div onClick={(e) => e.stopPropagation()}>
            <UserProfileModal
              memberId={voting.author.id}
              trigger={
                <div className="hover:ring-fill-brand-default-default flex cursor-pointer items-center gap-200 rounded-full px-200 py-100 ring-1 ring-transparent transition-shadow duration-100 ring-inset">
                  <div>
                    <UserAvatar
                      size={32}
                      image={authorImage || undefined}
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

            <button
              onClick={handleShare}
              type="button"
              className="rounded-100 text-text-subtle hover:bg-fill-neutral-subtle-default active:bg-fill-neutral-subtle-hover focus-visible:ring-fill-brand-default-default focus-visible:ring-offset-background-default p-100 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95"
              aria-label="공유"
            >
              <Share2 className="h-5 w-5" />
            </button>

            {isAuthor && (
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="rounded-100 text-text-subtle hover:bg-fill-neutral-subtle-default p-100 transition-colors"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="rounded-100 border-border-subtle bg-background-default shadow-3 absolute top-full right-0 z-20 mt-100 w-[120px] border py-100">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsEditModalOpen(true);
                        }}
                        className="font-designer-13r text-text-default hover:bg-fill-neutral-subtle-default flex w-full items-center gap-200 px-300 py-200"
                      >
                        <Edit className="h-4 w-4" />
                        수정
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsDeleteModalOpen(true);
                        }}
                        className="font-designer-13r text-text-critical hover:bg-fill-critical-subtle-default flex w-full items-center gap-200 px-300 py-200"
                      >
                        <Trash2 className="h-4 w-4" />
                        삭제
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 제목 */}
        <h1 className="font-designer-28b text-text-strong mb-200">
          {voting.title}
        </h1>

        {/* 태그 - 제목 바로 아래에 표시 */}
        {voting.tags &&
          Array.isArray(voting.tags) &&
          voting.tags.length > 0 && (
            <div className="mb-200 flex flex-wrap gap-100">
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

        {/* 설명 */}
        {voting.description && (
          <p className="rounded-100 border-border-subtle bg-background-alternative font-designer-14r text-text-default mb-200 border p-300">
            {voting.description}
          </p>
        )}
      </div>

      {/* 투표 섹션 */}
      <div className="rounded-200 border-border-subtle bg-background-default shadow-1 mb-500 border p-500">
        {showVoteOptions ? (
          <>
            {/* 헤더 */}
            <div className="mb-400 flex items-center justify-between">
              <h2 className="font-designer-18b text-text-strong">
                투표해주세요
              </h2>

              {/* 현재 투표 참여 인원 */}
              <div className="rounded-100 border-border-subtle bg-background-alternative flex items-center gap-200 border px-300 py-150">
                <div
                  className="bg-fill-brand-default-default flex items-center justify-center rounded-full"
                  style={{ width: '32px', height: '32px' }}
                >
                  <TrendingUp
                    className="text-text-inverse"
                    style={{ width: '20px', height: '20px' }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-designer-11r text-text-subtle">
                    현재 참여
                  </span>
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
                const color = OPTION_COLORS[index % OPTION_COLORS.length];

                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    disabled={voteMutation.isPending}
                    className={cn(
                      'group rounded-200 relative border-2 p-300 text-left transition-all duration-200',
                      isSelected
                        ? cn('shadow-lg', color.border, color.bg)
                        : 'border-border-subtle bg-background-default hover:border-border-brand hover:shadow-1',
                      voteMutation.isPending && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <div className="flex items-center gap-200">
                      {/* 번호 배지 */}
                      <div className="bg-fill-neutral-subtle-default text-text-subtle flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold">
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
                'rounded-100 font-designer-15b text-text-inverse w-full py-300 shadow-lg transition-all duration-200',
                'from-fill-brand-default-default to-fill-brand-default-hover bg-gradient-to-r',
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
                  className="font-designer-12r text-text-subtle hover:text-text-default underline disabled:opacity-50"
                >
                  {cancelVoteMutation.isPending
                    ? '취소 중...'
                    : '투표 취소하고 다시하기'}
                </button>
              )}
            </div>
            <div className="relative">
              <div className={cn(!isAuthReady && 'blur-[6px]')}>
                <VoteResultsChart
                  options={votingOptions}
                  myVote={voting.myVote || undefined}
                  totalVotes={voting.totalVotes}
                />
              </div>
              {!isAuthReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <LoginModal
                    openTrigger={
                      <button className="rounded-100 bg-background-default/90 text-text-strong border-border-subtle flex items-center gap-100 border px-200 py-100 text-[12px] font-medium">
                        <Lock className="h-3 w-3" />
                        회원가입 후 결과 보기
                      </button>
                    }
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 일별 통계 (투표 후에만 표시) */}
      {isAuthReady &&
        hasVoted &&
        voting.dailyStats &&
        voting.dailyStats.length > 0 && (
          <div className="mb-500">
            <DailyStatsChart
              dailyStats={voting.dailyStats}
              options={votingOptions}
              myVote={voting.myVote || undefined}
            />
          </div>
        )}

      {/* 댓글 섹션 */}
      <div className="rounded-200 border-border-subtle bg-background-default shadow-1 border p-500">
        <div className="font-designer-16b text-text-strong mb-400 flex items-center gap-100">
          <MessageCircle className="h-5 w-5" />
          <span>댓글 {commentTotalCount}</span>
        </div>

        {!isAuthReady ? (
          <div className="rounded-200 border-border-subtle bg-background-alternative flex flex-col items-center justify-center gap-200 border p-400 text-center">
            <Lock className="text-text-subtlest h-5 w-5" />
            <p className="font-designer-14m text-text-subtle">
              회원가입 후 댓글을 확인할 수 있습니다
            </p>
            <LoginModal
              openTrigger={
                <button className="rounded-100 bg-background-default text-text-strong border-border-subtle flex items-center gap-100 border px-200 py-100 text-[12px] font-medium">
                  회원가입 후 댓글 보기
                </button>
              }
            />
          </div>
        ) : (
          <>
            {/* 댓글 목록 */}
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
                  className="rounded-100 border-border-subtle font-designer-13r text-text-subtle hover:bg-background-alternative mt-300 w-full border py-200"
                >
                  {isFetchingNextPage ? '불러오는 중...' : '더 보기'}
                </button>
              )}
            </div>

            {/* 댓글 작성 폼 */}
            {isActive && (
              <>
                {!hasVoted ? (
                  <div className="rounded-200 border-border-subtle bg-background-alternative border p-400 text-center">
                    <p className="font-designer-14m text-text-subtle">
                      투표 후 댓글을 작성할 수 있습니다
                    </p>
                  </div>
                ) : editingCommentId === null ? (
                  <div className="rounded-200 border-border-subtle bg-background-alternative border p-300">
                    <CommentForm
                      onSubmit={handleAddComment}
                      isSubmitting={createCommentMutation.isPending}
                    />
                  </div>
                ) : null}
              </>
            )}
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

      {/* 삭제 확인 모달 */}
      <Modal.Root open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <Modal.Portal>
          <Modal.Overlay />
          <Modal.Content size="small" className="w-[423px]">
            <Modal.Header className="border-border-default flex justify-center border-b py-200">
              <Modal.Title>투표 주제를 삭제하시겠습니까?</Modal.Title>
            </Modal.Header>

            <Modal.Body className="font-designer-14r text-text-default flex justify-center py-250">
              작성하신 투표 주제가 영구적으로 삭제됩니다.
            </Modal.Body>

            <Modal.Footer className="flex justify-center gap-200 border-t-0 py-250">
              <Button
                color="secondary"
                className="font-designer-14b w-[160px]"
                size="medium"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                취소
              </Button>
              <Button
                color="primary"
                className="font-designer-14b w-[160px]"
                size="medium"
                onClick={handleDeleteGame}
                disabled={deleteGameMutation.isPending}
              >
                {deleteGameMutation.isPending ? '삭제 중...' : '삭제하기'}
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      <Toast
        message={shareToastMessage}
        isVisible={showShareToast}
        onClose={() => setShowShareToast(false)}
      />
    </div>
  );
}
