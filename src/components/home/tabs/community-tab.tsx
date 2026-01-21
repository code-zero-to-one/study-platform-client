'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Vote, SearchX, Plus, MessageSquareText } from 'lucide-react';
import { Voting } from '@/types/voting';
import { mockFetchVotings } from '@/mocks/voting-mock-data';
import VotingCard from '@/components/cards/voting-card';
import VotingCreateModal from '@/components/voting/voting-create-modal';
import { VotingCreateFormData } from '@/types/schemas/zod-schema';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

export default function CommunityTab() {
  // 상태 관리
  const [votings, setVotings] = useState<Voting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'active' | 'all' | 'popular'>('active');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

        const activeOnly = filterMode === 'active';
        const sortBy = filterMode === 'popular' ? 'popular' : 'latest';

        const result = await mockFetchVotings({
          page: pageNum,
          limit: 10,
          activeOnly: activeOnly,
          sortBy: sortBy,
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
    [filterMode],
  );

  // 투표 생성 핸들러
  const handleCreateVoting = async (data: VotingCreateFormData) => {
    try {
      // Mock API 호출 (실제로는 서버에 요청)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // 새 투표 객체 생성
      const newVoting: Voting = {
        id: Date.now(), // 임시 ID
        round: votings.length > 0 ? Math.max(...votings.map(v => v.round)) + 1 : 1,
        title: data.title,
        description: data.description || undefined,
        options: data.options.map((opt, index) => ({
          id: Date.now() + index,
          label: opt.label,
          voteCount: 0,
          percentage: 0,
        })),
        totalVotes: 0,
        myVote: undefined,
        commentCount: 0,
        comments: [],
        createdAt: new Date().toISOString(),
        endsAt: data.endsAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후
        isActive: true,
        tags: data.tags || [],
      };
      
      // localStorage에 저장 (상세 페이지에서 조회 가능하도록)
      const customVotings = localStorage.getItem('customVotings');
      const existingVotings = customVotings ? JSON.parse(customVotings) : [];
      localStorage.setItem('customVotings', JSON.stringify([newVoting, ...existingVotings]));
      
      // 목록 맨 앞에 추가
      setVotings((prev) => [newVoting, ...prev]);
      
      console.log('새 투표 생성 완료:', newVoting);
    } catch (error) {
      console.error('투표 생성 실패:', error);
      throw error;
    }
  };

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

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-800">
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
      <div className="flex items-center justify-center py-800">
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
    <>
      <div className="flex flex-col gap-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display-headings6 text-text-strong flex items-center gap-150">
            밸런스게임
            <MessageSquareText className="w-8 h-8 text-text-brand" />
          </h2>
        </div>

        {/* 헤더 설명 */}
        <div className="mb-300">
          <p className="font-designer-14r text-text-subtle">
            다양한 주제에 투표하고 댓글로 자유롭게 토론할 수 있습니다.
          </p>
        </div>

        {/* 필터 + 주제 생성 버튼 */}
        <div className="mb-400 flex items-center justify-between gap-200">
          {/* 필터 버튼 */}
          <div className="flex items-center gap-200">
            <button
              onClick={() => setFilterMode('active')}
              className={cn(
                'rounded-100 px-300 py-150 font-designer-13b transition-all',
                filterMode === 'active'
                  ? 'bg-fill-brand-default-default text-text-inverse shadow-1'
                  : 'border border-border-subtle bg-background-default text-text-subtle hover:border-border-brand hover:text-text-brand',
              )}
            >
              진행 중
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={cn(
                'rounded-100 px-300 py-150 font-designer-13b transition-all',
                filterMode === 'all'
                  ? 'bg-fill-brand-default-default text-text-inverse shadow-1'
                  : 'border border-border-subtle bg-background-default text-text-subtle hover:border-border-brand hover:text-text-brand',
              )}
            >
              전체
            </button>
            <button
              onClick={() => setFilterMode('popular')}
              className={cn(
                'rounded-100 px-300 py-150 font-designer-13b transition-all',
                filterMode === 'popular'
                  ? 'bg-fill-brand-default-default text-text-inverse shadow-1'
                  : 'border border-border-subtle bg-background-default text-text-subtle hover:border-border-brand hover:text-text-brand',
              )}
            >
              인기순
            </button>
          </div>

          {/* 주제 생성 버튼 */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-100 rounded-100 bg-fill-brand-default-default px-400 py-200 font-designer-13b text-text-inverse shadow-1 transition-all hover:scale-105 hover:bg-fill-brand-default-hover hover:shadow-2"
          >
            <Plus className="h-4 w-4" />
            주제 생성
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
                <VotingCard key={voting.id} voting={voting} />
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
      </div>

      {/* 주제 생성 모달 */}
      <VotingCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateVoting}
      />
    </>
  );
}