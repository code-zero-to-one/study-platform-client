'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';
import Avatar from '@/components/common/ui/avatar';
import { buildCommunityFeedItemDetailHref } from '@/features/community/model/community-feed-item';
import { getCommunityPostPreviewText } from '@/features/community/model/community-rich-content';
import type { CommunityPost } from '@/types/community/domain';
import CommunityAuthorNameTrigger from './community-author-name-trigger';
import { isCommunityCardNestedInteraction } from './community-card-navigation';
import {
  CommunityBoardBadge,
  CommunityFeaturedRankBadge,
  CommunityMemberRoleBadge,
} from './community-meta-badge';
import CommunityPostOwnerActions from './community-post-owner-actions';
import CommunityPostStats from './community-post-stats';

interface CommunityPostCardProps {
  activeFilter?: string;
  currentPage?: number;
  featuredLabel?: string;
  post: CommunityPost;
  showBoardBadge?: boolean;
}

export default function CommunityPostCard({
  activeFilter,
  currentPage,
  featuredLabel,
  post,
  showBoardBadge = true,
}: CommunityPostCardProps) {
  const router = useRouter();
  const previewText = getCommunityPostPreviewText(post);
  const detailHref = buildCommunityFeedItemDetailHref(
    post.id,
    post.board,
    currentPage,
    activeFilter,
  );

  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    if (isCommunityCardNestedInteraction(event.target)) {
      return;
    }

    router.push(detailHref);
  };

  return (
    /* biome-ignore lint/a11y/useKeyWithClickEvents: 카드 내부에 상세 링크와 소유자 액션이 함께 있어 기존 전체 클릭 패턴을 유지한다. */
    <article
      className="flex h-full cursor-pointer flex-col rounded-200 border border-border-default bg-background-default p-250"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between gap-200">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-100">
            {featuredLabel ? (
              <CommunityFeaturedRankBadge label={featuredLabel} />
            ) : null}
            {showBoardBadge ? (
              <CommunityBoardBadge board={post.board} showIcon={false} />
            ) : null}
            <span className="flex items-center gap-75">
              <Avatar
                image={post.authorImage}
                alt={post.authorName}
                size={20}
              />
              <CommunityAuthorNameTrigger
                memberId={post.authorMemberId}
                name={post.authorName}
                className="font-designer-13r text-text-default"
              />
            </span>
            <CommunityMemberRoleBadge role={post.role} />
            <span className="font-designer-13r text-text-subtlest">
              {post.createdAt}
            </span>
          </div>

          <Link
            href={detailHref}
            aria-label={`${post.title} 상세 보기`}
            className="mt-150 block rounded-150 transition-opacity hover:opacity-80"
            suppressHydrationWarning={true}
          >
            <p className="line-clamp-2 font-designer-20b text-text-strong">
              {post.title}
              <span className="ml-50 font-designer-16m text-text-brand">
                ({post.commentCount})
              </span>
            </p>
            {previewText ? (
              <p className="mt-150 line-clamp-2 font-designer-14r leading-250 text-text-subtle">
                {previewText}
              </p>
            ) : null}
          </Link>
        </div>

        <div className="flex shrink-0 items-start gap-100">
          <CommunityPostStats
            viewCount={post.viewCount}
            reactionCount={post.reactionCount}
            className="shrink-0"
          />
          <CommunityPostOwnerActions currentPage={currentPage} post={post} />
        </div>
      </div>

      {post.previewImage ? (
        <Link
          href={detailHref}
          aria-label={`${post.title} 상세 보기`}
          className="mt-200 block overflow-hidden rounded-150 border border-border-default bg-background-alternative transition-opacity hover:opacity-80"
          suppressHydrationWarning={true}
        >
          <Image
            src={post.previewImage}
            alt={post.previewImageAlt ?? post.title}
            width={1200}
            height={800}
            sizes="(max-width: 767px) 100vw, 50vw"
            className="h-auto w-full"
          />
        </Link>
      ) : null}
    </article>
  );
}
