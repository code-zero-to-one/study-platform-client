'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Vote, SearchX, Plus, ArrowUpDown } from 'lucide-react';
import VotingCard from '@/components/cards/voting-card';
import VotingCreateModal from '@/components/voting/voting-create-modal';
import { VotingCreateFormData } from '@/types/schemas/zod-schema';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { useBalanceGameListQuery } from '@/features/balance-game/model/use-balance-game-query';
import { useCreateBalanceGameMutation } from '@/features/balance-game/model/use-balance-game-mutation';
import { CreateBalanceGameRequest } from '@/features/balance-game/types';
import Toast from '@/components/ui/toast';

export default function VotingPage() {
  // 상태 관리
  const [statusFilter, setStatusFilter] = useState<'active' | 'closed' | 'all'>('active');
  const [sortMode, setSortMode] = useState<'latest' | 'popular'>('latest');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // React Query Hooks
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    error,
  } = useBalanceGameListQuery(sortMode, statusFilter === 'all' ? undefined : statusFilter);

  const createMutation = useCreateBalanceGameMutation();

  // 무한 스크롤용 ref
  const observerTarget = useRef<HTMLDivElement>(null);

  // 투표 생성 핸들러
  const handleCreateVoting = async (data: VotingCreateFormData) => {
    try {
      const requestBody: CreateBalanceGameRequest = {
        title: data.title,
        description: data.description || '',
        options: data.options.map((opt) => opt.label),
        endsAt: data.endsAt,
        tags: data.tags || [],
      };

      await createMutation.mutateAsync(requestBody);
      setIsCreateModalOpen(false);
      setShowToast(true);
    } catch (error) {
      console.error('투표 생성 실패:', error);
      throw error;
    }
  };

  // 무한 스크롤 Intersection Observer
  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !isFetching
        ) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentTarget);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]);

  // 로딩 상태 (첫 로드만)
  if (status === 'pending') {
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
  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-alternative">
        <div className="flex flex-col items-center gap-400">
          <SearchX className="h-12 w-12 text-text-subtlest" />
          <p className="font-designer-16m text-text-subtle">
            데이터를 불러오는데 실패했습니다.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-100 bg-fill-brand-default-default px-400 py-200 font-designer-14b text-text-inverse transition-colors hover:bg-fill-brand-default-hover"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const votings = data?.pages.flatMap((page) => page.content) || [];

  return (
    <>
      <div className="bg-background-alternative">
        <div className="mx-auto w-full max-w-screen-xl px-400 py-600">
          {/* 사이드바 + 메인 컨텐츠 */}
          <div className="flex gap-600">
            {/* Left Sidebar */}
            <aside className="sticky top-400 h-fit w-[200px] shrink-0 pt-100">
              <div className="flex flex-col gap-50">
                <div className="flex items-center gap-100">
                  <Vote className="h-5 w-5 text-text-brand" />
                  <h1 className="font-bold-h5 text-text-strong tracking-tight">
                    밸런스 게임
                  </h1>
                </div>
                <span className="font-designer-13r text-text-subtle tracking-tight">
                  선택하고 의견을 나눠보세요
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

              {/* 필터 + 주제 생성 버튼 */}
              <div className="mb-400 flex items-center justify-between gap-200">
                {/* 필터(상태) + 정렬 */}
                <div className="flex items-center gap-200">
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={cn(
                      'rounded-100 px-300 py-150 font-designer-13b transition-all',
                      statusFilter === 'active'
                        ? 'bg-fill-brand-default-default text-text-inverse shadow-1'
                        : 'border border-border-subtle bg-background-default text-text-subtle hover:border-border-brand hover:text-text-brand'
                    )}
                  >
                    진행 중
                  </button>
                  <button
                    onClick={() => setStatusFilter('closed')}
                    className={cn(
                      'rounded-100 px-300 py-150 font-designer-13b transition-all',
                      statusFilter === 'closed'
                        ? 'bg-fill-brand-default-default text-text-inverse shadow-1'
                        : 'border border-border-subtle bg-background-default text-text-subtle hover:border-border-brand hover:text-text-brand'
                    )}
                  >
                    종료됨
                  </button>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={cn(
                      'rounded-100 px-300 py-150 font-designer-13b transition-all',
                      statusFilter === 'all'
                        ? 'bg-fill-brand-default-default text-text-inverse shadow-1'
                        : 'border border-border-subtle bg-background-default text-text-subtle hover:border-border-brand hover:text-text-brand'
                    )}
                  >
                    전체
                  </button>

                  {/* divider */}
                  <div className="mx-100 h-6 w-px bg-border-subtle" />

                  {/* Sort Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center gap-50 px-200 py-150 rounded-100 bg-background-default border border-border-subtle font-designer-14m text-text-default hover:bg-fill-neutral-subtle-hover transition-colors whitespace-nowrap">
                      <ArrowUpDown className="w-4 h-4" />
                      {sortMode === 'latest' ? '최신순' : '인기순'}
                    </button>
                    
                    {/* Dropdown */}
                    <div className="absolute top-full left-0 pt-50 w-[120px] hidden group-hover:block z-20">
                      <div className="bg-background-default border border-border-subtle rounded-100 shadow-2 overflow-hidden">
                        <button 
                          onClick={() => setSortMode('latest')} 
                          className={cn(
                            "w-full text-left px-200 py-150 hover:bg-fill-neutral-subtle-hover font-designer-14r transition-colors",
                            sortMode === 'latest' && 'bg-fill-neutral-subtle-default'
                          )}
                        >
                          최신순
                        </button>
                        <button 
                          onClick={() => setSortMode('popular')} 
                          className={cn(
                            "w-full text-left px-200 py-150 hover:bg-fill-neutral-subtle-hover font-designer-14r transition-colors",
                            sortMode === 'popular' && 'bg-fill-neutral-subtle-default'
                          )}
                        >
                          인기순
                        </button>
                      </div>
                    </div>
                  </div>
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
                    <p className="font-designer-16m text-text-subtle">
                      투표가 없습니다
                    </p>
                    <p className="font-designer-14r text-text-subtlest">
                      곧 새로운 투표가 등록될 예정입니다
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-300">
                    {votings.map((voting) => (
                      // @ts-ignore - VotingCard type update needed
                      <VotingCard key={voting.id} voting={voting} />
                    ))}
                  </div>

                  {/* 무한 스크롤 트리거 */}
                  <div ref={observerTarget} className="py-400 text-center">
                    {isFetchingNextPage && (
                      <div className="flex items-center justify-center gap-200">
                        <Loader2 className="h-5 w-5 animate-spin text-text-brand" />
                        <span className="font-designer-14r text-text-subtle">
                          불러오는 중...
                        </span>
                      </div>
                    )}
                    {!hasNextPage && votings.length > 0 && (
                      <p className="font-designer-13r text-text-subtlest">
                        모든 투표를 불러왔습니다
                      </p>
                    )}
                  </div>
                </>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* 주제 생성 모달 */}
      <VotingCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateVoting}
      />

      {/* 토스트 */}
      <Toast
        message="투표 주제가 생성되었습니다"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}
