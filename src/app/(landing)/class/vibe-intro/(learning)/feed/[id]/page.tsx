'use client';

import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  FilePen,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import MarkdownContentCore from '@/components/common/ui/rich-text/markdown-content-core';
import { useAuth } from '@/features/auth/model/use-auth';
import {
  useCreateFeedComment,
  useDeleteBuilderFeed,
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
  const router = useRouter();
  const { memberId } = useAuth();
  const showToast = useToastStore((s) => s.showToast);

  const [comment, setComment] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const { data: feed } = useGetBuilderFeedDetail(feedId);
  const { data: commentsData } = useGetFeedComments(feedId);
  const toggleLikeMutation = useToggleFeedLike();
  const createCommentMutation = useCreateFeedComment();
  const reportFeedMutation = useReportBuilderFeed();
  const deleteFeedMutation = useDeleteBuilderFeed();

  const liked = feed?.isLiked ?? false;
  const likeCount = feed?.likeCount ?? 0;
  const isAuthor = memberId !== undefined && feed?.author.memberId === memberId;

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
    if (!reportReason.trim()) return;
    reportFeedMutation.mutate(
      { feedId, request: { reason: reportReason } },
      {
        onSuccess: () => {
          showToast('신고가 접수되었어요.');
          setShowReportModal(false);
          setReportReason('');
        },
        onError: () => showToast('신고 접수에 실패했어요.', 'error'),
      },
    );
  }

  function handleDelete() {
    deleteFeedMutation.mutate(feedId, {
      onSuccess: () => {
        showToast('피드가 삭제되었어요.');
        router.push('/class/vibe-intro/feed');
      },
      onError: () => showToast('삭제에 실패했어요.', 'error'),
    });
  }

  return (
    <>
      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex w-5000 flex-col items-center gap-300 rounded-200 bg-background-default p-500">
            <div className="text-center">
              <p className="font-designer-20b text-gray-800">
                피드를 삭제하시겠어요?
              </p>
              <p className="mt-150 font-designer-16r text-gray-500">
                삭제된 피드는 복구할 수 없습니다.
              </p>
            </div>
            <div className="flex w-full gap-200">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex h-700 flex-1 items-center justify-center rounded-100 border border-border-default font-designer-16m text-gray-800"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteFeedMutation.isPending}
                className="flex h-700 flex-1 items-center justify-center rounded-100 bg-background-brand-default font-designer-16m text-text-inverse disabled:opacity-50"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report reason modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex w-5000 flex-col gap-300 rounded-200 bg-background-default p-500">
            <p className="font-designer-20b text-gray-800">
              신고 사유를 입력해주세요
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="신고 사유를 상세히 작성해주세요."
              className="h-1500 resize-none rounded-100 border border-border-default p-200 font-designer-14r text-gray-800 outline-none placeholder:text-gray-400 focus:border-border-brand"
            />
            <div className="flex gap-200">
              <button
                type="button"
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                }}
                className="flex h-700 flex-1 items-center justify-center rounded-100 border border-border-default font-designer-16m text-gray-800"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleReport}
                disabled={!reportReason.trim() || reportFeedMutation.isPending}
                className="flex h-700 flex-1 items-center justify-center rounded-100 bg-background-brand-default font-designer-16m text-text-inverse disabled:opacity-50"
              >
                신고하기
              </button>
            </div>
          </div>
        </div>
      )}

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
              {/* Author + ⋮ menu */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-150">
                  <div className="h-400 w-400 rounded-full bg-gray-200" />
                  <div>
                    <p className="font-designer-14b text-gray-800">
                      {feed?.author.nickname ?? ''}
                    </p>
                    <p className="font-designer-12r text-gray-400">
                      {feed?.author.role ?? ''}
                    </p>
                  </div>
                </div>

                {/* ⋮ dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMoreOpen((p) => !p)}
                    className="text-gray-400"
                  >
                    <MoreVertical className="h-300 w-300" />
                  </button>

                  {moreOpen && (
                    <>
                      {/* Backdrop to close on outside click */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMoreOpen(false)}
                      />
                      <div className="absolute right-0 top-full z-20 mt-50 flex flex-col items-stretch gap-25 rounded-100 border border-gray-400 bg-background-default p-125 shadow-1">
                        {isAuthor ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setMoreOpen(false);
                                router.push(
                                  `/class/vibe-intro/feed/${feedId}/edit`,
                                );
                              }}
                              className="flex items-center gap-125 whitespace-nowrap rounded-50 p-100 font-designer-16r text-gray-400 hover:bg-gray-100"
                            >
                              <FilePen className="h-300 w-300 shrink-0" />
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMoreOpen(false);
                                setShowDeleteConfirm(true);
                              }}
                              className="flex items-center gap-125 whitespace-nowrap rounded-50 p-100 font-designer-16r text-gray-400 hover:bg-gray-100"
                            >
                              <Trash2 className="h-300 w-300 shrink-0" />
                              삭제
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setMoreOpen(false);
                              setShowReportModal(true);
                            }}
                            className="flex items-center gap-125 whitespace-nowrap rounded-50 p-100 font-designer-16r text-gray-400 hover:bg-gray-100"
                          >
                            신고하기
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Image */}
              <div className="relative mt-250 h-[380px] overflow-hidden rounded-150 bg-gray-300" />

              {/* Caption */}
              <MarkdownContentCore
                className="mt-250"
                content={feed?.content ?? ''}
              />

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
                  className="h-1000 w-full resize-none rounded-150 border border-border-default p-200 font-designer-14r text-gray-800 outline-none placeholder:text-gray-400 focus:border-border-brand"
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
                                isOperator
                                  ? 'text-text-brand'
                                  : 'text-gray-800',
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
                              {new Date(c.createdAt).toLocaleDateString(
                                'ko-KR',
                                {
                                  month: '2-digit',
                                  day: '2-digit',
                                },
                              )}
                            </p>
                          </div>
                          <p className="mt-75 font-designer-14r leading-relaxed text-gray-800">
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
    </>
  );
}
