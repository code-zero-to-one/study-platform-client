'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { getCommunityWriteContentErrorMessage } from '@/features/community/api/community-api';
import {
  createCommunityQnaIdempotencyKey,
  getCommunityQnaAccessDeniedMessage,
  getCommunityQnaAuthRequiredMessage,
  getCommunityQnaErrorMessage,
  getCommunityQnaIdempotencyConflictMessage,
  getCommunityQnaQuestionRevisionConflictMessage,
  isCommunityQnaAccessDeniedError,
  isCommunityQnaAuthRequiredError,
  isCommunityQnaConflictError,
  isCommunityQnaIdempotencyConflictError,
  isCommunityQnaNotFoundError,
  isCommunityQnaQuestionRevisionConflictError,
} from '@/features/community/api/community-qna-api';
import {
  useCreateCommunityQnaQuestionMutation,
  useUpdateCommunityQnaQuestionMutation,
} from '@/features/community/model/use-community-qna-mutation';
import { useCommunityQnaQuestionDetailQuery } from '@/features/community/model/use-community-qna-query';
import { useToastStore } from '@/stores/use-toast-store';
import { registerCommunityMarkdownTrustedImageUrlsFromContent } from '@/types/community/markdown';
import {
  communityQnaQuestionWriteSchema,
  type CommunityQnaQuestionWriteFormValues,
} from '@/types/schemas/community-qna-question-write-schema';
import {
  buildCommunityListHref,
  buildCommunityQuestionHref,
} from './community-route';

export type CommunityQnaQuestionWriteMode = 'create' | 'edit';

interface UseCommunityQnaQuestionWriteControllerParams {
  mode: CommunityQnaQuestionWriteMode;
  questionId?: number;
  returnPage?: number;
}

const COMMUNITY_QNA_EDIT_DETAIL_DEFAULT_PAGE = 1;
const COMMUNITY_QNA_EDIT_DETAIL_PAGE_SIZE = 1;

