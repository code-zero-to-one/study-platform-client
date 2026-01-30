'use client';

import {
  Loader2,
  Vote,
  SearchX,
  Plus,
  MessageSquareText,
  ArrowUpDown,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import VotingCard from '@/components/card/voting-card';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Toast from '@/components/ui/toast';
import VotingCreateModal from '@/components/voting/voting-create-modal';
import VotingDetailView from '@/components/voting/voting-detail-view';
import { useCreateBalanceGameMutation } from '@/features/study/one-to-one/balance-game/model/use-balance-game-mutation';
import { useBalanceGameListQuery } from '@/features/study/one-to-one/balance-game/model/use-balance-game-query';
import type {
  BalanceGameListResponse,
  CreateBalanceGameRequest,
} from '@/features/study/one-to-one/balance-game/types';
import { VotingCreateFormData } from '@/types/schemas/zod-schema';

interface CommunityTabClientProps {
  initialList?: BalanceGameListResponse;
}

export default function CommunityTabClient({
  initialList,
}: CommunityTabClientProps) {
  // 상태 관리
  const [statusFilter, setStatusFilter] = useState<'active' | 'closed' | 'all'>(
    'active',
  );
  const [sortMode, setSortMode] = useState<'latest' | 'popular'>('latest');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedVotingId, setSelectedVotingId] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);

  // React Query Hooks
  const shouldUseInitialList =
    sortMode === 'latest' && statusFilter === 'active';
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    isPending,
    error,
  } = useBalanceGameListQuery(
    sortMode,
    statusFilter === 'all' ? undefined : statusFilter,
    {
      initialPage: shouldUseInitialList ? initialList : undefined,
    },
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

  // 상세 화면으로 전환
  const handleVotingClick = (votingId: number) => {
    setSelectedVotingId(votingId);
  };

  // 목록으로 돌아가기
  const handleBackToList = () => {
    setSelectedVotingId(null);
  };

  // 상세 화면이 열려있으면 상세 화면 표시
  if (selectedVotingId) {
    return (
      <div className="transition-all duration-300">
        <VotingDetailView
          votingId={selectedVotingId}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  // 로딩 상태 (첫 로드만)
  if (isPending) {
    return (
      <div className="flex items-center justify-center py-800">
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
      <div className="flex items-center justify-center py-800">
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
      <div className="flex flex-col gap-500 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display-headings6 text-text-strong flex items-center gap-150">
            밸런스게임
            <MessageSquareText className="text-text-brand h-8 w-8" />
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

            {/* Sort Dropdown */}
            <div className="group relative">
              <button className="rounded-100 bg-background-default border-border-subtle font-designer-14m text-text-default hover:bg-fill-neutral-subtle-hover flex items-center gap-50 border px-200 py-150 whitespace-nowrap transition-colors">
                <ArrowUpDown className="h-4 w-4" />
                {sortMode === 'latest' ? '최신순' : '인기순'}
              </button>

              {/* Dropdown */}
              <div className="absolute top-full left-0 z-20 hidden w-[120px] pt-50 group-hover:block">
                <div className="bg-background-default border-border-subtle rounded-100 shadow-2 overflow-hidden border">
                  <button
                    onClick={() => setSortMode('latest')}
                    className={cn(
                      'hover:bg-fill-neutral-subtle-hover font-designer-14r w-full px-200 py-150 text-left transition-colors',
                      sortMode === 'latest' && 'bg-fill-neutral-subtle-default',
                    )}
                  >
                    최신순
                  </button>
                  <button
                    onClick={() => setSortMode('popular')}
                    className={cn(
                      'hover:bg-fill-neutral-subtle-hover font-designer-14r w-full px-200 py-150 text-left transition-colors',
                      sortMode === 'popular' &&
                        'bg-fill-neutral-subtle-default',
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
            className="rounded-100 bg-fill-brand-default-default font-designer-13b text-text-inverse shadow-1 hover:bg-fill-brand-default-hover hover:shadow-2 flex items-center gap-100 px-400 py-200 transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            주제 생성
          </button>
        </div>

        {/* 투표 목록 */}
        {votings.length === 0 ? (
          <div className="rounded-200 border-border-subtle bg-background-default flex flex-col items-center justify-center gap-300 border py-1200">
            <Vote className="text-text-subtlest h-12 w-12 opacity-30" />
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
                <VotingCard
                  key={voting.id}
                  voting={voting}
                  onClick={() => handleVotingClick(voting.id)}
                />
              ))}
            </div>

            {/* 무한 스크롤 트리거 */}
            <div ref={observerTarget} className="py-400 text-center">
              {isFetchingNextPage && (
                <div className="flex items-center justify-center gap-200">
                  <Loader2 className="text-text-brand h-5 w-5 animate-spin" />
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
