'use client';

import { Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { getCommunityPostPreviewText } from '@/features/community/model/community-rich-content';
import { buildCommunityPostHref } from '@/features/community/model/community-route';
import type { CommunityPost } from '@/types/community/domain';
import { isCommunityCardNestedInteraction } from './community-card-navigation';
import CommunityFeedAuthorMeta from './community-feed-author-meta';
import CommunityFeedListItemShell from './community-feed-list-item-shell';
import {
  CommunityBoardBadge,
  CommunityFeaturedRankBadge,
  getCommunityBoardMeta,
} from './community-meta-badge';
import CommunityPostOwnerActions from './community-post-owner-actions';
import CommunityPostStats from './community-post-stats';

interface CommunityPostListItemProps {
  currentPage?: number;
  featuredFrame?: boolean;
  featuredLabel?: string;
  post: CommunityPost;
  showBoardBadge?: boolean;
}

export default function CommunityPostListItem({
  currentPage,
  featuredFrame = false,
  featuredLabel,
  post,
  showBoardBadge = true,
}: CommunityPostListItemProps) {
  const router = useRouter();
  const boardMeta = getCommunityBoardMeta(post.board);
  const BoardIcon = boardMeta.icon;
  const PlaceholderIcon = featuredFrame ? Trophy : BoardIcon;
  const previewText = getCommunityPostPreviewText(post);
  const detailHref = buildCommunityPostHref(post.id, currentPage);
  const mediaBadge =
    featuredLabel || showBoardBadge ? (
      <>
        {featuredLabel ? (
          <CommunityFeaturedRankBadge label={featuredLabel} compact={true} />
        ) : null}
        {showBoardBadge ? (
          <CommunityBoardBadge board={post.board} showIcon={false} />
        ) : null}
      </>
    ) : undefined;

  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    if (isCommunityCardNestedInteraction(event.target)) {
      return;
    }

    router.push(detailHref);
  };

  return (
    <CommunityFeedListItemShell
      className={cn(
        featuredFrame
          ? 'border-border-brand shadow-1 transition-colors'
          : 'transition-colors hover:border-border-brand',
      )}
      content={
        <Link
          href={detailHref}
          aria-label={`${post.title} 상세 보기`}
          className={cn(
            'mt-100 block rounded-150 transition-opacity sm:mt-75',
            featuredFrame ? 'hover:opacity-90' : 'hover:opacity-80',
          )}
          suppressHydrationWarning={true}
        >
          <p className="truncate font-designer-18b text-text-strong">
            {post.title}
            <span className="ml-50 font-designer-16m text-text-brand">
              ({post.commentCount})
            </span>
          </p>

          {previewText ? (
            <p className="mt-75 line-clamp-2 font-designer-14r leading-250 text-text-subtle">
              {previewText}
            </p>
          ) : null}
        </Link>
      }
      media={
        <Link
          href={detailHref}
          aria-label={`${post.title} 상세 보기`}
          className="block rounded-150 transition-opacity hover:opacity-80"
          suppressHydrationWarning={true}
        >
          {post.previewImage ? (
            <div className="overflow-hidden rounded-150 border border-border-default bg-background-default">
              <Image
                src={post.previewImage}
                alt={post.previewImageAlt ?? post.title}
                width={48}
                height={48}
                className="h-600 w-600 object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-600 w-600 items-center justify-center rounded-150 border border-border-default bg-background-default">
              <PlaceholderIcon
                className={cn(
                  'h-225 w-225',
                  featuredFrame ? 'text-text-brand' : 'text-text-subtle',
                )}
              />
            </div>
          )}
        </Link>
      }
      mediaBadge={mediaBadge}
      meta={
        <CommunityFeedAuthorMeta
          authorImage={post.authorImage ?? undefined}
          authorName={post.authorName}
          createdAt={post.createdAt}
          memberId={post.authorMemberId}
          role={post.role}
        />
      }
      onClick={handleCardClick}
      stats={
        <CommunityPostStats
          viewCount={post.viewCount}
          reactionCount={post.reactionCount}
          className="sm:justify-end"
        />
      }
      actions={
        <CommunityPostOwnerActions currentPage={currentPage} post={post} />
      }
    />
  );
}
