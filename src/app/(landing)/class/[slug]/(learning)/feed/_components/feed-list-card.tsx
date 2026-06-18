import Image from 'next/image';
import Link from 'next/link';
import {
  formatRelativeTime,
  ROLE_LABELS,
} from '@/components/class/builder-feed-helpers';
import { AuthorAvatar, RoleBadge } from '@/components/class/builder-feed-utils';
import {
  FeedCommentIcon,
  FeedHeartIcon,
  FeedShareIcon,
} from '@/components/common/ui/icons/course-icons';
import type { BuilderFeedListItemResponse } from '@/types/api/course.types';

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .trim();
}

export function FeedListCard({
  feed,
  slug,
}: {
  feed: BuilderFeedListItemResponse;
  slug: string;
}) {
  return (
    <Link
      href={`/class/${slug}/feed/${feed.feedId}`}
      className="flex flex-col overflow-hidden rounded-150 border border-border-subtle"
    >
      {/* Profile + time */}
      <div className="flex items-center justify-between p-250">
        <div className="flex items-center gap-125">
          <AuthorAvatar nickname={feed.author.nickname} className="size-400" />
          <div className="flex flex-col items-start justify-center">
            <div className="flex items-center gap-50">
              <p className="font-designer-14m text-gray-800">
                {feed.author.nickname}
              </p>
              <RoleBadge variant={feed.author.role} />
            </div>
            <p className="font-designer-12r text-gray-400">
              {ROLE_LABELS[feed.author.role] ?? feed.author.role}
            </p>
          </div>
        </div>
        <p className="font-designer-14r text-gray-400">
          {formatRelativeTime(feed.createdAt)}
        </p>
      </div>

      {/* Thumbnail image */}
      <div className="relative aspect-square w-full bg-gray-200">
        {feed.thumbnailUrl && (
          <Image
            src={feed.thumbnailUrl}
            alt=""
            fill
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
        )}
      </div>

      {/* Actions + caption */}
      <div className="px-250 pb-250 pt-300">
        <div className="flex items-center gap-200">
          <span className="flex items-center gap-50 font-designer-16r text-gray-800">
            <FeedHeartIcon className="size-300 shrink-0 text-background-brand-default" />
            {feed.likeCount}
          </span>
          <span className="flex items-center gap-50 font-designer-16r text-gray-800">
            <FeedCommentIcon className="size-300 shrink-0" />
            {feed.commentCount}
          </span>
          <FeedShareIcon className="size-300 shrink-0" />
        </div>
        <p className="mt-125 line-clamp-2 font-designer-14r text-gray-800">
          {stripHtml(feed.content)}
        </p>
      </div>
    </Link>
  );
}
