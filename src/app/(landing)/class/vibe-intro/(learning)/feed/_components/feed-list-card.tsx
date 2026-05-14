import { Heart, MessageSquareMore } from 'lucide-react';
import Link from 'next/link';
import type { BuilderFeedListItemResponse } from '@/types/api/course.types';
import {
  AuthorAvatar,
  formatRelativeTime,
} from '../../../_components/builder-feed-utils';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export function FeedListCard({
  feed,
  lessonLabel,
}: {
  feed: BuilderFeedListItemResponse;
  lessonLabel: string;
}) {
  return (
    <Link
      href={`/class/vibe-intro/feed/${feed.feedId}`}
      className="block border-b border-border-subtle py-300"
    >
      <p className="mb-125 font-designer-14r text-gray-500">{lessonLabel}</p>
      <p className="mb-300 line-clamp-2 font-designer-16r text-gray-800">
        {stripHtml(feed.content)}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-150">
          <span className="flex items-center gap-75 font-designer-14r text-gray-500">
            <MessageSquareMore className="h-200 w-200" /> {feed.commentCount}
          </span>
          <span className="flex items-center gap-75 font-designer-14r text-gray-500">
            <Heart className="h-200 w-200" /> {feed.likeCount}
          </span>
        </div>
        <div className="flex items-center gap-100">
          <AuthorAvatar
            nickname={feed.author.nickname}
            className="h-350 w-350"
          />
          <p className="font-designer-14m text-gray-800">
            {feed.author.nickname}
          </p>
          <p className="font-designer-14r text-gray-400">
            {formatRelativeTime(feed.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
