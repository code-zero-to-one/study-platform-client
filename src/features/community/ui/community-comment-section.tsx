'use client';

import type {
  CommunityComment,
  CommunityCommentReaction,
} from '@/types/community/domain';
import CommunityCommentForm from './community-comment-form';
import CommunityCommentItem from './community-comment-item';
import CommunitySectionShell from './community-section-shell';

interface CommunityCommentSectionProps {
  comments: readonly CommunityComment[];
  commentCount: number;
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
  onToggleCommentReaction: (
    commentId: number,
    nextReaction: CommunityCommentReaction,
  ) => void;
}

export default function CommunityCommentSection({
  comments,
  commentCount,
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
  onToggleCommentReaction,
}: CommunityCommentSectionProps) {
  return (
    <CommunitySectionShell className="gap-250">
      <div className="flex items-end justify-between border-b border-border-subtle pb-150">
        <p className="font-designer-24b text-text-strong">댓글</p>
        <p className="font-designer-13r text-text-subtle">{commentCount}개</p>
      </div>

      <CommunityCommentForm
        authorImage={viewerImage}
        placeholder="댓글을 남겨보세요."
        submitLabel="댓글 등록"
        value={commentDraft}
        onChange={onCommentDraftChange}
        onSubmit={onSubmitComment}
      />

      {comments.length > 0 ? (
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
    </CommunitySectionShell>
  );
}
