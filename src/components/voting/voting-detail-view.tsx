'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, TrendingUp, MessageCircle, Check } from 'lucide-react';
import { Voting, VotingComment } from '@/types/voting';
import { mockFetchVotingDetail } from '@/mocks/voting-mock-data';
import UserAvatar from '@/components/ui/avatar';
import UserProfileModal from '@/entities/user/ui/user-profile-modal';
import VoteResultsChart from '@/components/voting/vote-results-chart';
import VoteTimer from '@/components/voting/vote-timer';
import DailyStatsChart from '@/components/voting/daily-stats-chart';
import CommentList from '@/components/discussion/comment-list';
import CommentForm from '@/components/discussion/comment-form';
import { CommentFormData } from '@/types/schemas/zod-schema';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface VotingDetailViewProps {
  votingId: number;
  onBack: () => void;
}

export default function VotingDetailView({ votingId, onBack }: VotingDetailViewProps) {
  const [voting, setVoting] = useState<Voting | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로드
  useEffect(() => {
    const loadVoting = async () => {
      try {
        setIsLoading(true);
        const data = await mockFetchVotingDetail(votingId);
        if (data) {
          setVoting(data);
          setSelectedOption(data.myVote);
        } else {
          setError('투표를 찾을 수 없습니다.');
        }
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadVoting();
  }, [votingId]);

  // 투표 핸들러
  const handleVote = async () => {
    if (!selectedOption || !voting?.isActive) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setVoting((prev) => {
        if (!prev) return prev;

        const oldVote = prev.myVote;
        const updatedOptions = prev.options.map((opt) => {
          let newVoteCount = opt.voteCount;

          if (oldVote === opt.id) {
            newVoteCount--;
          }
          if (opt.id === selectedOption) {
            newVoteCount++;
          }

          return { ...opt, voteCount: newVoteCount };
        });

        const newTotalVotes = oldVote ? prev.totalVotes : prev.totalVotes + 1;
        const optionsWithPercentage = updatedOptions.map((opt) => ({
          ...opt,
          percentage: (opt.voteCount / newTotalVotes) * 100,
        }));

        return {
          ...prev,
          myVote: selectedOption,
          options: optionsWithPercentage,
          totalVotes: newTotalVotes,
        };
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 댓글 추가 핸들러
  const handleAddComment = async (data: CommentFormData) => {
    if (!voting) return;

    const newComment: VotingComment = {
      id: Date.now(),
      author: { id: 999, nickname: '나' },
      content: data.content,
      createdAt: new Date().toISOString(),
      isAuthor: true,
      votedOption: voting.options.find((opt) => opt.id === voting.myVote)?.label,
    };

    setVoting((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        comments: [...prev.comments, newComment],
        commentCount: prev.commentCount + 1,
      };
    });
  };

  // 댓글 삭제 핸들러
  const handleDeleteComment = (commentId: number) => {
    setVoting((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        comments: prev.comments.filter((c) => c.id !== commentId),
        commentCount: prev.commentCount - 1,
      };
    });
  };

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
          <p className="font-designer-16m text-text-subtle">{error || '투표를 찾을 수 없습니다.'}</p>
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

  const hasVoted = voting.myVote !== undefined;

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
        <div className="mb-300 flex items-center justify-between">
          {/* 작성자 정보 */}
          <div className="flex items-center gap-200">
            <div onClick={(e) => e.stopPropagation()}>
              <UserProfileModal
                memberId={voting.author.id}
                trigger={<UserAvatar size={32} image={voting.author.avatar} />}
              />
            </div>
            <span className="font-designer-13b text-text-default">{voting.author.nickname}</span>
          </div>

          {/* 타이머 표시 */}
          <VoteTimer endsAt={voting.endsAt} isActive={voting.isActive} />
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
        {voting.tags.length > 0 && (
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
        {!hasVoted && voting.isActive ? (
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
                    disabled={isSubmitting}
                    className={cn(
                      'group relative rounded-200 border-2 p-300 text-left transition-all duration-200',
                      isSelected
                        ? cn('shadow-lg', color.border, color.bg)
                        : 'border-border-subtle bg-background-default hover:border-border-brand hover:shadow-1',
                      isSubmitting && 'cursor-not-allowed opacity-50',
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
              disabled={!selectedOption || isSubmitting}
              className={cn(
                'w-full rounded-100 py-300 font-designer-15b text-text-inverse shadow-lg transition-all duration-200',
                'bg-gradient-to-r from-fill-brand-default-default to-fill-brand-default-hover',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
                'hover:scale-[1.02] hover:shadow-xl',
              )}
            >
              {isSubmitting ? (
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
            <h2 className="mb-400 font-designer-18b text-text-strong">투표 결과</h2>
            <VoteResultsChart
              options={voting.options}
              myVote={voting.myVote}
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
            options={voting.options}
            myVote={voting.myVote}
          />
        </div>
      )}

      {/* 댓글 섹션 */}
      <div className="rounded-200 border border-border-subtle bg-background-default p-500 shadow-1">
        <div className="mb-400 flex items-center gap-100 font-designer-16b text-text-strong">
          <MessageCircle className="h-5 w-5" />
          <span>댓글 {voting.commentCount}</span>
        </div>

        {/* 댓글 목록 (항상 표시) */}
        <div className="mb-400">
          <CommentList 
            comments={voting.comments} 
            onDelete={handleDeleteComment}
            votingOptions={voting.options}
          />
        </div>

        {/* 댓글 작성 폼 */}
        {voting.isActive && (
          <>
            {!hasVoted ? (
              <div className="rounded-200 border border-border-subtle bg-background-alternative p-400 text-center">
                <p className="font-designer-14m text-text-subtle">
                  투표 후 댓글을 작성할 수 있습니다
                </p>
              </div>
            ) : (
              <div className="rounded-200 border border-border-subtle bg-background-alternative p-300">
                <CommentForm onSubmit={handleAddComment} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

