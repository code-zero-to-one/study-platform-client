'use client';

import { ArrowLeft, Link as LinkIcon, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import BuilderProfileModal from '@/components/common/modals/builder-profile-modal';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  FeedCommentIcon,
  FeedDeleteIcon,
  FeedEditIcon,
  FeedHeartIcon,
  FeedShareIcon,
} from '@/components/common/ui/icons/course-icons';
import MarkdownContentCore from '@/components/common/ui/rich-text/markdown-content-core';
import { RoleBadge } from '@/components/pages/class/utils/builder-feed-utils';
import { useAuth } from '@/features/auth/model/use-auth';
import {
  useCreateFeedComment,
  useDeleteBuilderFeed,
  useGetBuilderFeedDetail,
  useGetBuilderFeeds,
  useGetFeedComments,
  useReportBuilderFeed,
  useToggleFeedLike,
} from '@/hooks/queries/course/course-api';
import { useToastStore } from '@/stores/use-toast-store';
import { stripHtml } from '@/utils/markdown-content-text';

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
}

export default function FeedDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { id, slug } = use(params);
  const feedId = parseInt(id, 10);
  const { memberId } = useAuth();
  const showToast = useToastStore((s) => s.showToast);
  const router = useRouter();

  const [comment, setComment] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [commentMenuOpenId, setCommentMenuOpenId] = useState<number | null>(
    null,
  );
  const [reportCommentId, setReportCommentId] = useState<number | null>(null);

  const { data: feed } = useGetBuilderFeedDetail(feedId);
  const { data: commentsData } = useGetFeedComments(feedId);
  const { data: moreFeedsData } = useGetBuilderFeeds({
    courseId: feed?.courseId ?? 0,
    sort: 'LATEST',
    page: 0,
    size: 6,
  });
  const toggleLikeMutation = useToggleFeedLike();
  const createCommentMutation = useCreateFeedComment();
  const reportFeedMutation = useReportBuilderFeed();
  const deleteFeedMutation = useDeleteBuilderFeed();

  const liked = feed?.isLiked ?? false;
  const likeCount = feed?.likeCount ?? 0;
  const isAuthor = memberId !== undefined && feed?.author.memberId === memberId;
  const imageUrls = feed?.imageUrls ?? [];
  const moreFeeds = (moreFeedsData?.feeds ?? [])
    .filter((f) => f.feedId !== feedId)
    .slice(0, 4);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('링크가 복사되었어요!');
    } catch {
      // clipboard unavailable
    }
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

  function handleCreateReply() {
    if (!replyText.trim() || replyingToId === null) return;
    createCommentMutation.mutate(
      {
        feedId,
        request: { content: replyText, parentCommentId: replyingToId },
      },
      {
        onSuccess: () => {
          setReplyText('');
          setReplyingToId(null);
          showToast('답글이 등록되었어요!');
        },
      },
    );
  }

  function handleReport() {
    if (!reportReason.trim()) return;
    reportFeedMutation.mutate(
      {
        feedId,
        request: {
          reason: reportReason,
          commentId: reportCommentId ?? undefined,
        },
      },
      {
        onSuccess: () => {
          showToast('신고가 접수되었어요.');
          setShowReportModal(false);
          setReportReason('');
          setReportCommentId(null);
        },
        onError: () => showToast('신고 접수에 실패했어요.', 'error'),
      },
    );
  }

  return (
    <>
      {/* Report modal */}
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
                  setReportCommentId(null);
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

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex w-5000 flex-col items-center gap-300 rounded-200 bg-background-default p-500">
            <div className="text-center">
              <p className="font-designer-20b text-gray-800">
                피드를 삭제하시겠습니까?
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
                disabled={deleteFeedMutation.isPending}
                onClick={() =>
                  deleteFeedMutation.mutate(feedId, {
                    onSuccess: () => {
                      showToast('피드가 삭제되었어요.');
                      router.push(`/class/${slug}/home?tab=feed`);
                    },
                    onError: () => showToast('삭제에 실패했어요.', 'error'),
                  })
                }
                className="flex h-700 flex-1 items-center justify-center rounded-100 bg-background-brand-default font-designer-16m text-text-inverse disabled:opacity-50"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {feed !== undefined && feed.author.memberId !== undefined && (
        <BuilderProfileModal
          memberId={feed.author.memberId}
          nickname={feed.author.nickname}
          role={feed.author.role}
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
        />
      )}

      <div className="w-full pb-800">
        <div className="mx-auto max-w-page px-600 pt-500">
          <Link
            href={`/class/${slug}/home?tab=feed`}
            className="inline-flex items-center gap-125 font-designer-14m text-gray-800"
          >
            <ArrowLeft className="h-300 w-300" />
            빌더 피드 돌아가기
          </Link>

          <div className="mt-400">
            {/* Author + ⋮ menu */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-150"
              >
                <div className="h-400 w-400 rounded-full bg-gray-200" />
                <div className="flex items-center gap-125">
                  <p className="font-designer-14b text-gray-800">
                    {feed?.author.nickname ?? ''}
                  </p>
                  {feed?.author.role && <RoleBadge role={feed.author.role} />}
                </div>
              </button>

              {/* ⋮ menu: author → 수정/삭제 (UI only), non-author → 신고하기 */}
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
                                `/class/${slug}/feed/write?feedId=${feedId}`,
                              );
                            }}
                            className="flex items-center gap-125 whitespace-nowrap rounded-50 p-100 font-designer-16r text-gray-400 hover:bg-gray-100"
                          >
                            <FeedEditIcon className="h-300 w-300 shrink-0" />
                            수정하기
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMoreOpen(false);
                              setShowDeleteConfirm(true);
                            }}
                            className="flex items-center gap-125 whitespace-nowrap rounded-50 p-100 font-designer-16r text-gray-400 hover:bg-gray-100"
                          >
                            <FeedDeleteIcon className="h-300 w-300 shrink-0" />
                            삭제하기
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setMoreOpen(false);
                            setShowReportModal(true);
                          }}
                          className="whitespace-nowrap rounded-50 p-100 font-designer-16r text-gray-400 hover:bg-gray-100"
                        >
                          신고하기
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Images */}
            {imageUrls.length > 0 && (
              <div
                className={cn(
                  'mt-250 grid gap-150',
                  imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2',
                )}
              >
                {imageUrls.map((url, i) => (
                  <div
                    key={url}
                    className="relative aspect-square overflow-hidden rounded-150 bg-gray-200"
                  >
                    <Image
                      src={url}
                      alt={`첨부 이미지 ${i + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Artifact — retrospective screenshot or link */}
            {feed?.artifactUrl &&
              (isImageUrl(feed.artifactUrl) ? (
                <div className="relative mt-250 aspect-video overflow-hidden rounded-150 bg-gray-200">
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
                  className="mt-250 flex items-center gap-100 break-all font-designer-14m text-background-brand-default hover:underline"
                >
                  <LinkIcon className="h-200 w-200 shrink-0" />
                  {feed.artifactUrl}
                </a>
              ))}

            {/* Content */}
            <MarkdownContentCore
              className="mt-250"
              content={feed?.content ?? ''}
            />

            {/* Actions */}
            <div className="mt-300 flex items-center gap-200">
              <button
                type="button"
                onClick={() => toggleLikeMutation.mutate(feedId)}
                className="flex items-center gap-75"
              >
                <FeedHeartIcon
                  className={cn(
                    'h-300 w-300',
                    liked ? 'fill-rose-500 text-rose-500' : 'text-gray-800',
                  )}
                />
                <p className="font-designer-16r text-gray-800">{likeCount}</p>
              </button>
              <button type="button" className="flex items-center gap-75">
                <FeedCommentIcon className="h-300 w-300 text-gray-800" />
                <p className="font-designer-16r text-gray-800">
                  {feed?.commentCount ?? 0}
                </p>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleShare().catch(() => {});
                }}
              >
                <FeedShareIcon className="h-300 w-300 text-gray-800" />
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
                const isOperator =
                  c.author.role === 'MANAGER' || c.author.role === 'ADMIN';
                const isCommentAuthor =
                  memberId !== undefined && c.author.memberId === memberId;
                const isMenuOpen = commentMenuOpenId === c.commentId;
                const isReplying = replyingToId === c.commentId;
                return (
                  <div key={c.commentId}>
                    {/* Comment row */}
                    <div className="flex items-start gap-150">
                      <div className="h-425 w-425 shrink-0 rounded-full bg-gray-200" />
                      <div className="flex-1">
                        {/* Nickname + ⋮ */}
                        <div className="flex items-center justify-between">
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
                            <RoleBadge role={c.author.role} />
                          </div>
                          {/* ⋮ menu */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setCommentMenuOpenId(
                                  isMenuOpen ? null : c.commentId,
                                )
                              }
                              className="text-gray-400"
                            >
                              <MoreVertical className="h-250 w-250" />
                            </button>
                            {isMenuOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setCommentMenuOpenId(null)}
                                />
                                <div className="absolute right-0 top-full z-20 mt-50 flex flex-col items-stretch gap-25 rounded-100 border border-gray-400 bg-background-default p-125 shadow-1">
                                  {isCommentAuthor ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setCommentMenuOpenId(null);
                                          showToast(
                                            '댓글 수정 기능은 준비 중입니다.',
                                          );
                                        }}
                                        className="flex items-center gap-125 whitespace-nowrap rounded-50 p-100 font-designer-18r text-gray-400 hover:bg-gray-100"
                                      >
                                        <FeedEditIcon className="h-300 w-300 shrink-0" />
                                        수정
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setCommentMenuOpenId(null);
                                          showToast(
                                            '댓글 삭제 기능은 준비 중입니다.',
                                          );
                                        }}
                                        className="flex items-center gap-125 whitespace-nowrap rounded-50 p-100 font-designer-18r text-gray-400 hover:bg-gray-100"
                                      >
                                        <FeedDeleteIcon className="h-300 w-300 shrink-0" />
                                        삭제
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCommentMenuOpenId(null);
                                        setReportCommentId(c.commentId);
                                        setShowReportModal(true);
                                      }}
                                      className="whitespace-nowrap rounded-50 p-100 font-designer-18r text-gray-400 hover:bg-gray-100"
                                    >
                                      신고하기
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        {/* Content */}
                        <p className="mt-75 font-designer-14r leading-relaxed text-gray-800">
                          {c.content}
                        </p>
                        {/* Date + 답글쓰기 — inline */}
                        <div className="mt-100 flex items-center gap-50">
                          <p className="font-designer-14r text-gray-400">
                            {new Date(c.createdAt).toLocaleDateString('ko-KR', {
                              month: '2-digit',
                              day: '2-digit',
                            })}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (isReplying) {
                                setReplyingToId(null);
                                setReplyText('');
                              } else {
                                setReplyingToId(c.commentId);
                                setReplyText(`@${c.author.nickname} `);
                              }
                            }}
                            className="px-100 font-designer-14r text-gray-500 hover:text-gray-800"
                          >
                            답글쓰기
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Existing replies */}
                    {c.replies.length > 0 && (
                      <div className="ml-575 mt-200 space-y-200">
                        {c.replies.map((r) => {
                          const isReplyOperator =
                            r.author.role === 'MANAGER' ||
                            r.author.role === 'ADMIN';
                          const contentParts = r.content.startsWith('@')
                            ? (() => {
                                const spaceIdx = r.content.indexOf(' ');
                                return spaceIdx !== -1
                                  ? {
                                      mention: r.content.slice(0, spaceIdx),
                                      rest: r.content.slice(spaceIdx),
                                    }
                                  : null;
                              })()
                            : null;
                          return (
                            <div
                              key={r.commentId}
                              className="flex items-start gap-150"
                            >
                              <div className="h-425 w-425 shrink-0 rounded-full bg-gray-200" />
                              <div className="flex-1">
                                <div className="flex items-center gap-125">
                                  <p
                                    className={cn(
                                      'font-designer-14b',
                                      isReplyOperator
                                        ? 'text-text-brand'
                                        : 'text-gray-800',
                                    )}
                                  >
                                    {r.author.nickname}
                                  </p>
                                  <RoleBadge role={r.author.role} />
                                </div>
                                <p className="mt-75 font-designer-14r leading-relaxed">
                                  {contentParts ? (
                                    <>
                                      <span className="text-blue-500">
                                        {contentParts.mention}
                                      </span>
                                      <span className="text-gray-800">
                                        {contentParts.rest}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-gray-800">
                                      {r.content}
                                    </span>
                                  )}
                                </p>
                                <p className="mt-100 font-designer-14r text-gray-400">
                                  {new Date(r.createdAt).toLocaleDateString(
                                    'ko-KR',
                                    {
                                      month: '2-digit',
                                      day: '2-digit',
                                    },
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Reply input */}
                    {isReplying && (
                      <div className="ml-575 mt-200">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="답글을 남겨주세요"
                          className="h-750 w-full resize-none rounded-100 border border-border-default p-150 font-designer-14r text-gray-800 outline-none placeholder:text-gray-400 focus:border-border-brand"
                        />
                        <div className="mt-100 flex justify-end gap-150">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingToId(null);
                              setReplyText('');
                            }}
                            className="rounded-75 px-200 py-100 font-designer-13m text-gray-400 hover:bg-gray-100"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            onClick={handleCreateReply}
                            disabled={
                              !replyText.trim() ||
                              createCommentMutation.isPending
                            }
                            className="rounded-75 bg-background-brand-default px-200 py-100 font-designer-13m text-text-inverse disabled:opacity-50"
                          >
                            등록
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* More feeds */}
          {moreFeeds.length > 0 && (
            <div className="mt-600">
              <p className="font-designer-18b text-gray-800">더 많은 피드</p>
              <div className="mt-300 grid grid-cols-2 gap-300">
                {moreFeeds.map((f) => (
                  <Link
                    key={f.feedId}
                    href={`/class/${slug}/feed/${f.feedId}`}
                    className="overflow-hidden rounded-150 border border-border-subtle"
                  >
                    <div className="relative aspect-square bg-gray-200">
                      {f.thumbnailUrl && (
                        <Image
                          src={f.thumbnailUrl}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="p-200">
                      <p className="line-clamp-2 font-designer-14r text-gray-800">
                        {stripHtml(f.content)}
                      </p>
                      <div className="mt-100 flex items-center gap-75">
                        <FeedHeartIcon className="h-200 w-200 text-gray-400" />
                        <p className="font-designer-12r text-gray-400">
                          {f.likeCount}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
