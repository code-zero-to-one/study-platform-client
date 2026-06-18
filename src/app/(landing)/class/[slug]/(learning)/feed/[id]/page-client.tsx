'use client';

import { ArrowLeft, Link as LinkIcon, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type Dispatch, use, useReducer, useRef } from 'react';
import type {
  BuilderFeedListResponse,
  CommentItem,
  ReplyItem,
} from '@/api/openapi/models';
import { RoleBadge } from '@/components/class/builder-feed-utils';
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
import { useAuth } from '@/features/auth/model/use-auth';
import {
  useCreateFeedComment,
  useDeleteBuilderFeed,
  useGetBuilderFeedDetail,
  useGetBuilderFeeds,
  useGetFeedComments,
  useReportBuilderFeed,
  useToggleFeedLike,
} from '@/hooks/queries/course/course-queries';
import { useToastStore } from '@/stores/use-toast-store';
import { stripHtml } from '@/utils/markdown-content-text';

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
}

interface FeedDetailState {
  comment: string;
  moreOpen: boolean;
  showReportModal: boolean;
  showDeleteConfirm: boolean;
  reportReason: string;
  isProfileOpen: boolean;
  replyingToId: number | null;
  replyText: string;
  commentMenuOpenId: number | null;
}

type FeedDetailAction =
  | { type: 'setComment'; comment: string }
  | { type: 'toggleMoreOpen' }
  | { type: 'setMoreOpen'; open: boolean }
  | { type: 'openDeleteConfirm' }
  | { type: 'setShowDeleteConfirm'; open: boolean }
  | { type: 'openReportFromMenu' }
  | { type: 'openReportFromComment' }
  | { type: 'setReportReason'; reason: string }
  | { type: 'closeReport' }
  | { type: 'setIsProfileOpen'; open: boolean }
  | { type: 'setCommentMenuOpenId'; id: number | null }
  | { type: 'toggleReply'; commentId: number; nickname: string }
  | { type: 'cancelReply' }
  | { type: 'setReplyText'; text: string };

const INITIAL_FEED_DETAIL: FeedDetailState = {
  comment: '',
  moreOpen: false,
  showReportModal: false,
  showDeleteConfirm: false,
  reportReason: '',
  isProfileOpen: false,
  replyingToId: null,
  replyText: '',
  commentMenuOpenId: null,
};

function feedDetailReducer(
  state: FeedDetailState,
  action: FeedDetailAction,
): FeedDetailState {
  switch (action.type) {
    case 'setComment':
      return { ...state, comment: action.comment };
    case 'toggleMoreOpen':
      return { ...state, moreOpen: !state.moreOpen };
    case 'setMoreOpen':
      return { ...state, moreOpen: action.open };
    case 'openDeleteConfirm':
      return { ...state, moreOpen: false, showDeleteConfirm: true };
    case 'setShowDeleteConfirm':
      return { ...state, showDeleteConfirm: action.open };
    case 'openReportFromMenu':
      return { ...state, moreOpen: false, showReportModal: true };
    case 'openReportFromComment':
      return { ...state, commentMenuOpenId: null, showReportModal: true };
    case 'setReportReason':
      return { ...state, reportReason: action.reason };
    case 'closeReport':
      return { ...state, showReportModal: false, reportReason: '' };
    case 'setIsProfileOpen':
      return { ...state, isProfileOpen: action.open };
    case 'setCommentMenuOpenId':
      return { ...state, commentMenuOpenId: action.id };
    case 'toggleReply':
      return state.replyingToId === action.commentId
        ? { ...state, replyingToId: null, replyText: '' }
        : {
            ...state,
            replyingToId: action.commentId,
            replyText: `@${action.nickname} `,
          };
    case 'cancelReply':
      return { ...state, replyingToId: null, replyText: '' };
    case 'setReplyText':
      return { ...state, replyText: action.text };
    default:
      return state;
  }
}

