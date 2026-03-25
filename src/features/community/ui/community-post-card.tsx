'use client';

import Image from 'next/image';
import Link from 'next/link';
import Avatar from '@/components/common/ui/avatar';
import { getCommunityPostPreviewText } from '@/features/community/model/community-rich-content';
import { buildCommunityPostHref } from '@/features/community/model/community-route';
import type { CommunityPost } from '@/types/community/domain';
import CommunityAuthorNameTrigger from './community-author-name-trigger';
import {
  CommunityBoardBadge,
  CommunityMemberRoleBadge,
} from './community-meta-badge';
import CommunityPostStats from './community-post-stats';

interface CommunityPostCardProps {
  currentPage?: number;
  post: CommunityPost;
}

export default function CommunityPostCard({
  currentPage,
  post,
}: CommunityPostCardProps) {
  const previewText = getCommunityPostPreviewText(post);
  const detailHref = buildCommunityPostHref(post.id, currentPage);

  return (
    <article className="flex h-full flex-col rounded-200 border border-border-subtle bg-background-default p-250">
      <div className="flex items-start justify-between gap-200">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-100">
            <CommunityBoardBadge board={post.board} showIcon={false} />
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
            aria-label={`${post.title} details`}
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

        <CommunityPostStats
          viewCount={post.viewCount}
          reactionCount={post.reactionCount}
          className="shrink-0"
        />
      </div>

      {post.previewImage ? (
        <Link
          href={detailHref}
          aria-label={`${post.title} details`}
          className="mt-200 block overflow-hidden rounded-150 border border-border-subtle bg-background-alternative transition-opacity hover:opacity-80"
          suppressHydrationWarning={true}
        >
          <Image
            src={post.previewImage}
            alt={post.previewImageAlt ?? post.title}
            width={1200}
            height={800}
            className="h-auto w-full"
            unoptimized
          />
        </Link>
      ) : null}
    </article>
  );
}
