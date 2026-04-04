'use client';

import Image from 'next/image';
import Link from 'next/link';
import Avatar from '@/components/common/ui/avatar';
import { getCommunityPostPreviewText } from '@/features/community/model/community-rich-content';
import type { CommunityPost } from '@/types/community/domain';
import CommunityAuthorNameTrigger from './community-author-name-trigger';
import {
  CommunityBoardBadge,
  CommunityMemberRoleBadge,
  getCommunityBoardMeta,
} from './community-meta-badge';
import CommunityPostStats from './community-post-stats';

interface CommunityPostListItemProps {
  post: CommunityPost;
}

export default function CommunityPostListItem({
  post,
}: CommunityPostListItemProps) {
  const boardMeta = getCommunityBoardMeta(post.board);
  const BoardIcon = boardMeta.icon;
  const previewText = getCommunityPostPreviewText(post);

  return (
    <article className="border-b border-border-subtle py-250 transition-colors last:border-b-0 last:pb-0 first:pt-0">
      <div className="flex items-start gap-200">
        <div className="shrink-0">
          <Link
            href={`/community/${post.id}`}
            aria-label={`${post.title} 상세 보기`}
            className="block rounded-150 transition-opacity hover:opacity-80"
            suppressHydrationWarning={true}
          >
            {post.previewImage ? (
              <div className="overflow-hidden rounded-150 border border-border-subtle bg-background-alternative">
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
              <div className="flex h-600 w-600 items-center justify-center rounded-150 border border-border-subtle bg-background-alternative">
                <BoardIcon className="h-18 w-18 text-text-subtle" />
              </div>
            )}
          </Link>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-150 sm:flex-row sm:items-start sm:justify-between sm:gap-250">
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
                href={`/community/${post.id}`}
                aria-label={`${post.title} 상세 보기`}
                className="mt-100 block rounded-150 transition-opacity hover:opacity-80 sm:mt-75"
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
            </div>

            <CommunityPostStats
              viewCount={post.viewCount}
              reactionCount={post.reactionCount}
              className="shrink-0 sm:justify-end"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
