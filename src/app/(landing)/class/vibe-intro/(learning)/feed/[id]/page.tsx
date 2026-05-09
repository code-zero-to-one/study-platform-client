'use client';

import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  useCreateFeedComment,
  useGetBuilderFeedDetail,
  useGetFeedComments,
  useReportBuilderFeed,
  useToggleFeedLike,
} from '@/hooks/queries/course/course-api';
import { useToastStore } from '@/stores/use-toast-store';

export default function FeedDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const feedId = parseInt(id, 10);
  const [comment, setComment] = useState('');
  const showToast = useToastStore((s) => s.showToast);

  const { data: feed } = useGetBuilderFeedDetail(feedId);
  const { data: commentsData } = useGetFeedComments(feedId);
  const toggleLikeMutation = useToggleFeedLike();
  const createCommentMutation = useCreateFeedComment();
  const reportFeedMutation = useReportBuilderFeed();

  const liked = feed?.isLiked ?? false;
  const likeCount = feed?.likeCount ?? 0;

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('링크가 복사되었어요!');
    } catch {
      // clipboard unavailable
    }
  }

  function toggleLike() {
    toggleLikeMutation.mutate(feedId);
  }

  function handleCreateComment() {
    if (!comment.trim()) return;
    createCommentMutation.mutate(
      { feedId, request: { content: comment } },
      {
        onSuccess: () => {
          setComment('');
          showToast('댓글이 등록되었어요!');
        },
      },
    );
  }

  function handleReport() {
    const reason = window.prompt('신고 사유를 입력해주세요.');
    if (!reason?.trim()) return;
    reportFeedMutation.mutate(
      { feedId, request: { reason } },
      {
        onSuccess: () => showToast('신고가 접수되었어요.'),
        onError: () => showToast('신고 접수에 실패했어요.', 'error'),
      },
    );
  }

  return (
    <div className="w-full pb-800">
      <div className="mx-auto max-w-page px-600 pt-500">
        {/* Back link */}
        <Link
          href="/class/vibe-intro/feed"
          className="inline-flex items-center gap-125 font-designer-14m text-gray-800"
        >
          <ArrowLeft className="h-300 w-300" />
          빌더 피드 돌아가기
        </Link>

        {/* Post */}
        <div className="mt-400 flex gap-500">
          <div className="flex-1">
            {/* Author */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-150">
                <div className="h-400 w-400 rounded-full bg-gray-200" />
                <div>
                  <p className="font-designer-14b text-gray-800">
                    {feed?.author.nickname ?? '뭉다'}
                  </p>
                  <p className="font-designer-12r text-gray-400">
                    {feed?.author.role ?? '빌더'}
                  </p>
                </div>
              </div>
              <button type="button" className="text-gray-400">
                <MoreVertical className="h-300 w-300" />
              </button>
            </div>

            {/* Options: save, share, report */}
            <div className="mt-200 flex gap-200">
              <button
                type="button"
                className="rounded-50 border border-border-subtle px-150 py-50 font-designer-12r text-gray-500"
              >
                보관
              </button>
              <button
                type="button"
                onClick={() => {
                  handleShare().catch(() => {});
                }}
                className="rounded-50 border border-border-subtle px-150 py-50 font-designer-12r text-gray-500"
              >
                공유
              </button>
              <button
                type="button"
                onClick={handleReport}
                disabled={reportFeedMutation.isPending}
                className="rounded-50 border border-border-subtle px-150 py-50 font-designer-12r text-gray-500 disabled:opacity-50"
              >
                신고
              </button>
            </div>

            {/* Image */}
            <div className="mt-250 relative h-[380px] overflow-hidden rounded-150 bg-gray-300" />

            {/* Caption */}
            <p className="mt-250 whitespace-pre-line font-designer-14r text-gray-800 leading-relaxed">
              {feed?.content ?? ''}
            </p>

            {/* Actions */}
            <div className="mt-300 flex items-center gap-200">
              <button
                type="button"
                onClick={toggleLike}
                className="flex items-center gap-75"
              >
                <Heart
                  className={cn(
                    'h-300 w-300',
                    liked ? 'fill-rose-500 text-rose-500' : 'text-gray-800',
                  )}
                />
                <p className="font-designer-16r text-gray-800">{likeCount}</p>
              </button>
              <button type="button" className="flex items-center gap-75">
                <MessageCircle className="h-300 w-300 text-gray-800" />
                <p className="font-designer-16r text-gray-800">
                  {feed?.commentCount ?? 0}
                </p>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleShare().catch(() => {});
                }}
                className="flex items-center gap-75"
              >
                <Share2 className="h-300 w-300 text-gray-800" />
              </button>
            </div>

            {/* Comment input */}
            <div className="mt-300">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="댓글을 남겨주세요"
                className="h-[80px] w-full resize-none rounded-150 border border-border-default p-200 font-designer-14r text-gray-800 outline-none placeholder:text-gray-400 focus:border-border-brand"
              />
              <div className="flex justify-end">
                <p className="font-designer-12r text-gray-400">
                  {comment.length}/200
                </p>
              </div>
              <button
                type="button"
                onClick={handleCreateComment}
                disabled={!comment.trim() || createCommentMutation.isPending}
                className="mt-150 w-full rounded-100 bg-background-brand-default py-200 font-designer-16b text-text-inverse disabled:bg-gray-300"
              >
                댓글 달아주기
              </button>
            </div>

            {/* Comments */}
            <div className="mt-400 space-y-300">
              {(commentsData?.comments ?? []).map((c) => {
                const isOperator = c.author.role === '운영진';
                return (
                  <div key={c.commentId} className="space-y-200">
                    <div className="flex items-start gap-150">
                      <div className="h-350 w-350 shrink-0 rounded-full bg-gray-200" />
                      <div className="flex-1">
                        <div className="flex items-center gap-125">
                          <p
                            className={cn(
                              'font-designer-14b',
                              isOperator ? 'text-text-brand' : 'text-gray-800',
                            )}
                          >
                            {c.author.nickname}
                          </p>
                          <span
                            className={cn(
                              'rounded-50 px-75 py-25 font-designer-12r',
                              isOperator
                                ? 'bg-rose-50 text-text-brand'
                                : 'bg-gray-200 text-gray-600',
                            )}
                          >
                            {c.author.role}
                          </span>
                          <p className="font-designer-12r text-gray-400">
                            {new Date(c.createdAt).toLocaleDateString('ko-KR', {
                              month: '2-digit',
                              day: '2-digit',
                            })}
                          </p>
                        </div>
                        <p className="mt-75 font-designer-14r text-gray-800 leading-relaxed">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* More feeds */}
        <div className="mt-600">
          <p className="font-designer-18b text-gray-800">더 많은 피드</p>
          <div className="relative mt-300">
            <div className="grid grid-cols-2 gap-300">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-150 bg-gray-300"
                  style={{ height: 180 }}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="이전"
              className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border border-border-default bg-background-default p-150"
            >
              <ChevronLeft className="h-250 w-250" />
            </button>
            <button
              type="button"
              aria-label="다음"
              className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border border-border-default bg-background-default p-150"
            >
              <ChevronRight className="h-250 w-250" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
