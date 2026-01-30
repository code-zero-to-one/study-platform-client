'use client';

import { Loader2, Vote, SearchX, Plus, ArrowUpDown } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import VotingCard from '@/components/card/voting-card';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Toast from '@/components/ui/toast';
import VotingCreateModal from '@/components/voting/voting-create-modal';
import { useCreateBalanceGameMutation } from '@/features/balance-game/model/use-balance-game-mutation';
import { useBalanceGameListQuery } from '@/features/balance-game/model/use-balance-game-query';
import { CreateBalanceGameRequest } from '@/features/balance-game/types';
import { VotingCreateFormData } from '@/types/schemas/zod-schema';

export default function BalanceGamePage() {
  // 상태 관리
  const [statusFilter, setStatusFilter] = useState<'active' | 'closed' | 'all'>(
    'active',
  );
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
  } = useBalanceGameListQuery(
    sortMode,
    statusFilter === 'all' ? undefined : statusFilter,
  );

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
        endsAt:
          data.endsAt && data.endsAt.trim() !== '' ? data.endsAt : undefined,
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
          fetchNextPage().catch(() => {
            // 무한 스크롤 실패 시 무시
          });
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(currentTarget);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]);

  // 로딩 상태 (첫 로드만)
  if (status === 'pending') {
    return (
      <div className="bg-background-alternative flex min-h-screen items-center justify-center">
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
  if (status === 'error') {
    return (
      <div className="bg-background-alternative flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-400">
          <SearchX className="text-text-subtlest h-12 w-12" />
          <p className="font-designer-16m text-text-subtle">
            데이터를 불러오는데 실패했습니다.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-100 bg-fill-brand-default-default font-designer-14b text-text-inverse hover:bg-fill-brand-default-hover px-400 py-200 transition-colors"
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
                  <Vote className="text-text-brand h-5 w-5" />
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
                <h2 className="font-display-headings6 text-text-strong mb-300">
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
                      'rounded-100 font-designer-13b px-300 py-150 transition-all',
                      statusFilter === 'active'
                        ? 'bg-fill-brand-default-default text-text-inverse shadow-1'
                        : 'border-border-subtle bg-background-default text-text-subtle hover:border-border-brand hover:text-text-brand border',
                    )}
                  >
                    진행 중
                  </button>
                  <button
                    onClick={() => setStatusFilter('closed')}
                    className={cn(
                      'rounded-100 font-designer-13b px-300 py-150 transition-all',
                      statusFilter === 'closed'
                        ? 'bg-fill-brand-default-default text-text-inverse shadow-1'
                        : 'border-border-subtle bg-background-default text-text-subtle hover:border-border-brand hover:text-text-brand border',
                    )}
                  >
                    종료됨
                  </button>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={cn(
                      'rounded-100 font-designer-13b px-300 py-150 transition-all',
                      statusFilter === 'all'
                        ? 'bg-fill-brand-default-default text-text-inverse shadow-1'
                        : 'border-border-subtle bg-background-default text-text-subtle hover:border-border-brand hover:text-text-brand border',
                    )}
                  >
                    전체
                  </button>

                  {/* divider */}
                  <div className="bg-border-subtle mx-100 h-6 w-px" />

                  <button
                    onClick={() => setSortMode('latest')}
                    className={cn(
                      'rounded-100 font-designer-13b px-300 py-150 transition-all',
                      sortMode === 'latest'
                        ? 'bg-fill-neutral-default-default text-text-strong shadow-1'
                        : 'border-border-subtle bg-background-default text-text-subtle hover:border-border-brand hover:text-text-brand border',
                    )}
                  >
                    최신순
                  </button>
                  <button
                    onClick={() => setSortMode('popular')}
                    className={cn(
                      'rounded-100 font-designer-13b px-300 py-150 transition-all',
                      sortMode === 'popular'
                        ? 'bg-fill-neutral-default-default text-text-strong shadow-1'
                        : 'border-border-subtle bg-background-default text-text-subtle hover:border-border-brand hover:text-text-brand border',
                    )}
                  >
                    인기순
                  </button>
                </div>

                {/* 주제 생성 버튼 */}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="rounded-100 bg-fill-brand-default-default font-designer-14b text-text-inverse hover:bg-fill-brand-default-hover flex items-center gap-100 px-400 py-250 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  새 주제 만들기
                </button>
              </div>

              {/* 카드 리스트 */}
              <div className="flex flex-col gap-400">
                {votings.map((voting) => (
                  <VotingCard key={voting.id} voting={voting} />
                ))}
              </div>

              {/* 무한 스크롤 로딩 */}
              <div ref={observerTarget} className="py-500 text-center">
                {isFetchingNextPage && (
                  <Loader2 className="text-text-brand mx-auto h-6 w-6 animate-spin" />
                )}
                {!hasNextPage && votings.length > 0 && (
                  <p className="text-text-subtle font-designer-13r">
                    더 이상 불러올 투표가 없습니다.
                  </p>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <Toast
          message="투표 주제가 생성되었습니다."
          onClose={() => setShowToast(false)}
        />
      )}

      {/* 모달 */}
      <VotingCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateVoting}
      />
    </>
  );
}
