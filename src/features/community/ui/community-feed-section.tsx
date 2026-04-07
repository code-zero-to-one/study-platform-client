'use client';

import { LayoutGrid, List, TrendingUp } from 'lucide-react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Pagination from '@/components/common/ui/pagination';
import type {
  CommunityFeedFilter,
  CommunityFeedFilterOption,
  CommunityFeedViewOption,
  CommunityPost,
} from '@/types/community/domain';
import {
  COMMUNITY_FEED_FILTER,
  COMMUNITY_FEED_VIEW,
  type CommunityFeedView,
} from '@/types/community/domain';
import type { CommunityQnaQuestionSummary } from '@/types/community/qna-domain';
import CommunityPostCard from './community-post-card';
import CommunityPostListItem from './community-post-list-item';
import CommunityQnaQuestionCard from './community-qna-question-card';
import CommunityQnaQuestionListItem from './community-qna-question-list-item';
import CommunitySectionShell from './community-section-shell';

const VIEW_ICON = {
  [COMMUNITY_FEED_VIEW.CARD]: LayoutGrid,
  [COMMUNITY_FEED_VIEW.LIST]: List,
} as const;

const FEATURED_POST_LIMIT = 4;

interface CommunityFeedSectionProps {
  activeFilter: CommunityFeedFilter;
  activeView: CommunityFeedView;
  currentPage: number;
  errorMessage?: string;
  featuredPosts: readonly CommunityPost[];
  filterOptions: readonly CommunityFeedFilterOption[];
  isLoading?: boolean;
  isQnaFilter?: boolean;
  postCount: number;
  posts: readonly CommunityPost[];
  qnaQuestions: readonly CommunityQnaQuestionSummary[];
  showPagination: boolean;
  totalPages: number;
  viewOptions: readonly CommunityFeedViewOption[];
  onFilterChange: (nextFilter: CommunityFeedFilter) => void;
  onPageChange: (page: number) => void;
  onViewChange: (nextView: CommunityFeedView) => void;
}

