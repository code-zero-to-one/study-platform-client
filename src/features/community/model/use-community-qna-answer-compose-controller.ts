'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getCommunityWriteContentErrorMessage } from '@/features/community/api/community-api';
import {
  createCommunityQnaIdempotencyKey,
  getCommunityQnaAccessDeniedMessage,
  getCommunityQnaAnswerRevisionConflictMessage,
  getCommunityQnaAuthRequiredMessage,
  getCommunityQnaDuplicateAnswerConflictMessage,
  getCommunityQnaErrorMessage,
  getCommunityQnaIdempotencyConflictMessage,
  isCommunityQnaAccessDeniedError,
  isCommunityQnaAuthRequiredError,
  isCommunityQnaConflictError,
  isCommunityQnaDuplicateAnswerConflictError,
  isCommunityQnaIdempotencyConflictError,
  isCommunityQnaNotFoundError,
} from '@/features/community/api/community-qna-api';
import {
  useCreateCommunityQnaAnswerMutation,
  useDeleteCommunityQnaAnswerMutation,
  useUpdateCommunityQnaAnswerMutation,
} from '@/features/community/model/use-community-qna-mutation';
import { useToastStore } from '@/stores/use-toast-store';
import type {
  CommunityQnaAnswerItem,
  CommunityQnaQuestionViewer,
} from '@/types/community/qna-domain';
import {
  communityQnaAnswerWriteSchema,
  type CommunityQnaAnswerWriteFormValues,
} from '@/types/schemas/community-qna-answer-write-schema';

interface UseCommunityQnaAnswerComposeControllerParams {
  answers: readonly CommunityQnaAnswerItem[];
  onRefetchQuestionDetail: () => Promise<unknown>;
  questionId: number;
  viewer?: CommunityQnaQuestionViewer;
}

