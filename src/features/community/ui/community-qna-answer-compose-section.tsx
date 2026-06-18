'use client';

import type { ReactNode } from 'react';
import { Controller } from 'react-hook-form';
import ConfirmDeleteModal from '@/components/common/modals/confirm-delete-modal';
import Button from '@/components/common/ui/button';
import FieldErrorText from '@/components/common/ui/form/field-error-text';
import { useCommunityQnaAnswerComposeController } from '@/features/community/model/use-community-qna-answer-compose-controller';
import type {
  CommunityQnaAnswerItem,
  CommunityQnaQuestionViewer,
} from '@/types/community/qna-domain';
import { COMMUNITY_QNA_ANSWER_CONTENT_MAX_VISIBLE_LENGTH } from '@/types/schemas/community-qna-answer-write-schema';
import CommunityMarkdownEditor from './community-markdown-editor';
import CommunitySectionShell from './community-section-shell';

interface CommunityQnaAnswerComposeSectionProps {
  acceptedAnswer?: CommunityQnaAnswerItem;
  answers: readonly CommunityQnaAnswerItem[];
  children: (slots: {
    headerAction: ReactNode;
    myAnswerAction: ReactNode;
    panel: ReactNode;
  }) => ReactNode;
  onRefetchQuestionDetail: () => Promise<unknown>;
  questionId: number;
  viewer?: CommunityQnaQuestionViewer;
}

export default function CommunityQnaAnswerComposeSection({
  acceptedAnswer,
  answers,
  children,
  onRefetchQuestionDetail,
  questionId,
  viewer,
}: CommunityQnaAnswerComposeSectionProps) {
  const { form, state, actions, viewModel } =
    useCommunityQnaAnswerComposeController({
      acceptedAnswer,
      answers,
      onRefetchQuestionDetail,
      questionId,
      viewer,
    });

  const headerAction = viewModel.showComposeButton ? (
    <Button type="button" size="large" onClick={actions.handleOpenComposer}>
      {viewModel.composeButtonLabel}
    </Button>
  ) : null;
  const myAnswerAction = viewModel.showManageActions ? (
    <>
      <Button
        type="button"
        color="outlined"
        size="small"
        onClick={actions.handleStartEdit}
      >
        내 답변 수정
      </Button>
      <Button
        type="button"
        color="secondary"
        size="small"
        onClick={actions.handleRequestDelete}
        disabled={viewModel.isDeleteDisabled}
      >
        내 답변 삭제
      </Button>
    </>
  ) : null;
  const panel = viewModel.showEditor ? (
    <CommunitySectionShell className="gap-250 rounded-200 border border-border-default bg-background-default p-250">
      <form onSubmit={actions.handleSubmit} className="flex flex-col gap-150">
        <Controller
          name="content"
          control={form.control}
          render={({ field }) => (
            <CommunityMarkdownEditor
              value={field.value}
              onChange={field.onChange}
              placeholder="답변 내용을 작성해 주세요."
              visibleTextCounter={{
                maxLength: COMMUNITY_QNA_ANSWER_CONTENT_MAX_VISIBLE_LENGTH,
              }}
            />
          )}
        />
        <FieldErrorText message={viewModel.contentError} />
        <div className="flex flex-wrap justify-end gap-100">
          {viewModel.isEditing ? (
            <Button
              type="button"
              color="outlined"
              size="large"
              onClick={actions.handleCancelEdit}
            >
              취소
            </Button>
          ) : null}
          {!viewModel.isEditing ? (
            <Button
              type="button"
              color="outlined"
              size="large"
              onClick={actions.handleCloseComposer}
            >
              닫기
            </Button>
          ) : null}
          <Button
            type="submit"
            size="large"
            disabled={viewModel.isSubmitDisabled}
            loading={state.isSubmitting}
            loadingText={viewModel.submitLabel}
          >
            {viewModel.submitLabel}
          </Button>
        </div>
      </form>
    </CommunitySectionShell>
  ) : null;

  return (
    <>
      {children({
        headerAction,
        myAnswerAction,
        panel,
      })}
      <ConfirmDeleteModal
        open={state.isDeleteModalOpen}
        onOpenChange={actions.onDeleteModalOpenChange}
        title="이 답변을 삭제할까요?"
        content="삭제된 답변은 질문 상세에서 더 이상 보이지 않습니다."
        confirmText="삭제"
        onConfirm={actions.handleDelete}
      />
    </>
  );
}
