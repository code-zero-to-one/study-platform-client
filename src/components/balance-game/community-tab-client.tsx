'use client';

import { Loader2, Vote, SearchX, Plus, MessageSquareText } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useMemo } from 'react';
import VotingCard from '@/components/card/voting-card';
import SectionHeader from '@/components/common/ui/section-header';
import SectionShell from '@/components/common/ui/section-shell';
import Toast from '@/components/common/ui/toast';
import VotingCreateModal from '@/components/voting/voting-create-modal';
import VotingDetailView from '@/components/voting/voting-detail-view';
import { BALANCE_GAME_TAG_MIN_QUERY_LEN } from '@/config/balance-game-tags';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useBalanceGameFilters } from '@/hooks/common/use-balance-game-filters';
import { useInfiniteScroll } from '@/hooks/common/use-infinite-scroll';
import { useCreateBalanceGameMutation } from '@/hooks/queries/use-balance-game-mutation';
import {
  useBalanceGameListQuery,
  useBalanceGameTagSuggestionsQuery,
} from '@/hooks/queries/use-balance-game-query';
import { useDebounce } from '@/hooks/use-debounce';
import {
  useScrollToHomeContentOnChange,
  useScrollToHomeContentWithStabilize,
} from '@/hooks/use-scroll-to-home-content';
import type {
  BalanceGameListResponse,
  CreateBalanceGameRequest,
} from '@/types/balance-game';
import { VotingCreateFormData } from '@/types/schemas/zod-schema';
import { decodeVotingId, encodeVotingId } from '@/utils/voting-id';
import BalanceGameFiltersBar from './balance-game-filters-bar';

interface CommunityTabClientProps {
  initialList?: BalanceGameListResponse;
}

export default function CommunityTabClient({
  initialList,
}: CommunityTabClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollToHomeContent = useScrollToHomeContentWithStabilize();
  const { isAuthReady } = useAuthReady();
  // 상태 관리
  const {
    statusFilter,
    sortMode,
    selectedTags,
    setStatus,
    setSort,
    addTag,
    removeTag,
  } = useBalanceGameFilters({
    onChange: () => requestAnimationFrame(scrollToHomeContent),
  });
  const [tagFilterInput, setTagFilterInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const debouncedTagQuery = useDebounce(tagFilterInput, 300);
  const debouncedSearchTerm = useDebounce(searchTerm, 200);
  useScrollToHomeContentOnChange([statusFilter, sortMode], {
    stabilize: true,
  });

  // React Query Hooks
  const shouldUseInitialList =
    sortMode === 'latest' &&
    statusFilter === 'active' &&
    selectedTags.length === 0 &&
    debouncedSearchTerm.trim().length === 0;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    isPending,
  } = useBalanceGameListQuery(
    sortMode,
    statusFilter === 'all' ? undefined : statusFilter,
    selectedTags.length ? selectedTags : undefined,
    debouncedSearchTerm.trim() || undefined,
    {
      initialPage: shouldUseInitialList ? initialList : undefined,
    },
  );

  const createMutation = useCreateBalanceGameMutation();
  const trimmedTagQuery = debouncedTagQuery.trim();
  const { data: tagSuggestions = [], isFetching: isTagLoading } =
    useBalanceGameTagSuggestionsQuery(trimmedTagQuery, {
      size: 10,
      enabled: trimmedTagQuery.length >= BALANCE_GAME_TAG_MIN_QUERY_LEN,
      minLength: BALANCE_GAME_TAG_MIN_QUERY_LEN,
      sort: 'popular',
    });

  const observerTarget = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
  });

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

  // 상세 화면으로 전환
  const selectedVotingId = useMemo(() => {
    const votingIdParam = searchParams.get('votingId');
    if (!votingIdParam) return null;

    const parsedId = Number(votingIdParam);
    if (Number.isFinite(parsedId) && parsedId > 0) {
      return parsedId;
    }

    return decodeVotingId(votingIdParam);
  }, [searchParams]);

  const handleVotingClick = (votingId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'community');
    params.set('votingId', encodeVotingId(votingId));
    router.push(`/home?${params.toString()}`);
  };

  const handleAddTag = (value: string) => {
    addTag(value);
    setTagFilterInput('');
  };

  const handleRemoveTagFilter = (tag: string) => {
    removeTag(tag);
  };

  const handleTagClick = (tag: string) => {
    handleAddTag(tag);
  };

  // 목록으로 돌아가기
  const handleBackToList = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('votingId');
    params.set('tab', 'community');
    router.push(`/home?${params.toString()}`, { scroll: false });
    requestAnimationFrame(scrollToHomeContent);
  };

  // 상세 화면이 열려있으면 상세 화면 표시
  if (selectedVotingId !== null) {
    return (
      <CommunityDetailView
        votingId={selectedVotingId}
        onBack={handleBackToList}
        onScrollToAnchor={scrollToHomeContent}
      />
    );
  }

  // 로딩 상태 (첫 로드만)
  if (isPending && !data) {
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
  const visibleVotings = votings;

  return (
    <>
      <SectionShell className="transition-all duration-300">
        {/* Header */}
        <SectionHeader
          title="밸런스게임"
          icon={<MessageSquareText className="text-text-brand h-8 w-8" />}
          description="다양한 주제에 투표하고 댓글로 자유롭게 토론할 수 있습니다."
          descriptionClassName="font-designer-15r"
        />

        <BalanceGameFiltersBar
          statusFilter={statusFilter}
          onStatusChange={setStatus}
          sortMode={sortMode}
          onSortChange={setSort}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          tagValue={tagFilterInput}
          onTagValueChange={setTagFilterInput}
          onAddTag={handleAddTag}
          selectedTags={selectedTags}
          onRemoveTag={handleRemoveTagFilter}
          tagSuggestions={tagSuggestions}
          isTagLoading={isTagLoading}
          sortVariant="dropdown"
          rightSlot={
            isAuthReady ? (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="rounded-100 bg-fill-brand-default-default font-designer-13b text-text-inverse shadow-1 hover:bg-fill-brand-default-hover hover:shadow-2 flex items-center gap-100 px-400 py-200 transition-all hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                주제 생성
              </button>
            ) : null
          }
        />

        {/* 투표 목록 */}
        {visibleVotings.length === 0 ? (
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
              {visibleVotings.map((voting, index) => (
                <VotingCard
                  key={`${voting.id}-${index}`}
                  voting={voting}
                  onClick={() => handleVotingClick(voting.id)}
                  onTagClick={handleTagClick}
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
              {!hasNextPage && visibleVotings.length > 0 && (
                <p className="font-designer-13r text-text-subtlest">
                  모든 투표를 불러왔습니다
                </p>
              )}
            </div>
          </>
        )}
      </SectionShell>

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

interface CommunityDetailViewProps {
  votingId: number;
  onBack: () => void;
  onScrollToAnchor: () => void;
}

function CommunityDetailView({
  votingId,
  onBack,
  onScrollToAnchor,
}: CommunityDetailViewProps) {
  useEffect(() => {
    requestAnimationFrame(onScrollToAnchor);
  }, [onScrollToAnchor, votingId]);

  return (
    <div className="transition-all duration-300">
      <VotingDetailView votingId={votingId} onBack={onBack} />
    </div>
  );
}
