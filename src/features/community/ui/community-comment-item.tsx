'use client';

import {
  ChevronDown,
  ChevronUp,
  MessageSquareReply,
  MoreVertical,
  PencilLine,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Avatar from '@/components/common/ui/avatar';
import type {
  CommunityComment,
  CommunityCommentReaction,
} from '@/types/community/domain';
import CommunityCommentForm from './community-comment-form';
import { CommunityMemberRoleBadge } from './community-meta-badge';

interface CommunityCommentItemProps {
  comment: CommunityComment;
  viewerImage: string;
  editingCommentId?: number;
  editingDraft: string;
  replyDraft: string;
  replyTargetId?: number;
  depth?: number;
  onCancelEditing: () => void;
  onCloseReply: () => void;
  onDeleteComment: (commentId: number) => void;
  onEditingDraftChange: (nextValue: string) => void;
  onOpenReply: (commentId: number) => void;
  onReplyDraftChange: (nextValue: string) => void;
  onStartEditing: (commentId: number) => void;
  onSubmitEditedComment: () => void;
  onSubmitReply: () => void;
  onToggleCommentReaction: (
    commentId: number,
    nextReaction: CommunityCommentReaction,
  ) => void;
}

function CommunityCommentActionButton({
  icon,
  label,
  count,
  isActive = false,
  onClick,
}: {
  icon: ReactNode;
  label?: string;
  count?: number;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-75 font-designer-13m transition-colors',
        isActive
          ? 'text-text-strong'
          : 'text-text-subtle hover:text-text-default',
      )}
    >
      <span className="flex items-center">{icon}</span>
      {typeof count === 'number' && count > 0 ? <span>{count}</span> : null}
      {label ? <span>{label}</span> : null}
    </button>
  );
}

