'use client';

import { ArrowLeft, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
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
import {
  ROLE_LABELS,
  RoleBadge,
} from '@/components/pages/class/utils/builder-feed-utils';
import { useAuth } from '@/features/auth/model/use-auth';
import {
  useCreateFeedComment,
  useGetBuilderFeedDetail,
  useGetBuilderFeeds,
  useGetFeedComments,
  useReportBuilderFeed,
  useToggleFeedLike,
} from '@/hooks/queries/course/course-api';
import { useToastStore } from '@/stores/use-toast-store';

export default function FeedDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { id, slug } = use(params);
  const feedId = parseInt(id, 10);
  const { memberId } = useAuth();
  const showToast = useToastStore((s) => s.showToast);

  const [comment, setComment] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
                <div className="text-left">
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
                            onClick={() => setMoreOpen(false)}
                            className="flex items-center gap-125 whitespace-nowrap rounded-50 p-100 font-designer-16r text-gray-400 hover:bg-gray-100"
                          >
                            <FeedEditIcon className="h-300 w-300 shrink-0" />
                            수정하기
                          </button>
                          <button
                            type="button"
                            onClick={() => setMoreOpen(false)}
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
                const isOperator = c.author.role === '운영진';
                return (
                  <div key={c.commentId}>
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
                          <RoleBadge role={c.author.role} />
                          <p className="font-designer-12r text-gray-400">
                            {ROLE_LABELS[c.author.role] ?? c.author.role}
                          </p>
                          <p className="font-designer-12r text-gray-400">
                            {new Date(c.createdAt).toLocaleDateString('ko-KR', {
                              month: '2-digit',
                              day: '2-digit',
                            })}
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
                        {f.content}
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
