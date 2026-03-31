'use client';

import Button from '@/components/common/ui/button';
import FieldErrorText from '@/components/common/ui/form/field-error-text';
import type { CommunityQnaComment } from '@/types/community/qna-domain';
import CommunityCommentForm from './community-comment-form';
import CommunityQnaAuthorSummary from './community-qna-author-summary';

interface CommunityQnaCommentItemProps {
  comment: CommunityQnaComment;
  editError?: string;
  editingCommentId?: number;
  editingDraft: string;
  isSubmitting?: boolean;
  onCancelEditing: () => void;
  onDeleteComment: (commentId: number) => void;
  onEditingDraftChange: (nextValue: string) => void;
  onStartEditing: (commentId: number) => void;
  onSubmitEditedComment: () => void;
}

export default function CommunityQnaCommentItem({
  comment,
  editError,
  editingCommentId,
  editingDraft,
  isSubmitting = false,
  onCancelEditing,
  onDeleteComment,
  onEditingDraftChange,
  onStartEditing,
  onSubmitEditedComment,
}: CommunityQnaCommentItemProps) {
  const isEditing = editingCommentId === comment.id;

  return (
    <article className="rounded-200 border border-border-subtle bg-background-default p-250">
      <div className="flex flex-col gap-150">
        <div className="flex flex-wrap items-start justify-between gap-150">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-100">
            <CommunityQnaAuthorSummary
              author={comment.author}
              nameClassName="font-designer-16b text-text-strong"
            />
            <span className="font-designer-13r text-text-subtlest">
              {comment.createdAt}
            </span>
          </div>

          {!isEditing &&
          (comment.viewer.canEdit || comment.viewer.canDelete) ? (
            <div className="flex flex-wrap gap-75">
              {comment.viewer.canEdit ? (
                <Button
                  type="button"
                  color="outlined"
                  size="small"
                  onClick={() => onStartEditing(comment.id)}
                >
                  수정
                </Button>
              ) : null}
              {comment.viewer.canDelete ? (
                <Button
                  type="button"
                  color="secondary"
                  size="small"
                  onClick={() => onDeleteComment(comment.id)}
                >
                  삭제
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-100">
            <CommunityCommentForm
              authorImage=""
              placeholder="댓글을 수정해보세요."
              submitLabel="수정 저장"
              value={editingDraft}
              onChange={onEditingDraftChange}
              onSubmit={onSubmitEditedComment}
              onCancel={onCancelEditing}
              autoFocus={true}
              disabled={isSubmitting}
              isCompact={true}
            />
            <FieldErrorText message={editError} />
          </div>
        ) : (
          <p className="font-designer-15r leading-250 whitespace-pre-wrap text-text-default">
            {comment.content}
          </p>
        )}
      </div>
    </article>
  );
}
