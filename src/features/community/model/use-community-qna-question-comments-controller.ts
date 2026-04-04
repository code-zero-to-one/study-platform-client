'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  createCommunityQnaIdempotencyKey,
  getCommunityQnaAccessDeniedMessage,
  getCommunityQnaAuthRequiredMessage,
  getCommunityQnaCommentRevisionConflictMessage,
  getCommunityQnaErrorMessage,
  getCommunityQnaIdempotencyConflictMessage,
  isCommunityQnaAccessDeniedError,
  isCommunityQnaAuthRequiredError,
  isCommunityQnaConflictError,
  isCommunityQnaIdempotencyConflictError,
  isCommunityQnaNotFoundError,
} from '@/features/community/api/community-qna-api';
import {
  useCreateCommunityQnaQuestionCommentMutation,
  useDeleteCommunityQnaCommentMutation,
  useUpdateCommunityQnaCommentMutation,
} from '@/features/community/model/use-community-qna-mutation';
import { useToastStore } from '@/stores/use-toast-store';
import type {
  CommunityQnaComment,
  CommunityQnaQuestionViewer,
} from '@/types/community/qna-domain';
import {
  communityQnaCommentWriteSchema,
  type CommunityQnaCommentWriteFormValues,
} from '@/types/schemas/community-qna-comment-write-schema';

interface UseCommunityQnaQuestionCommentsControllerParams {
  comments: readonly CommunityQnaComment[];
  currentPage: number;
  onRefetchQuestionDetail: () => Promise<unknown>;
  questionId: number;
  viewer?: CommunityQnaQuestionViewer;
}