export const useCommunityQnaQuestionWriteController = ({
  mode,
  questionId,
  returnPage,
}: UseCommunityQnaQuestionWriteControllerParams) => {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const { isAuthenticated, isHydrated } = useAuthReady();
  const createQuestionMutation = useCreateCommunityQnaQuestionMutation();
  const updateQuestionMutation = useUpdateCommunityQnaQuestionMutation();
  const isEditMode = mode === 'edit';
  const initializedEditableQuestionIdRef = useRef<number | undefined>(
    undefined,
  );
  const editableQuestionQuery = useCommunityQnaQuestionDetailQuery(
    {
      questionId: questionId ?? 0,
      answerPage: COMMUNITY_QNA_EDIT_DETAIL_DEFAULT_PAGE,
      answerSize: COMMUNITY_QNA_EDIT_DETAIL_PAGE_SIZE,
      commentPage: COMMUNITY_QNA_EDIT_DETAIL_DEFAULT_PAGE,
      commentSize: COMMUNITY_QNA_EDIT_DETAIL_PAGE_SIZE,
    },
    isHydrated && isAuthenticated && isEditMode && Boolean(questionId),
  );
  const form = useForm<CommunityQnaQuestionWriteFormValues>({
    resolver: zodResolver(communityQnaQuestionWriteSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      content: '',
    },
  });
  const backHref =
    isEditMode && questionId
      ? buildCommunityQuestionHref(questionId, returnPage)
      : buildCommunityListHref(returnPage);

  useEffect(() => {
    if (!isHydrated || isAuthenticated) {
      return;
    }

    router.replace('/login');
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    initializedEditableQuestionIdRef.current = undefined;
  }, [questionId]);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || !isEditMode || !questionId) {
      return;
    }

    if (!editableQuestionQuery.isSuccess) {
      return;
    }

    if (!editableQuestionQuery.data.viewer.canEditQuestion) {
      router.replace(buildCommunityQuestionHref(questionId, returnPage));

      return;
    }

    if (initializedEditableQuestionIdRef.current === questionId) {
      return;
    }

    registerCommunityMarkdownTrustedImageUrlsFromContent(
      editableQuestionQuery.data.question.contentHtml ?? '',
    );
    form.reset({
      title: editableQuestionQuery.data.question.title,
      content: editableQuestionQuery.data.question.contentHtml ?? '',
    });
    initializedEditableQuestionIdRef.current = questionId;
  }, [
    editableQuestionQuery.data,
    editableQuestionQuery.isSuccess,
    form,
    isAuthenticated,
    isEditMode,
    isHydrated,
    questionId,
    returnPage,
    router,
  ]);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || !isEditMode || !questionId) {
      return;
    }

    if (!editableQuestionQuery.isError) {
      return;
    }

    if (isCommunityQnaNotFoundError(editableQuestionQuery.error)) {
      router.replace('/community');

      return;
    }

    showToast(
      getCommunityQnaErrorMessage(
        editableQuestionQuery.error,
        '질문 정보를 불러오지 못했습니다.',
      ),
      'error',
    );
    router.replace(buildCommunityQuestionHref(questionId, returnPage));
  }, [
    editableQuestionQuery.error,
    editableQuestionQuery.isError,
    isAuthenticated,
    isEditMode,
    isHydrated,
    questionId,
    returnPage,
    router,
    showToast,
  ]);

  const handleCancel = () => {
    router.push(backHref);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const request = {
      title: values.title,
      contentHtml: values.content,
    };

    form.clearErrors('content');

    try {
      if (isEditMode && questionId) {
        const editableQuestion = editableQuestionQuery.data?.question;

        if (!editableQuestion?.revision) {
          return;
        }

        const updatedQuestion = await updateQuestionMutation.mutateAsync({
          questionId,
          revision: editableQuestion.revision,
          request,
        });

        router.push(buildCommunityQuestionHref(updatedQuestion.id, returnPage));

        return;
      }

      const createdQuestion = await createQuestionMutation.mutateAsync({
        request,
        idempotencyKey: createCommunityQnaIdempotencyKey('community-question'),
      });

      router.push(buildCommunityQuestionHref(createdQuestion.id, returnPage));
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
            isEditMode ? '질문을 수정' : '질문을 작성',
          ),
          'info',
        );
        router.replace('/login');

        return;
      }

      if (isCommunityQnaAccessDeniedError(error)) {
        showToast(
          getCommunityQnaAccessDeniedMessage(
            isEditMode ? '질문을 수정' : '질문을 작성',
          ),
          'error',
        );
        router.replace(backHref);

        return;
      }

      if (isEditMode && questionId && isCommunityQnaNotFoundError(error)) {
        showToast('질문을 찾을 수 없습니다.', 'error');
        router.replace('/community');

        return;
      }

      if (
        isEditMode &&
        questionId &&
        (isCommunityQnaQuestionRevisionConflictError(error) ||
          isCommunityQnaConflictError(error))
      ) {
        const latestQuestionQuery = await editableQuestionQuery.refetch();
        const latestQuestion = latestQuestionQuery.data;

        if (latestQuestion?.viewer.canEditQuestion) {
          registerCommunityMarkdownTrustedImageUrlsFromContent(
            latestQuestion.question.contentHtml ?? '',
          );
          form.reset({
            title: latestQuestion.question.title,
            content: latestQuestion.question.contentHtml ?? '',
          });
          initializedEditableQuestionIdRef.current = questionId;
        }

        showToast(getCommunityQnaQuestionRevisionConflictMessage(), 'error');

        return;
      }

      if (!isEditMode && isCommunityQnaIdempotencyConflictError(error)) {
        showToast(getCommunityQnaIdempotencyConflictMessage(), 'error');

        return;
      }

      showToast(
        getCommunityQnaErrorMessage(error, '질문 저장에 실패했습니다.'),
        'error',
      );
    }
  });

  const isLoadingEditableQuestion =
    isEditMode && editableQuestionQuery.isPending;
  const isSubmitting =
    form.formState.isSubmitting ||
    createQuestionMutation.isPending ||
    updateQuestionMutation.isPending;

  return {
    form,
    state: {
      isAccessReady:
        isHydrated &&
        isAuthenticated &&
        (!isEditMode || Boolean(editableQuestionQuery.data)),
      isSubmitting,
    },
    actions: {
      handleCancel,
      handleSubmit,
    },
    viewModel: {
      backHref,
      contentError: form.formState.errors.content?.message,
      isSubmitDisabled:
        !form.formState.isValid || isSubmitting || isLoadingEditableQuestion,
      pageDescription: isEditMode ? '질문 수정' : '질문 작성',
      pageTitle: isEditMode ? '커뮤니티 질문 수정' : '커뮤니티 질문 작성',
      submitLabel: isEditMode ? '수정 완료' : '등록하기',
      titleError: form.formState.errors.title?.message,
    },
  };
};
