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
  useCreateCommunityQnaAnswerCommentMutation,
  useDeleteCommunityQnaAnswerCommentMutation,
  useUpdateCommunityQnaAnswerCommentMutation,
} from '@/features/community/model/use-community-qna-mutation';
import { useCommunityQnaAnswerCommentsQuery } from '@/features/community/model/use-community-qna-query';
import { useToastStore } from '@/stores/use-toast-store';
import type { CommunityQnaAnswerItem } from '@/types/community/qna-domain';
import {
  communityQnaCommentWriteSchema,
  type CommunityQnaCommentWriteFormValues,
} from '@/types/schemas/community-qna-comment-write-schema';

const COMMUNITY_QNA_DEFAULT_ANSWER_COMMENT_PAGE = 1;
const COMMUNITY_QNA_DEFAULT_ANSWER_COMMENT_PAGE_SIZE = 10;

interface UseCommunityQnaAnswerCommentsControllerParams {
  answer: CommunityQnaAnswerItem;
  onRefetchQuestionDetail: () => Promise<unknown>;
  questionId: number;
}

export const useCommunityQnaAnswerCommentsController = ({
  answer,
  onRefetchQuestionDetail,
  questionId,
}: UseCommunityQnaAnswerCommentsControllerParams) => {
  const showToast = useToastStore((state) => state.showToast);
  const [currentPage, setCurrentPage] = useState(
    COMMUNITY_QNA_DEFAULT_ANSWER_COMMENT_PAGE,
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | undefined>(
    undefined,
  );
  const [deletingCommentId, setDeletingCommentId] = useState<
    number | undefined
  >(undefined);
  const answerCommentsQuery = useCommunityQnaAnswerCommentsQuery(
    {
      answerId: answer.id,
      page: currentPage,
      size: COMMUNITY_QNA_DEFAULT_ANSWER_COMMENT_PAGE_SIZE,
    },
    isExpanded,
  );
  const comments = answerCommentsQuery.data?.items;
  const createCommentMutation = useCreateCommunityQnaAnswerCommentMutation();
  const updateCommentMutation = useUpdateCommunityQnaAnswerCommentMutation();
  const deleteCommentMutation = useDeleteCommunityQnaAnswerCommentMutation();
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
    ? comments?.find((comment) => comment.id === editingCommentId)
    : undefined;
  const deletingComment = deletingCommentId
    ? comments?.find((comment) => comment.id === deletingCommentId)
    : undefined;
  const totalPages = Math.max(
    answerCommentsQuery.data?.totalPages ??
      COMMUNITY_QNA_DEFAULT_ANSWER_COMMENT_PAGE,
    COMMUNITY_QNA_DEFAULT_ANSWER_COMMENT_PAGE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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

  const refetchAnswerComments = async () => {
    if (!isExpanded) {
      return;
    }

    await answerCommentsQuery.refetch();
  };

  const handleSubmitComment = createForm.handleSubmit(async (values) => {
    if (!answer.viewer.canComment) {
      showToast('로그인 후 답변 댓글을 작성할 수 있습니다.', 'info');

      return;
    }

    try {
      await createCommentMutation.mutateAsync({
        questionId,
        answerId: answer.id,
        request: {
          content: values.content,
        },
        idempotencyKey: createCommunityQnaIdempotencyKey(
          'community-answer-comment',
        ),
      });

      const shouldRefetchCurrentPage =
        currentPage === COMMUNITY_QNA_DEFAULT_ANSWER_COMMENT_PAGE;

      setCurrentPage(COMMUNITY_QNA_DEFAULT_ANSWER_COMMENT_PAGE);
      await onRefetchQuestionDetail();

      if (shouldRefetchCurrentPage) {
        await refetchAnswerComments();
      }

      createForm.reset({
        content: '',
      });
      setIsExpanded(true);
      showToast('답변 댓글을 등록했습니다.');
    } catch (error) {
      if (isCommunityQnaAuthRequiredError(error)) {
        showToast(
          getCommunityQnaAuthRequiredMessage('답변 댓글을 작성'),
          'info',
        );

        return;
      }

      if (isCommunityQnaAccessDeniedError(error)) {
        await Promise.all([onRefetchQuestionDetail(), refetchAnswerComments()]);
        showToast(
          getCommunityQnaAccessDeniedMessage('답변 댓글을 작성'),
          'error',
        );

        return;
      }

      if (isCommunityQnaIdempotencyConflictError(error)) {
        await Promise.all([onRefetchQuestionDetail(), refetchAnswerComments()]);
        showToast(getCommunityQnaIdempotencyConflictMessage(), 'error');

        return;
      }

      if (isCommunityQnaNotFoundError(error)) {
        await Promise.all([onRefetchQuestionDetail(), refetchAnswerComments()]);
        showToast(
          '답변을 찾을 수 없습니다. 최신 상태를 다시 확인해 주세요.',
          'error',
        );

        return;
      }

      showToast(
        getCommunityQnaErrorMessage(error, '답변 댓글 등록에 실패했습니다.'),
        'error',
      );
    }
  });

  const handleStartEditingComment = (commentId: number) => {
    const targetComment = comments?.find((comment) => comment.id === commentId);

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
        answerId: answer.id,
        commentId: editingComment.id,
        revision: editingComment.revision,
        request: {
          content: values.content,
        },
      });

      await refetchAnswerComments();
      setEditingCommentId(undefined);
      editForm.reset({
        content: '',
      });
      showToast('답변 댓글을 수정했습니다.');
    } catch (error) {
      if (isCommunityQnaAuthRequiredError(error)) {
        showToast(
          getCommunityQnaAuthRequiredMessage('답변 댓글을 수정'),
          'info',
        );

        return;
      }

      if (isCommunityQnaAccessDeniedError(error)) {
        await refetchAnswerComments();
        setEditingCommentId(undefined);
        editForm.reset({
          content: '',
        });
        showToast(
          getCommunityQnaAccessDeniedMessage('답변 댓글을 수정'),
          'error',
        );

        return;
      }

      if (isCommunityQnaNotFoundError(error)) {
        await Promise.all([onRefetchQuestionDetail(), refetchAnswerComments()]);
        setEditingCommentId(undefined);
        editForm.reset({
          content: '',
        });
        showToast(
          '답변 댓글을 찾을 수 없습니다. 최신 상태를 다시 확인해 주세요.',
          'error',
        );

        return;
      }

      if (isCommunityQnaConflictError(error)) {
        await refetchAnswerComments();
        setEditingCommentId(undefined);
        editForm.reset({
          content: '',
        });
        showToast(getCommunityQnaCommentRevisionConflictMessage(), 'error');

        return;
      }

      showToast(
        getCommunityQnaErrorMessage(error, '답변 댓글 수정에 실패했습니다.'),
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
        answerId: answer.id,
        commentId: deletingComment.id,
        revision: deletingComment.revision,
      });

      await Promise.all([onRefetchQuestionDetail(), refetchAnswerComments()]);
      setDeletingCommentId(undefined);

      if (editingCommentId === deletingComment.id) {
        setEditingCommentId(undefined);
        editForm.reset({
          content: '',
        });
      }

      showToast('답변 댓글을 삭제했습니다.');
    } catch (error) {
      if (isCommunityQnaAuthRequiredError(error)) {
        showToast(
          getCommunityQnaAuthRequiredMessage('답변 댓글을 삭제'),
          'info',
        );

        return;
      }

      if (isCommunityQnaAccessDeniedError(error)) {
        await Promise.all([onRefetchQuestionDetail(), refetchAnswerComments()]);
        setDeletingCommentId(undefined);
        showToast(
          getCommunityQnaAccessDeniedMessage('답변 댓글을 삭제'),
          'error',
        );

        return;
      }

      if (isCommunityQnaNotFoundError(error)) {
        await Promise.all([onRefetchQuestionDetail(), refetchAnswerComments()]);
        setDeletingCommentId(undefined);

        if (editingCommentId === deletingComment.id) {
          setEditingCommentId(undefined);
          editForm.reset({
            content: '',
          });
        }

        showToast(
          '답변 댓글을 찾을 수 없습니다. 최신 상태를 다시 확인해 주세요.',
          'error',
        );

        return;
      }

      if (isCommunityQnaConflictError(error)) {
        await Promise.all([onRefetchQuestionDetail(), refetchAnswerComments()]);
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
        getCommunityQnaErrorMessage(error, '답변 댓글 삭제에 실패했습니다.'),
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
      comments: comments ?? [],
      currentPage,
      deletingCommentId,
      editingCommentId,
      isExpanded,
      isLoading: answerCommentsQuery.isPending,
      isSubmitting,
      totalPages,
    },
    actions: {
      handleCancelEditingComment,
      handleChangePage: setCurrentPage,
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
      handleRetryLoadComments: () => answerCommentsQuery.refetch(),
      handleStartEditingComment,
      handleSubmitComment,
      handleSubmitEditedComment,
      handleToggleExpanded: () => setIsExpanded((prevState) => !prevState),
      onDeleteModalOpenChange: () => setDeletingCommentId(undefined),
    },
    viewModel: {
      commentCount: answer.stats.commentCount,
      createDraft: createDraft ?? '',
      createError: createForm.formState.errors.content?.message,
      editingDraft: editingDraft ?? '',
      editError: editForm.formState.errors.content?.message,
      errorMessage: answerCommentsQuery.isError
        ? getCommunityQnaErrorMessage(
            answerCommentsQuery.error,
            '답변 댓글을 불러오지 못했습니다.',
          )
        : '',
      isCreateSubmitDisabled:
        !createForm.formState.isValid ||
        isSubmitting ||
        !answer.viewer.canComment,
      isEditSubmitDisabled: !editForm.formState.isValid || isSubmitting,
      showPagination: totalPages > COMMUNITY_QNA_DEFAULT_ANSWER_COMMENT_PAGE,
      sectionDescription: answer.viewer.canComment
        ? '답변에 직접 달린 댓글입니다.'
        : '로그인 후 답변 댓글을 작성할 수 있습니다.',
    },
  };
};