export const useCommunityQnaQuestionCommentsController = ({
  comments,
  currentPage,
  onRefetchQuestionDetail,
  questionId,
  viewer,
}: UseCommunityQnaQuestionCommentsControllerParams) => {
  const showToast = useToastStore((state) => state.showToast);
  const createCommentMutation = useCreateCommunityQnaQuestionCommentMutation();
  const updateCommentMutation = useUpdateCommunityQnaCommentMutation();
  const deleteCommentMutation = useDeleteCommunityQnaCommentMutation();
  const [isExpanded, setIsExpanded] = useState(currentPage > 1);
  const [editingCommentId, setEditingCommentId] = useState<number | undefined>(
    undefined,
  );
  const [deletingCommentId, setDeletingCommentId] = useState<
    number | undefined
  >(undefined);
  const createForm = useForm<CommunityQnaCommentWriteFormValues>({
    resolver: zodResolver(communityQnaCommentWriteSchema),
    mode: 'onChange',
    defaultValues: {
      content: '',
    },
  });
  const editForm = useForm<CommunityQnaCommentWriteFormValues>({
    resolver: zodResolver(communityQnaCommentWriteSchema),
    mode: 'onChange',
    defaultValues: {
      content: '',
    },
  });
  const createDraft = useWatch({
    control: createForm.control,
    name: 'content',
  });
  const editingDraft = useWatch({
    control: editForm.control,
    name: 'content',
  });
  const editingComment = editingCommentId
    ? comments.find((comment) => comment.id === editingCommentId)
    : undefined;
  const deletingComment = deletingCommentId
    ? comments.find((comment) => comment.id === deletingCommentId)
    : undefined;

  useEffect(() => {
    if (currentPage > 1) {
      setIsExpanded(true);
    }
  }, [currentPage]);

  useEffect(() => {
    if (editingCommentId && !editingComment) {
      setEditingCommentId(undefined);
      editForm.reset({
        content: '',
      });
    }

    if (deletingCommentId && !deletingComment) {
      setDeletingCommentId(undefined);
    }
  }, [
    comments,
    deletingComment,
    deletingCommentId,
    editForm,
    editingComment,
    editingCommentId,
  ]);

  const handleSubmitComment = createForm.handleSubmit(async (values) => {
    if (!viewer?.isAuthenticated) {
      showToast('로그인 후 댓글을 작성할 수 있습니다.', 'info');

      return;
    }

    try {
      await createCommentMutation.mutateAsync({
        questionId,
        request: {
          content: values.content,
        },
        idempotencyKey: createCommunityQnaIdempotencyKey(
          'community-question-comment',
        ),
      });

      await onRefetchQuestionDetail();
      createForm.reset({
        content: '',
      });
      setIsExpanded(true);
      showToast('질문 댓글을 등록했습니다.');
    } catch (error) {
      if (isCommunityQnaAuthRequiredError(error)) {
        showToast(
          getCommunityQnaAuthRequiredMessage('질문 댓글을 작성'),
          'info',
        );

        return;
      }

      if (isCommunityQnaAccessDeniedError(error)) {
        await onRefetchQuestionDetail();
        showToast(
          getCommunityQnaAccessDeniedMessage('질문 댓글을 작성'),
          'error',
        );

        return;
      }

      if (isCommunityQnaIdempotencyConflictError(error)) {
        await onRefetchQuestionDetail();
        showToast(getCommunityQnaIdempotencyConflictMessage(), 'error');

        return;
      }

      if (isCommunityQnaNotFoundError(error)) {
        await onRefetchQuestionDetail();
        showToast(
          '질문을 찾을 수 없습니다. 최신 상태를 다시 확인해 주세요.',
          'error',
        );

        return;
      }

      showToast(
        getCommunityQnaErrorMessage(error, '질문 댓글 등록에 실패했습니다.'),
        'error',
      );
    }
  });

  const handleStartEditingComment = (commentId: number) => {
    const targetComment = comments.find((comment) => comment.id === commentId);

    if (!targetComment?.viewer.canEdit) {
      return;
    }

    editForm.reset({
      content: targetComment.content,
    });
    setEditingCommentId(commentId);
    setIsExpanded(true);
  };

  const handleCancelEditingComment = () => {
    setEditingCommentId(undefined);
    editForm.reset({
      content: '',
    });
  };

  const handleSubmitEditedComment = editForm.handleSubmit(async (values) => {
    if (!editingComment) {
      return;
    }

    try {
      await updateCommentMutation.mutateAsync({
        questionId,
        commentId: editingComment.id,
        revision: editingComment.revision,
        request: {
          content: values.content,
        },
      });

      await onRefetchQuestionDetail();
      setEditingCommentId(undefined);
      editForm.reset({
        content: '',
      });
      showToast('질문 댓글을 수정했습니다.');
    } catch (error) {
      if (isCommunityQnaAuthRequiredError(error)) {
        showToast(
          getCommunityQnaAuthRequiredMessage('질문 댓글을 수정'),
          'info',
        );

        return;
      }

      if (isCommunityQnaAccessDeniedError(error)) {
        await onRefetchQuestionDetail();
        setEditingCommentId(undefined);
        editForm.reset({
          content: '',
        });
        showToast(
          getCommunityQnaAccessDeniedMessage('질문 댓글을 수정'),
          'error',
        );

        return;
      }

      if (isCommunityQnaNotFoundError(error)) {
        await onRefetchQuestionDetail();
        setEditingCommentId(undefined);
        editForm.reset({
          content: '',
        });
        showToast(
          '질문 댓글을 찾을 수 없습니다. 최신 상태를 다시 확인해 주세요.',
          'error',
        );

        return;
      }

      if (isCommunityQnaConflictError(error)) {
        await onRefetchQuestionDetail();
        setEditingCommentId(undefined);
        editForm.reset({
          content: '',
        });
        showToast(getCommunityQnaCommentRevisionConflictMessage(), 'error');

        return;
      }

      showToast(
        getCommunityQnaErrorMessage(error, '질문 댓글 수정에 실패했습니다.'),
        'error',
      );
    }
  });

  const handleConfirmDeleteComment = async () => {
    if (!deletingComment) {
      return;
    }

    try {
      await deleteCommentMutation.mutateAsync({
        questionId,
        commentId: deletingComment.id,
        revision: deletingComment.revision,
      });

      await onRefetchQuestionDetail();
      setDeletingCommentId(undefined);

      if (editingCommentId === deletingComment.id) {
        setEditingCommentId(undefined);
        editForm.reset({
          content: '',
        });
      }

      showToast('질문 댓글을 삭제했습니다.');
    } catch (error) {
      if (isCommunityQnaAuthRequiredError(error)) {
        showToast(
          getCommunityQnaAuthRequiredMessage('질문 댓글을 삭제'),
          'info',
        );

        return;
      }

      if (isCommunityQnaAccessDeniedError(error)) {
        await onRefetchQuestionDetail();
        setDeletingCommentId(undefined);
        showToast(
          getCommunityQnaAccessDeniedMessage('질문 댓글을 삭제'),
          'error',
        );

        return;
      }

      if (isCommunityQnaNotFoundError(error)) {
        await onRefetchQuestionDetail();
        setDeletingCommentId(undefined);

        if (editingCommentId === deletingComment.id) {
          setEditingCommentId(undefined);
          editForm.reset({
            content: '',
          });
        }

        showToast(
          '질문 댓글을 찾을 수 없습니다. 최신 상태를 다시 확인해 주세요.',
          'error',
        );

        return;
      }

      if (isCommunityQnaConflictError(error)) {
        await onRefetchQuestionDetail();
        setDeletingCommentId(undefined);

        if (editingCommentId === deletingComment.id) {
          setEditingCommentId(undefined);
          editForm.reset({
            content: '',
          });
        }

        showToast(getCommunityQnaCommentRevisionConflictMessage(), 'error');

        return;
      }

      showToast(
        getCommunityQnaErrorMessage(error, '질문 댓글 삭제에 실패했습니다.'),
        'error',
      );
    }
  };

  const isSubmitting =
    createForm.formState.isSubmitting ||
    editForm.formState.isSubmitting ||
    createCommentMutation.isPending ||
    updateCommentMutation.isPending ||
    deleteCommentMutation.isPending;

  return {
    form: {
      createForm,
      editForm,
    },
    state: {
      deletingCommentId,
      editingCommentId,
      isExpanded,
      isSubmitting,
    },
    actions: {
      handleCancelEditingComment,
      handleConfirmDeleteComment,
      handleCreateDraftChange: (nextValue: string) =>
        createForm.setValue('content', nextValue, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        }),
      handleEditDraftChange: (nextValue: string) =>
        editForm.setValue('content', nextValue, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        }),
      handleRequestDeleteComment: (commentId: number) =>
        setDeletingCommentId(commentId),
      handleStartEditingComment,
      handleSubmitComment,
      handleSubmitEditedComment,
      handleToggleExpanded: () => setIsExpanded((prevState) => !prevState),
      onDeleteModalOpenChange: () => setDeletingCommentId(undefined),
    },
    viewModel: {
      createDraft: createDraft ?? '',
      createError: createForm.formState.errors.content?.message,
      editingDraft: editingDraft ?? '',
      editError: editForm.formState.errors.content?.message,
      isCreateSubmitDisabled:
        !createForm.formState.isValid ||
        isSubmitting ||
        !viewer?.isAuthenticated,
      isEditSubmitDisabled: !editForm.formState.isValid || isSubmitting,
      sectionDescription: viewer?.isAuthenticated
        ? '질문 본문에 직접 달린 댓글입니다.'
        : '로그인 후 질문 댓글을 작성할 수 있습니다.',
    },
  };
};
