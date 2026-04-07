'use client';

import { MoreVertical, PencilLine, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Avatar from '@/components/common/ui/avatar';
import FieldErrorText from '@/components/common/ui/form/field-error-text';
import type { CommunityQnaComment } from '@/types/community/qna-domain';
import CommunityAuthorNameTrigger from './community-author-name-trigger';
import CommunityCommentForm from './community-comment-form';
import { CommunityMemberRoleBadge } from './community-meta-badge';

interface CommunityQnaCommentItemProps {
  comment: CommunityQnaComment;
  viewerImage: string;
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
  viewerImage,
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
  const isEdited = comment.createdAt !== comment.updatedAt;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setIsMenuOpen(false);
    }
  }, [isEditing]);

  return (
    <article className="flex flex-col gap-150">
      <div className="flex items-start gap-150">
        <Avatar
          image={comment.author.profileImageUrl}
          alt={comment.author.name}
          size={36}
        />

        <div className="min-w-0 flex-1">
          <div className="relative flex items-start gap-150">
            <div
              className={cn(
                'min-w-0',
                (comment.viewer.canEdit || comment.viewer.canDelete) &&
                  'pr-500',
              )}
            >
              <div className="flex flex-wrap items-center gap-75">
                <CommunityAuthorNameTrigger
                  memberId={comment.author.memberId}
                  name={comment.author.name}
                  className="font-designer-14b text-text-strong"
                />
                <CommunityMemberRoleBadge role={comment.author.role} />
                <span className="font-designer-13r text-text-subtlest">
                  {comment.createdAt}
                </span>
                {isEdited ? (
                  <span className="font-designer-12m text-text-subtlest">
                    수정됨
                  </span>
                ) : null}
              </div>
            </div>

            {!isEditing &&
            (comment.viewer.canEdit || comment.viewer.canDelete) ? (
              <div className="absolute top-0 right-0">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prevState) => !prevState)}
                  className="rounded-full p-75 text-text-subtle transition-colors hover:bg-fill-neutral-subtle-hover hover:text-text-default"
                  aria-label="댓글 메뉴 열기"
                >
                  <MoreVertical className="h-200 w-200" />
                </button>

                {isMenuOpen ? (
                  <>
                    <button
                      type="button"
                      aria-label="댓글 메뉴 닫기"
                      className="fixed inset-0"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="absolute top-full right-0 z-10 w-max overflow-hidden rounded-150 border border-border-default bg-background-default shadow-3">
                      {comment.viewer.canEdit ? (
                        <button
                          type="button"
                          onClick={() => {
                            onStartEditing(comment.id);
                            setIsMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-100 px-150 py-125 font-designer-13m text-text-default transition-colors hover:bg-fill-neutral-subtle-hover"
                        >
                          <PencilLine className="h-200 w-200" />
                          수정
                        </button>
                      ) : null}
                      {comment.viewer.canDelete ? (
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteComment(comment.id);
                            setIsMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-100 px-150 py-125 font-designer-13m text-text-error transition-colors hover:bg-fill-danger-subtle-default"
                        >
                          <Trash2 className="h-200 w-200" />
                          삭제
                        </button>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>

          {isEditing ? (
            <div className="mt-150 flex flex-col gap-100">
              <CommunityCommentForm
                authorImage={viewerImage}
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
            <p className="mt-75 font-designer-15r leading-300 whitespace-pre-wrap text-text-default">
              {comment.content}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