export const useCommunityQnaAnswerComposeController = ({
  answers,
  onRefetchQuestionDetail,
  questionId,
  viewer,
}: UseCommunityQnaAnswerComposeControllerParams) => {
  const showToast = useToastStore((state) => state.showToast);
  const createAnswerMutation = useCreateCommunityQnaAnswerMutation();
  const updateAnswerMutation = useUpdateCommunityQnaAnswerMutation();
  const deleteAnswerMutation = useDeleteCommunityQnaAnswerMutation();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const form = useForm<CommunityQnaAnswerWriteFormValues>({
    resolver: zodResolver(communityQnaAnswerWriteSchema),
    mode: 'onChange',
    defaultValues: {
      content: '',
    },
  });
  const myAnswer = viewer?.myAnswerId
    ? answers.find((answer) => answer.id === viewer.myAnswerId)
    : undefined;
  const hasMyAnswer = Boolean(viewer?.myAnswerId);
  const isMyAnswerVisible = Boolean(myAnswer);
  const canCreateAnswer = Boolean(viewer?.canCreateAnswer) && !hasMyAnswer;

  useEffect(() => {
    if (isEditing && myAnswer) {
      form.reset({
        content: myAnswer.contentHtml,
      });

      return;
    }

    if (hasMyAnswer) {
      form.reset({
        content: '',
      });
    }
  }, [form, hasMyAnswer, isEditing, myAnswer]);

  useEffect(() => {
    if (!hasMyAnswer) {
      setIsEditing(false);
      setIsDeleteModalOpen(false);
    }
  }, [hasMyAnswer]);

  useEffect(() => {
    if (!canCreateAnswer) {
      setIsComposerOpen(false);
    }
  }, [canCreateAnswer]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const request = {
      contentHtml: values.content,
    };

    form.clearErrors('content');

    try {
      if (isEditing && myAnswer) {
        await updateAnswerMutation.mutateAsync({
          questionId,
          answerId: myAnswer.id,
          revision: myAnswer.revision,
          request,
        });

        await onRefetchQuestionDetail();
        setIsEditing(false);
        showToast('답변을 수정했습니다.');

        return;
      }

      await createAnswerMutation.mutateAsync({
        questionId,
        request,
        idempotencyKey: createCommunityQnaIdempotencyKey('community-answer'),
      });

      await onRefetchQuestionDetail();
      setIsComposerOpen(false);
      form.reset({
        content: '',
      });
      showToast('답변을 등록했습니다.');
    } catch (error) {
      const contentErrorMessage = getCommunityWriteContentErrorMessage(error);

      if (contentErrorMessage) {
        form.setError('content', {
          type: 'server',
          message: contentErrorMessage,
        });
        form.setFocus('content');

        return;
      }

      if (isCommunityQnaAuthRequiredError(error)) {
        showToast(
          getCommunityQnaAuthRequiredMessage(
            isEditing ? '답변을 수정' : '답변을 작성',
          ),
          'info',
        );

        return;
      }

      if (isCommunityQnaAccessDeniedError(error)) {
        await onRefetchQuestionDetail();
        showToast(
          getCommunityQnaAccessDeniedMessage(
            isEditing ? '답변을 수정' : '답변을 작성',
          ),
          'error',
        );

        return;
      }

      if (!isEditing && isCommunityQnaDuplicateAnswerConflictError(error)) {
        await onRefetchQuestionDetail();
        form.reset({
          content: '',
        });
        showToast(getCommunityQnaDuplicateAnswerConflictMessage(), 'info');

        return;
      }

      if (!isEditing && isCommunityQnaIdempotencyConflictError(error)) {
        await onRefetchQuestionDetail();
        showToast(getCommunityQnaIdempotencyConflictMessage(), 'error');

        return;
      }

      if (isCommunityQnaNotFoundError(error)) {
        await onRefetchQuestionDetail();
        showToast(
          getCommunityQnaErrorMessage(
            error,
            '질문 또는 답변을 찾을 수 없습니다. 최신 상태를 다시 확인해 주세요.',
          ),
          'error',
        );

        return;
      }

      if (isCommunityQnaConflictError(error)) {
        await onRefetchQuestionDetail();

        if (isEditing) {
          setIsEditing(false);
          showToast(getCommunityQnaAnswerRevisionConflictMessage(), 'error');

          return;
        }
      }

      showToast(
        getCommunityQnaErrorMessage(error, '답변 저장에 실패했습니다.'),
        'error',
      );
    }
  });

  const handleDelete = async () => {
    if (!myAnswer) {
      return;
    }

    try {
      await deleteAnswerMutation.mutateAsync({
        questionId,
        answerId: myAnswer.id,
        revision: myAnswer.revision,
      });

      await onRefetchQuestionDetail();
      setIsDeleteModalOpen(false);
      setIsEditing(false);
      form.reset({
        content: '',
      });
      showToast('답변을 삭제했습니다.');
    } catch (error) {
      if (isCommunityQnaAuthRequiredError(error)) {
        showToast(getCommunityQnaAuthRequiredMessage('답변을 삭제'), 'info');

        return;
      }

      if (isCommunityQnaAccessDeniedError(error)) {
        await onRefetchQuestionDetail();
        showToast(getCommunityQnaAccessDeniedMessage('답변을 삭제'), 'error');

        return;
      }

      if (isCommunityQnaNotFoundError(error)) {
        await onRefetchQuestionDetail();
        setIsDeleteModalOpen(false);
        setIsEditing(false);
        form.reset({
          content: '',
        });
        showToast(
          '질문 또는 답변을 찾을 수 없습니다. 최신 상태를 다시 확인해 주세요.',
          'error',
        );

        return;
      }

      if (isCommunityQnaConflictError(error)) {
        await onRefetchQuestionDetail();
        setIsDeleteModalOpen(false);
        setIsEditing(false);
        form.reset({
          content: '',
        });
        showToast(getCommunityQnaAnswerRevisionConflictMessage(), 'error');

        return;
      }

      showToast(
        getCommunityQnaErrorMessage(error, '답변 삭제에 실패했습니다.'),
        'error',
      );
    }
  };

  const handleStartEdit = () => {
    if (!myAnswer) {
      return;
    }

    setIsComposerOpen(false);
    form.reset({
      content: myAnswer.contentHtml,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    form.reset({
      content: '',
    });
  };

  const isSubmitting =
    form.formState.isSubmitting ||
    createAnswerMutation.isPending ||
    updateAnswerMutation.isPending ||
    deleteAnswerMutation.isPending;
  const showEditor = isEditing || (canCreateAnswer && isComposerOpen);

  return {
    form,
    state: {
      isComposerOpen,
      isDeleteModalOpen,
      isSubmitting,
      myAnswer,
    },
    actions: {
      handleCancelEdit,
      handleDelete,
      handleOpenComposer: () => setIsComposerOpen(true),
      handleCloseComposer: () => {
        setIsComposerOpen(false);
        form.reset({
          content: '',
        });
      },
      handleRequestDelete: () => setIsDeleteModalOpen(true),
      handleStartEdit,
      handleSubmit,
      onDeleteModalOpenChange: () => setIsDeleteModalOpen(false),
    },
    viewModel: {
      contentError: form.formState.errors.content?.message,
      canCreateAnswer,
      hasMyAnswer,
      isDeleteDisabled: isSubmitting || !isMyAnswerVisible,
      isEditing,
      isMyAnswerVisible,
      isSubmitDisabled: !form.formState.isValid || isSubmitting,
      showComposeButton: canCreateAnswer && !isComposerOpen && !isEditing,
      sectionDescription: !viewer?.isAuthenticated
        ? '로그인 후 답변을 작성할 수 있습니다.'
        : hasMyAnswer
          ? isMyAnswerVisible
            ? '이미 답변을 작성했습니다. 내 답변 수정 또는 삭제를 진행할 수 있습니다.'
            : '이미 답변을 작성했지만 현재 페이지에 내 답변이 없어 이 화면에서는 수정/삭제할 수 없습니다.'
          : viewer?.canCreateAnswer
            ? '질문을 읽고 바로 답변을 작성해 보세요.'
            : '개발자 등록 사용자만 답변을 작성할 수 있습니다.',
      showEditor,
      showManageActions: hasMyAnswer && isMyAnswerVisible && !isEditing,
      composeButtonLabel: '답변 작성하기',
      submitLabel: isEditing ? '답변 수정' : '답변 등록',
    },
  };
};
