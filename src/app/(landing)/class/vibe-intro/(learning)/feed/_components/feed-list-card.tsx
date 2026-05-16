import Image from 'next/image';
import Link from 'next/link';
import {
  AuthorAvatar,
  ROLE_LABELS,
  RoleBadge,
  formatRelativeTime,
} from '@/app/(landing)/class/vibe-intro/_components/builder-feed-utils';
import type { BuilderFeedListItemResponse } from '@/types/api/course.types';

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .trim();
}

export function FeedListCard({ feed }: { feed: BuilderFeedListItemResponse }) {
  return (
    <Link
      href={`/class/vibe-intro/feed/${feed.feedId}`}
      className="flex flex-col overflow-hidden rounded-150 border border-border-subtle"
    >
      {/* Profile + time */}
      <div className="flex items-center justify-between px-250 py-250">
        <div className="flex items-center gap-125">
          <AuthorAvatar
            nickname={feed.author.nickname}
            className="h-400 w-400"
          />
          <div className="flex flex-col items-start justify-center">
            <div className="flex items-center gap-50">
              <p className="font-designer-14m text-gray-800">
                {feed.author.nickname}
              </p>
              <RoleBadge role={feed.author.role} />
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
            className="object-cover"
          />
        )}
      </div>

      {/* Actions + caption */}
      <div className="px-250 pb-250 pt-300">
        <div className="flex items-center gap-200">
          {/* Like */}
          <span className="flex items-center gap-50 font-designer-16r text-gray-800">
            <svg
              viewBox="0 0 24 24"
              className="h-300 w-300 shrink-0 text-background-brand-default"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M16.5004 2.82495C14.7604 2.82495 13.0904 3.63495 12.0004 4.91495C10.9104 3.63495 9.24039 2.82495 7.50039 2.82495C4.42039 2.82495 2.00039 5.24495 2.00039 8.32495C2.00039 12.105 5.40039 15.185 10.5504 19.865L12.0004 21.175L13.4504 19.855C18.6004 15.185 22.0004 12.105 22.0004 8.32495C22.0004 5.24495 19.5804 2.82495 16.5004 2.82495ZM12.1004 18.375L12.0004 18.475L11.9004 18.375C7.14039 14.065 4.00039 11.215 4.00039 8.32495C4.00039 6.32495 5.50039 4.82495 7.50039 4.82495C9.04039 4.82495 10.5404 5.81495 11.0704 7.18495H12.9404C13.4604 5.81495 14.9604 4.82495 16.5004 4.82495C18.5004 4.82495 20.0004 6.32495 20.0004 8.32495C20.0004 11.215 16.8604 14.065 12.1004 18.375Z" />
            </svg>
            {feed.likeCount}
          </span>

          {/* Comment */}
          <span className="flex items-center gap-50 font-designer-16r text-gray-800">
            <svg
              viewBox="0 0 20 20"
              className="h-300 w-300 shrink-0"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M18 0H2C0.9 0 0 0.9 0 2V20L4 16H18C19.1 16 20 15.1 20 14V2C20 0.9 19.1 0 18 0ZM18 14H4L2 16V2H18V14ZM5 7H7V9H5V7ZM9 7H11V9H9V7ZM13 7H15V9H13V7Z" />
            </svg>
            {feed.commentCount}
          </span>

          {/* Share — reply arrow rotated 180° + flipped y = forward/share direction */}
          <svg
            viewBox="0 0 18 15"
            className="h-300 w-300 shrink-0 -scale-y-100 rotate-180"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M7 4V0L0 7L7 14V9.9C12 9.9 15.5 11.5 18 15C17 10 14 5 7 4Z" />
          </svg>
        </div>
        <p className="mt-125 line-clamp-2 font-designer-14r text-gray-800">
          {stripHtml(feed.content)}
        </p>
      </div>
    </Link>
  );
}
