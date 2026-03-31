"use client";

import { MessageCircle } from "lucide-react";
import ConfirmDeleteModal from "@/components/common/modals/confirm-delete-modal";
import Button from "@/components/common/ui/button";
import FieldErrorText from "@/components/common/ui/form/field-error-text";
import Pagination from "@/components/common/ui/pagination";
import { useCommunityQnaAnswerCommentsController } from "@/features/community/model/use-community-qna-answer-comments-controller";
import type { CommunityQnaAnswerItem } from "@/types/community/qna-domain";
import CommunityCommentForm from "./community-comment-form";
import CommunityQnaCommentItem from "./community-qna-comment-item";

interface CommunityQnaAnswerCommentsSectionProps {
  answer: CommunityQnaAnswerItem;
  onRefetchQuestionDetail: () => Promise<unknown>;
  questionId: number;
}

export default function CommunityQnaAnswerCommentsSection({
  answer,
  onRefetchQuestionDetail,
  questionId,
}: CommunityQnaAnswerCommentsSectionProps) {
  const { state, actions, viewModel } = useCommunityQnaAnswerCommentsController(
    {
      answer,
      onRefetchQuestionDetail,
      questionId,
    },
  );

  return (
    <>
      <div className="flex flex-col gap-200 border-t border-border-subtle pt-150">
        <button
          type="button"
          onClick={actions.handleToggleExpanded}
          className="inline-flex w-fit items-center gap-75 font-designer-14m text-text-subtle transition-colors hover:text-text-brand"
        >
          <MessageCircle className="h-16 w-16" />
          {viewModel.commentCount > 0 ? (
            <span>댓글 {viewModel.commentCount}</span>
          ) : (
            <span>댓글 달기</span>
          )}
        </button>

        {state.isExpanded ? (
          <div className="flex flex-col gap-150 rounded-200 bg-fill-static-default p-200">
            {answer.viewer.canComment ? (
              <div className="flex flex-col gap-100">
                <CommunityCommentForm
                  authorImage=""
                  placeholder="이 답변에 댓글을 남겨보세요."
                  submitLabel="댓글 등록"
                  value={viewModel.createDraft}
                  onChange={actions.handleCreateDraftChange}
                  onSubmit={actions.handleSubmitComment}
                  disabled={state.isSubmitting}
                  isCompact={true}
                />
                <FieldErrorText message={viewModel.createError} />
              </div>
            ) : (
              <p className="font-designer-14r text-text-subtle">
                로그인 후 답변 댓글을 작성할 수 있습니다.
              </p>
            )}

            {state.isLoading ? (
              <div className="rounded-200 border border-border-subtle bg-background-default p-250">
                <p className="font-designer-14r text-text-subtle">
                  답변 댓글을 불러오는 중입니다.
                </p>
              </div>
            ) : viewModel.errorMessage ? (
              <div className="flex flex-col gap-150 rounded-200 border border-border-subtle bg-background-default p-250">
                <p className="font-designer-14r text-text-subtle">
                  {viewModel.errorMessage}
                </p>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    color="secondary"
                    size="small"
                    onClick={actions.handleRetryLoadComments}
                  >
                    다시 시도
                  </Button>
                </div>
              </div>
            ) : state.comments.length === 0 ? (
              <div className="rounded-200 border border-border-subtle bg-background-default p-250">
                <p className="font-designer-14r text-text-subtle">
                  아직 답변 댓글이 없습니다.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-150">
                {state.comments.map((comment) => (
                  <CommunityQnaCommentItem
                    key={comment.id}
                    comment={comment}
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

            {viewModel.showPagination ? (
              <Pagination
                page={state.currentPage}
                totalPages={state.totalPages}
                onChangePage={actions.handleChangePage}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <ConfirmDeleteModal
        open={Boolean(state.deletingCommentId)}
        onOpenChange={actions.onDeleteModalOpenChange}
        title="이 답변 댓글을 삭제할까요?"
        content="삭제된 답변 댓글은 더 이상 보이지 않습니다."
        confirmText="삭제"
        onConfirm={actions.handleConfirmDeleteComment}
      />
    </>
  );
}
