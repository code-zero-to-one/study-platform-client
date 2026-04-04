'use client';

import Pagination from '@/components/common/ui/pagination';
import type {
  CommunityComment,
  CommunityCommentReactionSelection,
} from '@/types/community/domain';
import CommunityCommentForm from './community-comment-form';
import CommunityCommentItem from './community-comment-item';
import CommunitySectionShell from './community-section-shell';

interface CommunityCommentSectionProps {
  comments: readonly CommunityComment[];
  commentCount: number;
  commentPlaceholder?: string;
  currentPage: number;
  errorMessage?: string;
  isLoading?: boolean;
  isCommentDisabled?: boolean;
  showPagination: boolean;
  totalPages: number;
  viewerImage: string;
  commentDraft: string;
  editingCommentId?: number;
  editingDraft: string;
  replyDraft: string;
  replyTargetId?: number;
  onCancelEditing: () => void;
  onCloseReply: () => void;
  onCommentDraftChange: (nextValue: string) => void;
  onDeleteComment: (commentId: number) => void;
  onEditingDraftChange: (nextValue: string) => void;
  onOpenReply: (commentId: number) => void;
  onReplyDraftChange: (nextValue: string) => void;
  onStartEditing: (commentId: number) => void;
  onSubmitComment: () => void;
  onSubmitEditedComment: () => void;
  onSubmitReply: () => void;
  onChangePage: (page: number) => void;
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
  isLoading = false,
  isCommentDisabled = false,
  showPagination,
  totalPages,
  viewerImage,
  commentDraft,
  editingCommentId,
  editingDraft,
  replyDraft,
  replyTargetId,
  onCancelEditing,
  onCloseReply,
  onCommentDraftChange,
  onDeleteComment,
  onEditingDraftChange,
  onOpenReply,
  onReplyDraftChange,
  onStartEditing,
  onSubmitComment,
  onSubmitEditedComment,
  onSubmitReply,
  onChangePage,
  onToggleCommentReaction,
}: CommunityCommentSectionProps) {
  return (
    <CommunitySectionShell className="gap-250">
      <div className="border-b border-border-default pb-150">
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
        onChange={onCommentDraftChange}
        onSubmit={onSubmitComment}
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
