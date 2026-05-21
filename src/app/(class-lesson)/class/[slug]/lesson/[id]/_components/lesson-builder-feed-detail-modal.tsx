'use client';

import { Heart, Link as LinkIcon, MessageCircle, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const UserProfileModal = dynamic(
  () => import('@/components/common/modals/user-profile-modal'),
  { ssr: false },
);
import MarkdownContentCore from '@/components/common/ui/rich-text/markdown-content-core';
import {
  AuthorAvatar,
  formatRelativeTime,
  ROLE_LABELS,
  RoleBadge,
} from '@/components/pages/class/utils/builder-feed-utils';
import { useGetBuilderFeedDetail } from '@/hooks/queries/course/course-api';

interface Props {
  feedId: number | null;
  onClose: () => void;
}

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
}

export function LessonBuilderFeedDetailModal({ feedId, onClose }: Props) {
  const { data: feed, isLoading } = useGetBuilderFeedDetail(feedId ?? 0);

  if (feedId === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-1000/40" onClick={onClose} />
      <div className="relative z-10 mx-400 flex max-h-modal w-full max-w-10000 flex-col rounded-200 bg-background-default shadow-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-400 py-300">
          <p className="font-designer-16b text-gray-800">빌더 피드</p>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800"
          >
            <X className="h-300 w-300" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-400 py-350">
          {isLoading ? (
            <div className="flex h-2500 items-center justify-center">
              <p className="font-designer-16r text-gray-400">불러오는 중...</p>
            </div>
          ) : !feed ? (
            <div className="flex h-2500 items-center justify-center">
              <p className="font-designer-16r text-gray-400">
                피드를 불러올 수 없어요.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-300">
              {/* Author row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-150">
                  <UserProfileModal
                    memberId={feed.author.memberId}
                    trigger={
                      <button
                        type="button"
                        className="cursor-pointer"
                        aria-label={`${feed.author.nickname} 프로필 보기`}
                      >
                        <AuthorAvatar nickname={feed.author.nickname} />
                      </button>
                    }
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-50">
                      <p className="font-designer-14b text-gray-800">
                        {feed.author.nickname}
                      </p>
                      <RoleBadge role={feed.author.role} />
                    </div>
                    {ROLE_LABELS[feed.author.role] && (
                      <p className="font-designer-12m text-gray-400">
                        {ROLE_LABELS[feed.author.role]}
                      </p>
                    )}
                  </div>
                </div>
                <p className="font-designer-13m text-gray-400">
                  {formatRelativeTime(feed.createdAt)}
                </p>
              </div>

              {/* Artifact — retrospective screenshot or link */}
              {feed.artifactUrl &&
                (isImageUrl(feed.artifactUrl) ? (
                  <div className="relative aspect-video overflow-hidden rounded-100 bg-gray-200">
                    <Image
                      src={feed.artifactUrl}
                      alt="제출 스크린샷"
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <a
                    href={feed.artifactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-100 break-all font-designer-14m text-background-brand-default hover:underline"
                  >
                    <LinkIcon className="h-200 w-200 shrink-0" />
                    {feed.artifactUrl}
                  </a>
                ))}

              {/* Content */}
              <MarkdownContentCore content={feed.content} />

              {/* Images */}
              {feed.imageUrls.length > 0 && (
                <div className="flex flex-wrap gap-200">
                  {feed.imageUrls.map((url, i) => (
                    <Image
                      key={i}
                      src={url}
                      alt={`피드 이미지 ${i + 1}`}
                      width={400}
                      height={300}
                      unoptimized
                      className="max-h-[300px] rounded-100 object-cover"
                    />
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-200 border-t border-border-subtle pt-250">
                <div className="flex items-center gap-50">
                  <Heart className="h-250 w-250 text-gray-800" />
                  <p className="font-designer-14r text-gray-800">
                    {feed.likeCount}
                  </p>
                </div>
                <div className="flex items-center gap-50">
                  <MessageCircle className="h-250 w-250 text-gray-800" />
                  <p className="font-designer-14r text-gray-800">
                    {feed.commentCount}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