function FeedReportModal({
  reason,
  isPending,
  onChangeReason,
  onCancel,
  onSubmit,
}: {
  reason: string;
  isPending: boolean;
  onChangeReason: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex w-full max-w-5000 flex-col gap-300 rounded-200 bg-background-default p-500">
        <p className="font-designer-20b text-gray-800">
          신고 사유를 입력해주세요
        </p>
        <textarea
          aria-label="신고 사유"
          value={reason}
          onChange={(e) => onChangeReason(e.target.value)}
          placeholder="신고 사유를 상세히 작성해주세요."
          className="h-1500 resize-none rounded-100 border border-border-default p-200 font-designer-14r text-gray-800 outline-none placeholder:text-gray-400 focus:border-border-brand"
        />
        <div className="flex gap-200">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-700 flex-1 items-center justify-center rounded-100 border border-border-default font-designer-16m text-gray-800"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!reason.trim() || isPending}
            className="flex h-700 flex-1 items-center justify-center rounded-100 bg-background-brand-default font-designer-16m text-text-inverse disabled:opacity-50"
          >
            신고하기
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedDeleteConfirmModal({
  isPending,
  onCancel,
  onConfirm,
}: {
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex w-full max-w-5000 flex-col items-center gap-300 rounded-200 bg-background-default p-500">
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
            onClick={onCancel}
            className="flex h-700 flex-1 items-center justify-center rounded-100 border border-border-default font-designer-16m text-gray-800"
          >
            취소
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="flex h-700 flex-1 items-center justify-center rounded-100 bg-background-brand-default font-designer-16m text-text-inverse disabled:opacity-50"
          >
            삭제하기
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedReplyRow({ reply }: { reply: ReplyItem }) {
  const isReplyOperator =
    reply.author.role === 'MANAGER' || reply.author.role === 'ADMIN';
  const contentParts = reply.content.startsWith('@')
    ? (() => {
        const spaceIdx = reply.content.indexOf(' ');
        return spaceIdx !== -1
          ? {
              mention: reply.content.slice(0, spaceIdx),
              rest: reply.content.slice(spaceIdx),
            }
          : null;
      })()
    : null;
  return (
    <div className="flex items-start gap-150">
      <div className="size-425 shrink-0 rounded-full bg-gray-200" />
      <div className="flex-1">
        <div className="flex items-center gap-125">
          <p
            className={cn(
              'font-designer-14b',
              isReplyOperator ? 'text-text-brand' : 'text-gray-800',
            )}
          >
            {reply.author.nickname}
          </p>
          <RoleBadge variant={reply.author.role} />
        </div>
        <p className="mt-75 font-designer-14r leading-relaxed">
          {contentParts ? (
            <>
              <span className="text-blue-500">{contentParts.mention}</span>
              <span className="text-gray-800">{contentParts.rest}</span>
            </>
          ) : (
            <span className="text-gray-800">{reply.content}</span>
          )}
        </p>
        <p className="mt-100 font-designer-14r text-gray-400">
          {new Date(reply.createdAt).toLocaleDateString('ko-KR', {
            month: '2-digit',
            day: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

function FeedCommentItem({
  comment,
  memberId,
  commentMenuOpenId,
  replyingToId,
  replyText,
  isReplyPending,
  dispatch,
  showToast,
  onSubmitReply,
  onReportComment,
}: {
  comment: CommentItem;
  memberId: number | undefined;
  commentMenuOpenId: number | null;
  replyingToId: number | null;
  replyText: string;
  isReplyPending: boolean;
  dispatch: Dispatch<FeedDetailAction>;
  showToast: (message: string, type?: 'success' | 'error') => void;
  onSubmitReply: () => void;
  onReportComment: (commentId: number) => void;
}) {
  const isOperator =
    comment.author.role === 'MANAGER' || comment.author.role === 'ADMIN';
  const isCommentAuthor =
    memberId !== undefined && comment.author.memberId === memberId;
  const isMenuOpen = commentMenuOpenId === comment.commentId;
  const isReplying = replyingToId === comment.commentId;
  return (
    <div>
      {/* Comment row */}
      <div className="flex items-start gap-150">
        <div className="size-425 shrink-0 rounded-full bg-gray-200" />
        <div className="flex-1">
          {/* Nickname + ⋮ */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-125">
              <p
                className={cn(
                  'font-designer-14b',
                  isOperator ? 'text-text-brand' : 'text-gray-800',
                )}
              >
                {comment.author.nickname}
              </p>
              <RoleBadge variant={comment.author.role} />
            </div>
            {/* ⋮ menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'setCommentMenuOpenId',
                    id: isMenuOpen ? null : comment.commentId,
                  })
                }
                className="text-gray-400"
              >
                <MoreVertical className="size-250" />
              </button>
              {isMenuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="메뉴 닫기"
                    className="fixed inset-0 z-10"
                    onClick={() =>
                      dispatch({
                        type: 'setCommentMenuOpenId',
                        id: null,
                      })
                    }
                  />
                  <div className="absolute right-0 top-full z-20 mt-50 flex flex-col items-stretch gap-25 rounded-100 border border-gray-400 bg-background-default p-125 shadow-1">
                    {isCommentAuthor ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            dispatch({
                              type: 'setCommentMenuOpenId',
                              id: null,
                            });
                            showToast('댓글 수정 기능은 준비 중입니다.');
                          }}
                          className="flex items-center gap-125 whitespace-nowrap rounded-50 p-100 font-designer-18r text-gray-400 hover:bg-gray-100"
                        >
                          <FeedEditIcon className="size-300 shrink-0" />
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            dispatch({
                              type: 'setCommentMenuOpenId',
                              id: null,
                            });
                            showToast('댓글 삭제 기능은 준비 중입니다.');
                          }}
                          className="flex items-center gap-125 whitespace-nowrap rounded-50 p-100 font-designer-18r text-gray-400 hover:bg-gray-100"
                        >
                          <FeedDeleteIcon className="size-300 shrink-0" />
                          삭제
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onReportComment(comment.commentId)}
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
            {comment.content}
          </p>
          {/* Date + 답글쓰기 — inline */}
          <div className="mt-100 flex items-center gap-50">
            <p className="font-designer-14r text-gray-400">
              {new Date(comment.createdAt).toLocaleDateString('ko-KR', {
                month: '2-digit',
                day: '2-digit',
              })}
            </p>
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: 'toggleReply',
                  commentId: comment.commentId,
                  nickname: comment.author.nickname ?? '',
                })
              }
              className="px-100 font-designer-14r text-gray-500 hover:text-gray-800"
            >
              답글쓰기
            </button>
          </div>
        </div>
      </div>

      {/* Existing replies */}
      {comment.replies.length > 0 && (
        <div className="ml-575 mt-200 space-y-200">
          {comment.replies.map((r) => (
            <FeedReplyRow key={r.commentId} reply={r} />
          ))}
        </div>
      )}

      {/* Reply input */}
      {isReplying && (
        <div className="ml-575 mt-200">
          <textarea
            aria-label="답글"
            value={replyText}
            onChange={(e) =>
              dispatch({
                type: 'setReplyText',
                text: e.target.value,
              })
            }
            placeholder="답글을 남겨주세요"
            className="h-750 w-full resize-none rounded-100 border border-border-default p-150 font-designer-14r text-gray-800 outline-none placeholder:text-gray-400 focus:border-border-brand"
          />
          <div className="mt-100 flex justify-end gap-150">
            <button
              type="button"
              onClick={() => dispatch({ type: 'cancelReply' })}
              className="rounded-75 px-200 py-100 font-designer-13m text-gray-400 hover:bg-gray-100"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onSubmitReply}
              disabled={!replyText.trim() || isReplyPending}
              className="rounded-75 bg-background-brand-default px-200 py-100 font-designer-13m text-text-inverse disabled:opacity-50"
            >
              등록
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MoreFeedsGrid({
  feeds,
  slug,
}: {
  feeds: NonNullable<BuilderFeedListResponse['feeds']>;
  slug: string;
}) {
  return (
    <div className="mt-600">
      <p className="font-designer-18b text-gray-800">더 많은 피드</p>
      <div className="mt-300 grid grid-cols-2 gap-300">
        {feeds.map((f) => (
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
                  sizes="100vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="p-200">
              <p className="line-clamp-2 font-designer-14r text-gray-800">
                {stripHtml(f.content)}
              </p>
              <div className="mt-100 flex items-center gap-75">
                <FeedHeartIcon className="size-200 text-gray-400" />
                <p className="font-designer-12r text-gray-400">{f.likeCount}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function FeedAuthorMenu({
  nickname,
  role,
  isAuthor,
  moreOpen,
  dispatch,
  onEdit,
}: {
  nickname: string;
  role?: string;
  isAuthor: boolean;
  moreOpen: boolean;
  dispatch: Dispatch<FeedDetailAction>;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={() => dispatch({ type: 'setIsProfileOpen', open: true })}
        className="flex items-center gap-150"
      >
        <div className="size-400 rounded-full bg-gray-200" />
        <div className="flex items-center gap-125">
          <p className="font-designer-14b text-gray-800">{nickname}</p>
          {role && <RoleBadge variant={role} />}
        </div>
      </button>

      {/* ⋮ menu: author → 수정/삭제, non-author → 신고하기 */}
      <div className="relative">
        <button
          type="button"
          onClick={() => dispatch({ type: 'toggleMoreOpen' })}
          className="text-gray-400"
        >
          <MoreVertical className="size-300" />
        </button>
        {moreOpen && (
          <>
            <button
              type="button"
              aria-label="메뉴 닫기"
              className="fixed inset-0 z-10"
              onClick={() => dispatch({ type: 'setMoreOpen', open: false })}
            />
            <div className="absolute right-0 top-full z-20 mt-50 flex flex-col items-stretch gap-25 rounded-100 border border-gray-400 bg-background-default p-125 shadow-1">
              {isAuthor ? (
                <>
                  <button
                    type="button"
                    onClick={onEdit}
                    className="flex items-center gap-125 whitespace-nowrap rounded-50 p-100 font-designer-16r text-gray-400 hover:bg-gray-100"
                  >
                    <FeedEditIcon className="size-300 shrink-0" />
                    수정하기
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: 'openDeleteConfirm',
                      })
                    }
                    className="flex items-center gap-125 whitespace-nowrap rounded-50 p-100 font-designer-16r text-gray-400 hover:bg-gray-100"
                  >
                    <FeedDeleteIcon className="size-300 shrink-0" />
                    삭제하기
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'openReportFromMenu' })}
                  className="whitespace-nowrap rounded-100 p-125 font-designer-16r text-gray-400 hover:bg-gray-100"
                >
                  신고하기
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FeedMedia({
  imageUrls,
  artifactUrl,
}: {
  imageUrls: string[];
  artifactUrl?: string;
}) {
  return (
    <>
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
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Artifact — retrospective screenshot or link */}
      {artifactUrl &&
        (isImageUrl(artifactUrl) ? (
          <div className="relative mt-250 aspect-video overflow-hidden rounded-150 bg-gray-200">
            <Image
              src={artifactUrl}
              alt="제출 스크린샷"
              fill
              unoptimized
              sizes="100vw"
              className="object-contain"
            />
          </div>
        ) : (
          <a
            href={artifactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-250 flex items-center gap-100 break-all font-designer-14m text-background-brand-default hover:underline"
          >
            <LinkIcon className="size-200 shrink-0" />
            {artifactUrl}
          </a>
        ))}
    </>
  );
}

function FeedCommentInput({
  comment,
  isPending,
  dispatch,
  onSubmit,
}: {
  comment: string;
  isPending: boolean;
  dispatch: Dispatch<FeedDetailAction>;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-300">
      <textarea
        aria-label="댓글"
        value={comment}
        onChange={(e) =>
          dispatch({ type: 'setComment', comment: e.target.value })
        }
        placeholder="댓글을 남겨주세요"
        className="h-1000 w-full resize-none rounded-150 border border-border-default p-200 font-designer-14r text-gray-800 outline-none placeholder:text-gray-400 focus:border-border-brand"
      />
      <div className="flex justify-end">
        <p className="font-designer-12r text-gray-400">{comment.length}/200</p>
      </div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={!comment.trim() || isPending}
        className="mt-150 w-full rounded-100 bg-background-brand-default py-200 font-designer-16b text-text-inverse disabled:bg-gray-300"
      >
        댓글 달아주기
      </button>
    </div>
  );
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

  const [state, dispatch] = useReducer(feedDetailReducer, INITIAL_FEED_DETAIL);
  const {
    comment,
    moreOpen,
    showReportModal,
    showDeleteConfirm,
    reportReason,
    isProfileOpen,
    replyingToId,
    replyText,
    commentMenuOpenId,
  } = state;
  // 신고 대상 댓글 id — 렌더에 쓰이지 않고 핸들러에서만 읽으므로 ref로 보관.
  const reportCommentIdRef = useRef<number | null>(null);

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
          dispatch({ type: 'setComment', comment: '' });
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
          dispatch({ type: 'cancelReply' });
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
          commentId: reportCommentIdRef.current ?? undefined,
        },
      },
      {
        onSuccess: () => {
          showToast('신고가 접수되었어요.');
          reportCommentIdRef.current = null;
          dispatch({ type: 'closeReport' });
        },
        onError: () => showToast('신고 접수에 실패했어요.', 'error'),
      },
    );
  }

  // 댓글 신고: 대상 댓글 id를 ref에 보관(임퓨어)한 뒤 모달 오픈.
  function handleReportComment(commentId: number) {
    reportCommentIdRef.current = commentId;
    dispatch({ type: 'openReportFromComment' });
  }

  return (
    <>
      {/* Report modal */}
      {showReportModal && (
        <FeedReportModal
          reason={reportReason}
          isPending={reportFeedMutation.isPending}
          onChangeReason={(value) =>
            dispatch({ type: 'setReportReason', reason: value })
          }
          onCancel={() => {
            reportCommentIdRef.current = null;
            dispatch({ type: 'closeReport' });
          }}
          onSubmit={handleReport}
        />
      )}

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <FeedDeleteConfirmModal
          isPending={deleteFeedMutation.isPending}
          onCancel={() =>
            dispatch({ type: 'setShowDeleteConfirm', open: false })
          }
          onConfirm={() =>
            deleteFeedMutation.mutate(feedId, {
              onSuccess: () => {
                showToast('피드가 삭제되었어요.');
                router.push(`/class/${slug}/home?tab=feed`);
              },
              onError: () => showToast('삭제에 실패했어요.', 'error'),
            })
          }
        />
      )}

      {feed !== undefined && feed.author.memberId !== undefined && (
        <BuilderProfileModal
          memberId={feed.author.memberId}
          nickname={feed.author.nickname}
          role={feed.author.role}
          open={isProfileOpen}
          onOpenChange={(open) => dispatch({ type: 'setIsProfileOpen', open })}
        />
      )}

      <div className="w-full pb-800">
        <div className="w-full px-3000 pt-500">
          <Link
            href={`/class/${slug}/home?tab=feed`}
            className="inline-flex items-center gap-125 font-designer-14m text-gray-800"
          >
            <ArrowLeft className="size-300" />
            빌더 피드 돌아가기
          </Link>

          <div className="mt-400">
            {/* Author + ⋮ menu */}
            <FeedAuthorMenu
              nickname={feed?.author.nickname ?? ''}
              role={feed?.author.role}
              isAuthor={isAuthor}
              moreOpen={moreOpen}
              dispatch={dispatch}
              onEdit={() => {
                dispatch({ type: 'setMoreOpen', open: false });
                router.push(`/class/${slug}/feed/write?feedId=${feedId}`);
              }}
            />

            {/* Images + artifact */}
            <FeedMedia imageUrls={imageUrls} artifactUrl={feed?.artifactUrl} />

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
                    'size-300',
                    liked ? 'fill-rose-500 text-rose-500' : 'text-gray-800',
                  )}
                />
                <p className="font-designer-16r text-gray-800">{likeCount}</p>
              </button>
              <button type="button" className="flex items-center gap-75">
                <FeedCommentIcon className="size-300 text-gray-800" />
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
                <FeedShareIcon className="size-300 text-gray-800" />
              </button>
            </div>

            {/* Comment input */}
            <FeedCommentInput
              comment={comment}
              isPending={createCommentMutation.isPending}
              dispatch={dispatch}
              onSubmit={handleCreateComment}
            />

            {/* Comments */}
            <div className="mt-400 space-y-300">
              {(commentsData?.comments ?? []).map((c) => (
                <FeedCommentItem
                  key={c.commentId}
                  comment={c}
                  memberId={memberId}
                  commentMenuOpenId={commentMenuOpenId}
                  replyingToId={replyingToId}
                  replyText={replyText}
                  isReplyPending={createCommentMutation.isPending}
                  dispatch={dispatch}
                  showToast={showToast}
                  onSubmitReply={handleCreateReply}
                  onReportComment={handleReportComment}
                />
              ))}
            </div>
          </div>

          {/* More feeds */}
          {moreFeeds.length > 0 && (
            <MoreFeedsGrid feeds={moreFeeds} slug={slug} />
          )}
        </div>
      </div>
    </>
  );
}
