'use client';

import Image from 'next/image';
import Link from 'next/link';
import Avatar from '@/components/common/ui/avatar';
import { getCommunityPostPreviewText } from '@/features/community/model/community-rich-content';
import type { CommunityPost } from '@/types/community/domain';
import {
  CommunityBoardBadge,
  CommunityMemberRoleBadge,
} from './community-meta-badge';
import CommunityPostStats from './community-post-stats';

interface CommunityPostCardProps {
  post: CommunityPost;
}

export default function CommunityPostCard({ post }: CommunityPostCardProps) {
  const previewText = getCommunityPostPreviewText(post);

  return (
    <article className="flex h-full flex-col rounded-200 border border-border-subtle bg-background-default p-250">
      <Link
        href={`/community/${post.id}`}
        aria-label={`${post.title} 상세 보기`}
        className="block rounded-150 transition-opacity hover:opacity-80"
        suppressHydrationWarning={true}
      >
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
                <span className="font-designer-13r text-text-default">
                  {post.authorName}
                </span>
              </span>
              <CommunityMemberRoleBadge role={post.role} />
              <span className="font-designer-13r text-text-subtlest">
                {post.createdAt}
              </span>
            </div>

            <p className="mt-150 line-clamp-2 font-designer-20b text-text-strong">
              {post.title}
              <span className="ml-50 font-designer-16m text-text-brand">
                ({post.commentCount})
              </span>
            </p>
          </div>

          <CommunityPostStats
            viewCount={post.viewCount}
            reactionCount={post.reactionCount}
            className="shrink-0"
          />
        </div>

        {previewText ? (
          <p className="mt-150 line-clamp-2 font-designer-14r leading-250 text-text-subtle">
            {previewText}
          </p>
        ) : null}

        {post.previewImage ? (
          <div className="mt-200 overflow-hidden rounded-150 border border-border-subtle bg-background-alternative">
            <Image
              src={post.previewImage}
              alt={post.previewImageAlt ?? post.title}
              width={1200}
              height={800}
              className="h-auto w-full"
              unoptimized
            />
          </div>
        ) : null}
      </Link>
    </article>
  );
}
