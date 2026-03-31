'use client';

import { LayoutGrid, List, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Avatar from '@/components/common/ui/avatar';
import Pagination from '@/components/common/ui/pagination';
import { getCommunityPostPreviewText } from '@/features/community/model/community-rich-content';
import { buildCommunityPostHref } from '@/features/community/model/community-route';
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
import CommunityAuthorNameTrigger from './community-author-name-trigger';
import {
  CommunityBoardBadge,
  CommunityMemberRoleBadge,
} from './community-meta-badge';
import CommunityPostCard from './community-post-card';
import CommunityPostListItem from './community-post-list-item';
import CommunityPostOwnerActions from './community-post-owner-actions';
import CommunityPostStats from './community-post-stats';
import CommunityQnaQuestionCard from './community-qna-question-card';
import CommunityQnaQuestionListItem from './community-qna-question-list-item';
import CommunitySectionShell from './community-section-shell';

const VIEW_ICON = {
  [COMMUNITY_FEED_VIEW.CARD]: LayoutGrid,
  [COMMUNITY_FEED_VIEW.LIST]: List,
} as const;

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

function FeaturedCommunityPostItem({
  currentPage,
  post,
  rank,
}: {
  currentPage: number;
  post: CommunityPost;
  rank: number;
}) {
  const previewText = getCommunityPostPreviewText(post);
  const detailHref = buildCommunityPostHref(post.id, currentPage);

  return (
    <article className="rounded-200 border border-border-subtle bg-background-default transition-colors hover:border-border-brand">
      <div className="flex flex-col gap-200 p-250">
        <div className="flex flex-col gap-150 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-150">
            <div className="flex h-400 w-400 shrink-0 items-center justify-center rounded-full bg-fill-brand-default-default font-designer-16b text-text-inverse">
              {rank}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-100">
                <span className="inline-flex items-center gap-50 rounded-full bg-fill-brand-subtle-default px-100 py-50 font-designer-12b text-text-brand">
                  <TrendingUp className="h-14 w-14" />
                  인기
                </span>
                <CommunityBoardBadge board={post.board} showIcon={false} />
                <CommunityMemberRoleBadge role={post.role} />
              </div>

              <Link
                href={detailHref}
                aria-label={`${post.title} 상세 보기`}
                className="mt-100 block rounded-150 transition-opacity hover:opacity-80"
                suppressHydrationWarning={true}
              >
                <p className="line-clamp-2 font-designer-20b text-text-strong">
                  {post.title}
                  <span className="ml-50 font-designer-16m text-text-brand">
                    ({post.commentCount})
                  </span>
                </p>
              </Link>
            </div>
          </div>

          <div className="flex shrink-0 items-start gap-100">
            <CommunityPostStats
              viewCount={post.viewCount}
              reactionCount={post.reactionCount}
              className="sm:justify-end"
            />
            <CommunityPostOwnerActions currentPage={currentPage} post={post} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-100">
          <span className="flex items-center gap-75">
            <Avatar image={post.authorImage} alt={post.authorName} size={20} />
            <CommunityAuthorNameTrigger
              memberId={post.authorMemberId}
              name={post.authorName}
              className="font-designer-13r text-text-default"
            />
          </span>
          <span className="font-designer-13r text-text-subtlest">|</span>
          <span className="font-designer-13r text-text-subtlest">
            {post.createdAt}
          </span>
        </div>

        {previewText ? (
          <Link
            href={detailHref}
            aria-label={`${post.title} 상세 보기`}
            className="block rounded-150 transition-opacity hover:opacity-80"
            suppressHydrationWarning={true}
          >
            <p className="line-clamp-2 font-designer-14r text-text-subtle">
              {previewText}
            </p>
          </Link>
        ) : null}
      </div>
    </article>
  );
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
  const shouldShowFeaturedPosts =
    !isQnaFilter &&
    activeFilter === COMMUNITY_FEED_FILTER.ALL &&
    currentPage === 1 &&
    featuredPosts.length > 0;
  const sectionTitle = isQnaFilter ? '질문' : '게시글';
  const emptyMessage = isQnaFilter
    ? '아직 등록된 질문이 없습니다.'
    : '아직 등록된 커뮤니티 글이 없습니다.';
  const loadingMessage = isQnaFilter
    ? '질문을 불러오는 중입니다.'
    : '게시글을 불러오는 중입니다.';

  return (
    <CommunitySectionShell id="community-feed" className="gap-300">
      <div className="flex flex-col gap-200 border-b border-border-subtle pb-200">
        <div className="flex flex-col gap-150 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-150">
            <p className="font-designer-24b text-text-strong">{sectionTitle}</p>
            <p className="font-designer-13r text-text-subtle">
              {isLoading ? '불러오는 중' : `${postCount}개`}
            </p>
          </div>

          <div className="flex w-fit items-center gap-50 rounded-150 border border-border-subtle bg-background-default p-50">
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
                  <Icon className="h-16 w-16" />
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
        <section className="overflow-hidden rounded-300 border border-border-brand bg-background-default shadow-1">
          <div className="bg-fill-brand-subtle-default px-300 py-250">
            <div className="flex flex-col gap-150 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-100">
                <span className="inline-flex w-fit items-center gap-50 rounded-full border border-border-brand bg-background-default px-150 py-50 font-designer-12b text-text-brand">
                  <TrendingUp className="h-14 w-14" />
                  커뮤니티 PICK
                </span>
                <div className="flex flex-col gap-50">
                  <p className="font-designer-24b text-text-strong">
                    이번 주 인기 글
                  </p>
                  <p className="font-designer-14r text-text-subtle">
                    이번 주 가장 많은 반응을 받은 글을 먼저 보여드려요.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-100">
                <span className="rounded-full bg-background-default px-150 py-50 font-designer-12b text-text-brand">
                  TOP {featuredPosts.length}
                </span>
                <span className="font-designer-13r text-text-subtle">
                  전체 탭에서만 보여요
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-150 p-200">
            {featuredPosts.map((post, index) => (
              <FeaturedCommunityPostItem
                key={post.id}
                currentPage={currentPage}
                post={post}
                rank={index + 1}
              />
            ))}
          </div>
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
          <div className="flex flex-col">
            {qnaQuestions.map((question) => (
              <CommunityQnaQuestionListItem
                key={question.id}
                currentPage={currentPage}
                question={question}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col">
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
