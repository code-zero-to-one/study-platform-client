'use client';

import { useEffect, useState } from 'react';
import Pagination from '@/components/common/ui/pagination';
import { useToastStore } from '@/stores/use-toast-store';
import type {
  CommunityComment,
  CommunityCommentReactionSelection,
} from '@/types/community/domain';
import CommunityCommentForm from './community-comment-form';
import CommunityCommentItem from './community-comment-item';
import CommunitySectionShell from './community-section-shell';
import { getCommunityErrorMessage } from '../api/community-api';

const findCommentById = (
  comments: readonly CommunityComment[],
  commentId: number,
): CommunityComment | undefined => {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return comment;
    }

    const nestedComment = findCommentById(comment.replies, commentId);

    if (nestedComment) {
      return nestedComment;
    }
  }

  return undefined;
};

interface CommunityCommentSectionProps {
  comments: readonly CommunityComment[];
  commentCount: number;
  commentPlaceholder?: string;
  currentPage: number;
  errorMessage?: string;
  isAuthenticated: boolean;
  isLoading?: boolean;
  isCommentDisabled?: boolean;
  resetKey: number;
  showPagination: boolean;
  totalPages: number;
  viewerImage: string;
  onChangePage: (page: number) => void;
  onDeleteComment: (commentId: number) => Promise<void>;
  onSubmitComment: (content: string) => Promise<void>;
  onSubmitEditedComment: (
    commentId: number,
    revision: number,
    content: string,
  ) => Promise<void>;
  onSubmitReply: (commentId: number, content: string) => Promise<void>;
  onToggleCommentReaction: (
    commentId: number,
    nextReaction: CommunityCommentReactionSelection,
  ) => void;
}

