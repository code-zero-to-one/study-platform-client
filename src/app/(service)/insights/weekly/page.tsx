'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Vote, SearchX } from 'lucide-react';
import { Voting, VotingComment } from '@/types/voting';
import { mockFetchVotings, mockFetchVotingDetail } from '@/mocks/voting-mock-data';
import VotingCard from '@/components/cards/voting-card';
import VotingDetailModal from '@/components/voting/voting-detail-modal';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

export default function VotingPage() {
  // 상태 관리
  const [votings, setVotings] = useState<Voting[]>([]);
  const [selectedVoting, setSelectedVoting] = useState<Voting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // 무한 스크롤용 ref
  const observerTarget = useRef<HTMLDivElement>(null);

  // 데이터 로딩 함수
  const loadVotings = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      try {
        if (reset) {
          setIsLoading(true);
          setError(null);
        } else {
          setIsLoadingMore(true);
        }

        const result = await mockFetchVotings({
          page: pageNum,
          limit: 10,
          activeOnly: showActiveOnly,
        });

        setVotings((prev) => (reset ? result.items : [...prev, ...result.items]));
        setHasMore(result.hasMore);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [showActiveOnly],
  );

  // 필터 변경 시 첫 페이지 로드
  useEffect(() => {
    setPage(1);
    loadVotings(1, true);
  }, [loadVotings]);

  // 무한 스크롤 Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadVotings(nextPage, false);
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, isLoading, page, loadVotings]);

  // 투표 상세 열기
  const handleOpenVoting = async (voting: Voting) => {
    // 상세 데이터 가져오기 (댓글 포함)
    const detailVoting = await mockFetchVotingDetail(voting.id);
    if (detailVoting) {
      setSelectedVoting(detailVoting);
    }
  };

  // 투표 핸들러
  const handleVote = (votingId: number, optionId: number) => {
    setVotings((prev) =>
      prev.map((v) => {
        if (v.id !== votingId) return v;

        // 기존 투표 취소 (있으면)
        const oldVote = v.myVote;
        const updatedOptions = v.options.map((opt) => {
          let newVoteCount = opt.voteCount;

          // 기존 투표 취소
          if (oldVote === opt.id) {
            newVoteCount--;
          }

          // 새 투표 추가
          if (opt.id === optionId) {
            newVoteCount++;
          }

          return { ...opt, voteCount: newVoteCount };
        });

        // 퍼센트 재계산
        const newTotalVotes = oldVote ? v.totalVotes : v.totalVotes + 1;
        const optionsWithPercentage = updatedOptions.map((opt) => ({
          ...opt,
          percentage: (opt.voteCount / newTotalVotes) * 100,
        }));

        const updatedVoting = {
          ...v,
          myVote: optionId,
          options: optionsWithPercentage,
          totalVotes: newTotalVotes,
        };

        // 선택된 투표도 업데이트
        if (selectedVoting?.id === votingId) {
          setSelectedVoting(updatedVoting);
        }

        return updatedVoting;
      }),
    );
  };

  // 댓글 추가 핸들러
  const handleAddComment = (votingId: number, content: string) => {
    const newComment: VotingComment = {
      id: Date.now(),
      author: { id: 999, nickname: '나' },
      content,
      createdAt: new Date().toISOString(),
      isAuthor: true,
      votedOption: selectedVoting?.options.find((opt) => opt.id === selectedVoting.myVote)?.label,
    };

    setVotings((prev) =>
      prev.map((v) => {
        if (v.id !== votingId) return v;

        const updatedVoting = {
          ...v,
          comments: [...v.comments, newComment],
          commentCount: v.commentCount + 1,
        };

        if (selectedVoting?.id === votingId) {
          setSelectedVoting(updatedVoting);
        }

        return updatedVoting;
      }),
    );
  };

  // 댓글 삭제 핸들러
  const handleDeleteComment = (votingId: number, commentId: number) => {
    setVotings((prev) =>
      prev.map((v) => {
        if (v.id !== votingId) return v;

        const updatedVoting = {
          ...v,
          comments: v.comments.filter((c) => c.id !== commentId),
          commentCount: v.commentCount - 1,
        };

        if (selectedVoting?.id === votingId) {
          setSelectedVoting(updatedVoting);
        }

        return updatedVoting;
      }),
    );
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-alternative">
        <div className="flex flex-col items-center gap-400">
          <Loader2 className="h-8 w-8 animate-spin text-text-brand" />
          <p className="font-designer-16m text-text-subtle">투표를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-alternative">
        <div className="flex flex-col items-center gap-400">
          <SearchX className="h-12 w-12 text-text-subtlest" />
          <p className="font-designer-16m text-text-subtle">{error}</p>
          <button
            onClick={() => loadVotings(1, true)}
            className="rounded-100 bg-fill-brand-default-default px-400 py-200 font-designer-14b text-text-inverse transition-colors hover:bg-fill-brand-default-hover"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-alternative">
      <div className="mx-auto w-full max-w-screen-xl px-400 py-600">
        {/* 사이드바 + 메인 컨텐츠 */}
        <div className="flex gap-600">
          {/* Left Sidebar */}
          <aside className="sticky top-400 h-fit w-[200px] shrink-0 pt-100">
            <div className="flex flex-col gap-50">
              <div className="flex items-center gap-100">
                <Vote className="h-5 w-5 text-text-brand" />
                <h1 className="font-bold-h5 text-text-strong tracking-tight">스파링</h1>
              </div>
              <span className="font-designer-13r text-text-subtle tracking-tight">
                뜨거운 논쟁에 투표하고 토론하기
              </span>
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-w-0 flex-1">
            {/* 헤더 */}
            <div className="mb-500">
              <h2 className="mb-300 font-display-headings6 text-text-strong">
                선택하고, 의견을 나눠보세요
              </h2>
              <p className="font-designer-14r text-text-subtle">
                다양한 주제에 투표하고 댓글로 자유롭게 토론할 수 있습니다.
              </p>
            </div>

            {/* 필터 */}
            <div className="mb-400 flex items-center gap-200">
              <button
                onClick={() => setShowActiveOnly(true)}
                className={cn(
                  'rounded-100 px-300 py-150 font-designer-13b transition-all',
                  showActiveOnly
                    ? 'bg-fill-brand-default-default text-text-inverse shadow-1'
                    : 'border border-border-subtle bg-background-default text-text-subtle hover:border-border-brand hover:text-text-brand',
                )}
              >
                진행 중
              </button>
              <button
                onClick={() => setShowActiveOnly(false)}
                className={cn(
                  'rounded-100 px-300 py-150 font-designer-13b transition-all',
                  !showActiveOnly
                    ? 'bg-fill-brand-default-default text-text-inverse shadow-1'
                    : 'border border-border-subtle bg-background-default text-text-subtle hover:border-border-brand hover:text-text-brand',
                )}
              >
                전체
              </button>
            </div>

            {/* 투표 목록 */}
            {votings.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-300 rounded-200 border border-border-subtle bg-background-default py-1200">
                <Vote className="h-12 w-12 text-text-subtlest opacity-30" />
                <div className="flex flex-col items-center gap-100">
                  <p className="font-designer-16m text-text-subtle">투표가 없습니다</p>
                  <p className="font-designer-14r text-text-subtlest">
                    곧 새로운 투표가 등록될 예정입니다
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-300">
                  {votings.map((voting) => (
                    <VotingCard key={voting.id} voting={voting} onClick={() => handleOpenVoting(voting)} />
                  ))}
                </div>

                {/* 무한 스크롤 트리거 */}
                <div ref={observerTarget} className="py-400 text-center">
                  {isLoadingMore && (
                    <div className="flex items-center justify-center gap-200">
                      <Loader2 className="h-5 w-5 animate-spin text-text-brand" />
                      <span className="font-designer-14r text-text-subtle">불러오는 중...</span>
                    </div>
                  )}
                  {!hasMore && votings.length > 0 && (
                    <p className="font-designer-13r text-text-subtlest">모든 투표를 불러왔습니다</p>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* 투표 상세 모달 */}
      {selectedVoting && (
        <VotingDetailModal
          voting={selectedVoting}
          onClose={() => setSelectedVoting(null)}
          onVote={handleVote}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
        />
      )}
    </div>
  );
}
