'use client';

import { MessageCircle } from 'lucide-react';
import ConfirmDeleteModal from '@/components/common/modals/confirm-delete-modal';
import FieldErrorText from '@/components/common/ui/form/field-error-text';
import Pagination from '@/components/common/ui/pagination';
import { useCommunityQnaQuestionCommentsController } from '@/features/community/model/use-community-qna-question-comments-controller';
import type {
  CommunityQnaComment,
  CommunityQnaQuestionViewer,
} from '@/types/community/qna-domain';
import CommunityCommentForm from './community-comment-form';
import CommunityQnaCommentItem from './community-qna-comment-item';

interface CommunityQnaQuestionCommentsSectionProps {
  comments: readonly CommunityQnaComment[];
  commentCount: number;
  currentPage: number;
  onChangePage: (page: number) => void;
  onRefetchQuestionDetail: () => Promise<unknown>;
  questionId: number;
  showPagination: boolean;
  totalPages: number;
  viewer?: CommunityQnaQuestionViewer;
  viewerImage: string;
}

export default function CommunityQnaQuestionCommentsSection({
  comments,
  commentCount,
  currentPage,
  onChangePage,
  onRefetchQuestionDetail,
  questionId,
  showPagination,
  totalPages,
  viewer,
  viewerImage,
}: CommunityQnaQuestionCommentsSectionProps) {
  const { state, actions, viewModel } =
    useCommunityQnaQuestionCommentsController({
      comments,
      currentPage,
      onRefetchQuestionDetail,
      questionId,
      viewer,
    });

  return (
    <>
      <div className="flex flex-col gap-200">
        <button
          type="button"
          onClick={actions.handleToggleExpanded}
          className="inline-flex w-fit items-center gap-75 font-designer-14m text-text-subtle transition-colors hover:text-text-brand"
        >
          <MessageCircle className="h-200 w-200" />
          {commentCount > 0 ? (
            <span>댓글 {commentCount}</span>
          ) : (
            <span>댓글 달기</span>
          )}
        </button>

        {state.isExpanded ? (
          <div className="flex flex-col gap-250">
            {viewer?.isAuthenticated ? (
              <div className="flex flex-col gap-100">
                <CommunityCommentForm
                  authorImage={viewerImage}
                  placeholder="질문에 대한 댓글을 남겨보세요."
                  submitLabel="댓글 등록"
                  value={viewModel.createDraft}
                  onChange={actions.handleCreateDraftChange}
                  onSubmit={actions.handleSubmitComment}
                  disabled={state.isSubmitting}
                />
                <FieldErrorText message={viewModel.createError} />
              </div>
            ) : (
              <p className="py-300 font-designer-14r text-text-subtle">
                로그인 후 질문 댓글을 작성할 수 있습니다.
              </p>
            )}

            {comments.length === 0 ? (
              <p className="py-300 font-designer-14r text-text-subtle">
                아직 질문 댓글이 없습니다. 첫 댓글을 남겨보세요.
              </p>
            ) : (
              <div className="flex flex-col gap-150">
                {comments.map((comment) => (
                  <CommunityQnaCommentItem
                    key={comment.id}
                    comment={comment}
                    viewerImage={viewerImage}
                    editError={
                      state.editingCommentId === comment.id
                        ? viewModel.editError
                        : undefined
                    }
                    editingCommentId={state.editingCommentId}
                    editingDraft={viewModel.editingDraft}
                    isSubmitting={state.isSubmitting}
                    onCancelEditing={actions.handleCancelEditingComment}
                    onDeleteComment={actions.handleRequestDeleteComment}
                    onEditingDraftChange={actions.handleEditDraftChange}
                    onStartEditing={actions.handleStartEditingComment}
                    onSubmitEditedComment={actions.handleSubmitEditedComment}
                  />
                ))}
              </div>
            )}

            {showPagination ? (
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onChangePage={onChangePage}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <ConfirmDeleteModal
        open={Boolean(state.deletingCommentId)}
        onOpenChange={actions.onDeleteModalOpenChange}
        title="이 질문 댓글을 삭제할까요?"
        content="삭제된 질문 댓글은 더 이상 보이지 않습니다."
        confirmText="삭제"
        onConfirm={actions.handleConfirmDeleteComment}
      />
    </>
  );
}