export default function CommunityFeedSection({
  activeFilter,
  activeView,
  currentPage,
  errorMessage,
  featuredPosts,
  filterOptions,
  isLoading = false,
  isQnaFilter = false,
  postCount,
  posts,
  qnaQuestions,
  showPagination,
  totalPages,
  viewOptions,
  onFilterChange,
  onPageChange,
  onViewChange,
}: CommunityFeedSectionProps) {
  const featuredTopPosts = featuredPosts.slice(0, FEATURED_POST_LIMIT);
  const shouldShowFeaturedPosts =
    !isQnaFilter &&
    activeFilter === COMMUNITY_FEED_FILTER.ALL &&
    currentPage === 1 &&
    featuredTopPosts.length > 0;
  const sectionTitle = isQnaFilter ? '질문' : '게시글';
  const emptyMessage = isQnaFilter
    ? '아직 등록된 질문이 없습니다.'
    : '아직 등록된 커뮤니티 글이 없습니다.';
  const loadingMessage = isQnaFilter
    ? '질문을 불러오는 중입니다.'
    : '게시글을 불러오는 중입니다.';

  return (
    <CommunitySectionShell id="community-feed" className="gap-300">
      <div className="flex flex-col gap-200 pb-150">
        <div className="flex flex-col gap-150 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-150">
            <p className="font-designer-24b text-text-strong">{sectionTitle}</p>
            <p className="font-designer-13r text-text-subtle">
              {isLoading ? '불러오는 중' : `${postCount}개`}
            </p>
          </div>

          <div className="flex w-fit items-center gap-50 rounded-150 border border-border-default bg-background-default p-50">
            {viewOptions.map((option) => {
              const isActive = option.id === activeView;
              const Icon = VIEW_ICON[option.id];

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onViewChange(option.id)}
                  aria-pressed={isActive}
                  className={cn(
                    'flex h-400 items-center gap-75 rounded-100 px-150 transition-colors',
                    isActive
                      ? 'bg-fill-brand-subtle-default font-designer-14b text-text-strong'
                      : 'font-designer-14m text-text-subtle hover:text-text-default',
                  )}
                >
                  <Icon className="h-200 w-200" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-250 overflow-x-auto pb-50">
          {filterOptions.map((filter) => {
            const isActive = filter.id === activeFilter;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onFilterChange(filter.id)}
                className={cn(
                  'border-b-2 pb-100 whitespace-nowrap transition-colors',
                  isActive
                    ? 'border-border-brand font-designer-14b text-text-strong'
                    : 'border-transparent font-designer-14m text-text-subtle hover:text-text-default',
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {shouldShowFeaturedPosts ? (
        <section className="flex flex-col gap-150">
          <div className="flex flex-col gap-125 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-100">
              <span className="inline-flex items-center gap-50 rounded-full border border-border-brand bg-background-default px-150 py-50 font-designer-12b text-text-brand">
                <TrendingUp className="h-200 w-200" />
                이번 주 인기 글
              </span>
            </div>

            <span className="w-fit font-designer-13b text-text-brand">
              TOP {featuredTopPosts.length}
            </span>
          </div>

          {activeView === COMMUNITY_FEED_VIEW.CARD ? (
            <div className="grid gap-250 md:grid-cols-2">
              {featuredTopPosts.map((post, index) => (
                <CommunityPostCard
                  key={post.id}
                  currentPage={currentPage}
                  featuredLabel={`TOP ${index + 1}`}
                  post={post}
                  showBoardBadge={false}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-150">
              {featuredTopPosts.map((post, index) => (
                <CommunityPostListItem
                  key={post.id}
                  currentPage={currentPage}
                  featuredFrame={true}
                  featuredLabel={`TOP ${index + 1}`}
                  post={post}
                  showBoardBadge={false}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {activeView === COMMUNITY_FEED_VIEW.LIST ? (
        errorMessage ? (
          <p className="py-300 font-designer-14r text-text-error">
            {errorMessage}
          </p>
        ) : isLoading ? (
          <p className="py-300 font-designer-14r text-text-subtle">
            {loadingMessage}
          </p>
        ) : posts.length === 0 &&
          qnaQuestions.length === 0 &&
          featuredPosts.length === 0 ? (
          <p className="py-300 font-designer-14r text-text-subtle">
            {emptyMessage}
          </p>
        ) : isQnaFilter ? (
          <div className="flex flex-col gap-150">
            {qnaQuestions.map((question) => (
              <CommunityQnaQuestionListItem
                key={question.id}
                currentPage={currentPage}
                question={question}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-150">
            {posts.map((post) => (
              <CommunityPostListItem
                key={post.id}
                currentPage={currentPage}
                post={post}
              />
            ))}
          </div>
        )
      ) : errorMessage ? (
        <p className="py-300 font-designer-14r text-text-error">
          {errorMessage}
        </p>
      ) : isLoading ? (
        <p className="py-300 font-designer-14r text-text-subtle">
          {loadingMessage}
        </p>
      ) : posts.length === 0 &&
        qnaQuestions.length === 0 &&
        featuredPosts.length === 0 ? (
        <p className="py-300 font-designer-14r text-text-subtle">
          {emptyMessage}
        </p>
      ) : isQnaFilter ? (
        <div className="grid gap-250 md:grid-cols-2">
          {qnaQuestions.map((question) => (
            <CommunityQnaQuestionCard
              key={question.id}
              currentPage={currentPage}
              question={question}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-250 md:grid-cols-2">
          {posts.map((post) => (
            <CommunityPostCard
              key={post.id}
              currentPage={currentPage}
              post={post}
            />
          ))}
        </div>
      )}

      {showPagination ? (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onChangePage={onPageChange}
        />
      ) : null}
    </CommunitySectionShell>
  );
}