export default function CommunityCommentItem({
  comment,
  viewerImage,
  editingCommentId,
  editingDraft,
  replyDraft,
  replyTargetId,
  depth = 0,
  onCancelEditing,
  onCloseReply,
  onDeleteComment,
  onEditingDraftChange,
  onOpenReply,
  onReplyDraftChange,
  onStartEditing,
  onSubmitEditedComment,
  onSubmitReply,
  onToggleCommentReaction,
}: CommunityCommentItemProps) {
  const isEditing = editingCommentId === comment.id;
  const isReplying = replyTargetId === comment.id;
  const [isReplyListExpanded, setIsReplyListExpanded] = useState(depth > 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isReplying) {
      setIsReplyListExpanded(true);
    }
  }, [isReplying]);

  useEffect(() => {
    if (isEditing) {
      setIsMenuOpen(false);
    }
  }, [isEditing]);

  const handleToggleReplies = () => {
    setIsReplyListExpanded((prevState) => !prevState);
  };

  return (
    <article className="flex flex-col gap-150">
      <div className="flex items-start gap-150">
        <Avatar
          image={comment.authorImage}
          alt={comment.authorName}
          size={36}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-150">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-75">
                <span className="font-designer-14b text-text-strong">
                  {comment.authorName}
                </span>
                <CommunityMemberRoleBadge role={comment.authorRole} />
                <span className="font-designer-13r text-text-subtlest">
                  {comment.createdAt}
                </span>
                {comment.isEdited ? (
                  <span className="font-designer-12m text-text-subtlest">
                    수정됨
                  </span>
                ) : null}
              </div>
            </div>

            {comment.isAuthor ? (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prevState) => !prevState)}
                  className="rounded-full p-75 text-text-subtle transition-colors hover:bg-fill-neutral-subtle-hover hover:text-text-default"
                  aria-label="댓글 메뉴 열기"
                >
                  <MoreVertical className="h-16 w-16" />
                </button>

                {isMenuOpen ? (
                  <>
                    <button
                      type="button"
                      aria-label="댓글 메뉴 닫기"
                      className="fixed inset-0"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="absolute top-full right-0 z-10 mt-50 min-w-[132px] overflow-hidden rounded-150 border border-border-subtle bg-background-default shadow-3">
                      <button
                        type="button"
                        onClick={() => {
                          onStartEditing(comment.id);
                          setIsMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-100 px-150 py-125 font-designer-13m text-text-default transition-colors hover:bg-fill-neutral-subtle-hover"
                      >
                        <PencilLine className="h-14 w-14" />
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteComment(comment.id);
                          setIsMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-100 px-150 py-125 font-designer-13m text-text-error transition-colors hover:bg-fill-danger-subtle-default"
                      >
                        <Trash2 className="h-14 w-14" />
                        삭제
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>

          {isEditing ? (
            <div className="mt-150">
              <CommunityCommentForm
                authorImage={viewerImage}
                placeholder="댓글을 수정해보세요."
                submitLabel="수정 저장"
                value={editingDraft}
                onChange={onEditingDraftChange}
                onSubmit={onSubmitEditedComment}
                onCancel={onCancelEditing}
                autoFocus={true}
                isCompact={true}
              />
            </div>
          ) : (
            <>
              <p className="mt-75 font-designer-15r leading-300 whitespace-pre-wrap text-text-default">
                {comment.content}
              </p>

              <div className="mt-150 flex flex-wrap items-center gap-x-150 gap-y-100">
                <CommunityCommentActionButton
                  icon={
                    <ThumbsUp
                      className={cn(
                        'h-16 w-16',
                        comment.viewerReaction === 'like'
                          ? 'fill-current'
                          : undefined,
                      )}
                    />
                  }
                  count={comment.likeCount}
                  isActive={comment.viewerReaction === 'like'}
                  onClick={() => onToggleCommentReaction(comment.id, 'like')}
                />
                <CommunityCommentActionButton
                  icon={
                    <ThumbsDown
                      className={cn(
                        'h-16 w-16',
                        comment.viewerReaction === 'dislike'
                          ? 'fill-current'
                          : undefined,
                      )}
                    />
                  }
                  isActive={comment.viewerReaction === 'dislike'}
                  onClick={() => onToggleCommentReaction(comment.id, 'dislike')}
                />
                <CommunityCommentActionButton
                  icon={<MessageSquareReply className="h-16 w-16" />}
                  label="답글"
                  onClick={() => onOpenReply(comment.id)}
                />
              </div>
            </>
          )}

          {isReplying ? (
            <div className="mt-150">
              <CommunityCommentForm
                authorImage={viewerImage}
                placeholder="답글을 남겨보세요."
                submitLabel="답글 등록"
                value={replyDraft}
                onChange={onReplyDraftChange}
                onSubmit={onSubmitReply}
                onCancel={onCloseReply}
                autoFocus={true}
                isCompact={true}
              />
            </div>
          ) : null}

          {comment.replies.length > 0 ? (
            <div className="mt-100">
              <button
                type="button"
                onClick={handleToggleReplies}
                className="inline-flex items-center gap-75 font-designer-13b text-text-default transition-colors hover:text-text-strong"
              >
                <span>답글 {comment.replies.length}개</span>
                {isReplyListExpanded ? (
                  <ChevronUp className="h-16 w-16" />
                ) : (
                  <ChevronDown className="h-16 w-16" />
                )}
              </button>

              {isReplyListExpanded ? (
                <div
                  className={cn(
                    'mt-150 flex flex-col gap-250 border-l border-border-subtle pl-200',
                    depth > 0 && 'ml-200',
                  )}
                >
                  {comment.replies.map((reply) => (
                    <CommunityCommentItem
                      key={reply.id}
                      comment={reply}
                      depth={depth + 1}
                      viewerImage={viewerImage}
                      editingCommentId={editingCommentId}
                      editingDraft={editingDraft}
                      replyDraft={replyDraft}
                      replyTargetId={replyTargetId}
                      onCancelEditing={onCancelEditing}
                      onCloseReply={onCloseReply}
                      onDeleteComment={onDeleteComment}
                      onEditingDraftChange={onEditingDraftChange}
                      onOpenReply={onOpenReply}
                      onReplyDraftChange={onReplyDraftChange}
                      onStartEditing={onStartEditing}
                      onSubmitEditedComment={onSubmitEditedComment}
                      onSubmitReply={onSubmitReply}
                      onToggleCommentReaction={onToggleCommentReaction}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