export default function CommunityCommentSection({
  comments,
  commentCount,
  commentPlaceholder = '댓글을 남겨보세요.',
  currentPage,
  errorMessage,
  isAuthenticated,
  isLoading = false,
  isCommentDisabled = false,
  resetKey,
  showPagination,
  totalPages,
  viewerImage,
  onChangePage,
  onDeleteComment,
  onSubmitComment,
  onSubmitEditedComment,
  onSubmitReply,
  onToggleCommentReaction,
}: CommunityCommentSectionProps) {
  const showToast = useToastStore((state) => state.showToast);
  const [commentDraft, setCommentDraft] = useState('');
  const [replyTargetId, setReplyTargetId] = useState<number | undefined>();
  const [replyDraft, setReplyDraft] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<
    number | undefined
  >();
  const [editingDraft, setEditingDraft] = useState('');

  useEffect(() => {
    setCommentDraft('');
    setReplyTargetId(undefined);
    setReplyDraft('');
    setEditingCommentId(undefined);
    setEditingDraft('');
  }, [resetKey]);

  useEffect(() => {
    if (replyTargetId && !findCommentById(comments, replyTargetId)) {
      setReplyTargetId(undefined);
      setReplyDraft('');
    }

    if (editingCommentId && !findCommentById(comments, editingCommentId)) {
      setEditingCommentId(undefined);
      setEditingDraft('');
    }
  }, [comments, editingCommentId, replyTargetId]);

  const handleSubmitComment = async () => {
    const normalizedContent = commentDraft.trim();

    if (!normalizedContent) {
      return;
    }

    try {
      await onSubmitComment(normalizedContent);
      setCommentDraft('');
    } catch (error) {
      showToast(
        getCommunityErrorMessage(error, '댓글 등록에 실패했습니다.'),
        'error',
      );
    }
  };

  const handleOpenReply = (commentId: number) => {
    const targetComment = findCommentById(comments, commentId);

    if (!targetComment?.canReply) {
      if (!isAuthenticated) {
        showToast('로그인 후 답글을 작성할 수 있습니다.', 'info');
      }

      return;
    }

    setReplyTargetId(commentId);
    setReplyDraft('');
    setEditingCommentId(undefined);
    setEditingDraft('');
  };

  const handleCloseReply = () => {
    setReplyTargetId(undefined);
    setReplyDraft('');
  };

  const handleSubmitReply = async () => {
    const normalizedContent = replyDraft.trim();

    if (!replyTargetId || !normalizedContent) {
      return;
    }

    try {
      await onSubmitReply(replyTargetId, normalizedContent);
      setReplyDraft('');
      setReplyTargetId(undefined);
    } catch (error) {
      showToast(
        getCommunityErrorMessage(error, '답글 등록에 실패했습니다.'),
        'error',
      );
    }
  };

  const handleStartEditing = (commentId: number) => {
    const targetComment = findCommentById(comments, commentId);

    if (!targetComment?.canEdit) {
      return;
    }

    setEditingCommentId(commentId);
    setEditingDraft(targetComment.content);
    setReplyTargetId(undefined);
    setReplyDraft('');
  };

  const handleCancelEditing = () => {
    setEditingCommentId(undefined);
    setEditingDraft('');
  };

  const handleSubmitEditedComment = async () => {
    const normalizedContent = editingDraft.trim();

    if (!editingCommentId || !normalizedContent) {
      return;
    }

    const targetComment = findCommentById(comments, editingCommentId);

    if (!targetComment?.revision) {
      return;
    }

    try {
      await onSubmitEditedComment(
        editingCommentId,
        targetComment.revision,
        normalizedContent,
      );
      setEditingCommentId(undefined);
      setEditingDraft('');
    } catch (error) {
      showToast(
        getCommunityErrorMessage(error, '댓글 수정에 실패했습니다.'),
        'error',
      );
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await onDeleteComment(commentId);

      if (editingCommentId === commentId) {
        setEditingCommentId(undefined);
        setEditingDraft('');
      }

      if (replyTargetId === commentId) {
        setReplyTargetId(undefined);
        setReplyDraft('');
      }
    } catch (error) {
      showToast(
        getCommunityErrorMessage(error, '댓글 삭제에 실패했습니다.'),
        'error',
      );
    }
  };

  return (
    <CommunitySectionShell className="gap-250">
      <div className="pb-150">
        <p className="font-designer-24b text-text-strong">
          댓글{' '}
          <span className="font-designer-13r text-text-subtle">
            {commentCount}개
          </span>
        </p>
      </div>

      <CommunityCommentForm
        authorImage={viewerImage}
        placeholder={commentPlaceholder}
        submitLabel="등록하기"
        value={commentDraft}
        disabled={isCommentDisabled}
        onChange={setCommentDraft}
        onSubmit={handleSubmitComment}
      />

      {errorMessage ? (
        <p className="py-300 font-designer-14r text-text-error">
          {errorMessage}
        </p>
      ) : isLoading ? (
        <p className="py-300 font-designer-14r text-text-subtle">
          댓글을 불러오는 중입니다.
        </p>
      ) : comments.length > 0 ? (
        <div className="flex flex-col gap-150">
          {comments.map((comment) => (
            <CommunityCommentItem
              key={comment.id}
              comment={comment}
              viewerImage={viewerImage}
              editingCommentId={editingCommentId}
              editingDraft={editingDraft}
              replyDraft={replyDraft}
              replyTargetId={replyTargetId}
              onCancelEditing={handleCancelEditing}
              onCloseReply={handleCloseReply}
              onDeleteComment={handleDeleteComment}
              onEditingDraftChange={setEditingDraft}
              onOpenReply={handleOpenReply}
              onReplyDraftChange={setReplyDraft}
              onStartEditing={handleStartEditing}
              onSubmitEditedComment={handleSubmitEditedComment}
              onSubmitReply={handleSubmitReply}
              onToggleCommentReaction={onToggleCommentReaction}
            />
          ))}
        </div>
      ) : (
        <p className="py-300 font-designer-14r text-text-subtle">
          아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
        </p>
      )}

      {showPagination && !errorMessage && !isLoading ? (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onChangePage={onChangePage}
        />
      ) : null}
    </CommunitySectionShell>
  );
}
