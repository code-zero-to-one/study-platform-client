'use client';

import { LayoutGrid, List, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Avatar from '@/components/common/ui/avatar';
import { getCommunityPostPreviewText } from '@/features/community/model/community-rich-content';
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
import CommunityAuthorNameTrigger from './community-author-name-trigger';
import {
  CommunityBoardBadge,
  CommunityMemberRoleBadge,
} from './community-meta-badge';
import CommunityPostCard from './community-post-card';
import CommunityPostListItem from './community-post-list-item';
import CommunityPostStats from './community-post-stats';
import CommunitySectionShell from './community-section-shell';

const VIEW_ICON = {
  [COMMUNITY_FEED_VIEW.CARD]: LayoutGrid,
  [COMMUNITY_FEED_VIEW.LIST]: List,
} as const;

interface CommunityFeedSectionProps {
  activeFilter: CommunityFeedFilter;
  activeView: CommunityFeedView;
  featuredPosts: readonly CommunityPost[];
  filterOptions: readonly CommunityFeedFilterOption[];
  posts: readonly CommunityPost[];
  viewOptions: readonly CommunityFeedViewOption[];
  onFilterChange: (nextFilter: CommunityFeedFilter) => void;
  onViewChange: (nextView: CommunityFeedView) => void;
}

function FeaturedCommunityPostItem({
  post,
  rank,
}: {
  post: CommunityPost;
  rank: number;
}) {
  const previewText = getCommunityPostPreviewText(post);

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
                  HOT
                </span>
                <CommunityBoardBadge board={post.board} showIcon={false} />
                <CommunityMemberRoleBadge role={post.role} />
              </div>

              <Link
                href={`/community/${post.id}`}
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

          <CommunityPostStats
            viewCount={post.viewCount}
            reactionCount={post.reactionCount}
            className="shrink-0 sm:justify-end"
          />
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
          <span className="font-designer-13r text-text-subtlest">•</span>
          <span className="font-designer-13r text-text-subtlest">
            {post.createdAt}
          </span>
        </div>

        {previewText ? (
          <Link
            href={`/community/${post.id}`}
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
  featuredPosts,
  filterOptions,
  posts,
  viewOptions,
  onFilterChange,
  onViewChange,
}: CommunityFeedSectionProps) {
  const shouldShowFeaturedPosts =
    activeFilter === COMMUNITY_FEED_FILTER.ALL && featuredPosts.length > 0;
  const postCount = shouldShowFeaturedPosts
    ? posts.length + featuredPosts.length
    : posts.length;

  return (
    <CommunitySectionShell id="community-feed" className="gap-300">
      <div className="flex flex-col gap-200 border-b border-border-subtle pb-200">
        <div className="flex flex-col gap-150 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-150">
            <p className="font-designer-24b text-text-strong">글</p>
            <p className="font-designer-13r text-text-subtle">{postCount}개</p>
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
                  COMMUNITY PICK
                </span>
                <div className="flex flex-col gap-50">
                  <p className="font-designer-24b text-text-strong">
                    이번 주 인기글
                  </p>
                  <p className="font-designer-14r text-text-subtle">
                    많이 읽히고 반응이 모인 글부터 먼저 볼 수 있게 정리했습니다.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-100">
                <span className="rounded-full bg-background-default px-150 py-50 font-designer-12b text-text-brand">
                  TOP {featuredPosts.length}
                </span>
                <span className="font-designer-13r text-text-subtle">
                  전체 탭에서만 노출
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-150 p-200">
            {featuredPosts.map((post, index) => (
              <FeaturedCommunityPostItem
                key={post.id}
                post={post}
                rank={index + 1}
              />
            ))}
          </div>
        </section>
      ) : null}

      {activeView === COMMUNITY_FEED_VIEW.LIST ? (
        <div className="flex flex-col">
          {posts.map((post) => (
            <CommunityPostListItem key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="grid gap-250 md:grid-cols-2">
          {posts.map((post) => (
            <CommunityPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </CommunitySectionShell>
  );
}
