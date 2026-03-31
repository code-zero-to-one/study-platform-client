'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useAuthReady } from '@/features/auth/model/use-auth';
import {
  createCommunityIdempotencyKey,
  getCommunityErrorMessage,
  getCommunityPostRevisionConflictMessage,
  getCommunityWriteContentErrorMessage,
  isCommunityPostRevisionConflictError,
  isCommunityNotFoundError,
} from '@/features/community/api/community-api';
import {
  useCreateCommunityPostMutation,
  useUpdateCommunityPostMutation,
} from '@/features/community/model/use-community-mutation';
import { useCommunityPostDetailQuery } from '@/features/community/model/use-community-query';
import { useToastStore } from '@/stores/use-toast-store';
import {
  COMMUNITY_BOARD,
  type CommunityBoard,
  isCommunityBoard,
} from '@/types/community/domain';
import { registerCommunityMarkdownTrustedImageUrlsFromContent } from '@/types/community/markdown';
import {
  communityWriteSchema,
  type CommunityWriteFormValues,
} from '@/types/schemas/community-write-schema';
import {
  buildCommunityListHref,
  buildCommunityPostHref,
} from './community-route';
import { COMMUNITY_BOARD_OPTIONS } from './community-view-config';

export type CommunityWriteMode = 'create' | 'edit';

interface UseCommunityWriteControllerParams {
  mode: CommunityWriteMode;
  postId?: number;
  returnPage?: number;
}

export const useCommunityWriteController = ({
  mode,
  postId,
  returnPage,
}: UseCommunityWriteControllerParams) => {
  const unsupportedBoardMessage =
    '지원하지 않는 게시판 타입의 글이라 수정할 수 없습니다.';
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const { isAuthenticated, isHydrated } = useAuthReady();
  const createPostMutation = useCreateCommunityPostMutation();
  const updatePostMutation = useUpdateCommunityPostMutation();
  const isEditMode = mode === 'edit';
  const initializedEditablePostIdRef = useRef<number | undefined>(undefined);
  const editablePostQuery = useCommunityPostDetailQuery(
    postId ?? 0,
    isHydrated && isAuthenticated && isEditMode && Boolean(postId),
  );
  const form = useForm<CommunityWriteFormValues>({
    resolver: zodResolver(communityWriteSchema),
    mode: 'onChange',
    defaultValues: {
      board: COMMUNITY_BOARD.FREE,
      title: '',
      content: '',
    },
  });
  const selectedBoard = useWatch({
    control: form.control,
    name: 'board',
  });
  const backHref =
    isEditMode && postId
      ? buildCommunityPostHref(postId, returnPage)
      : buildCommunityListHref(returnPage);

  useEffect(() => {
    if (!isHydrated || isAuthenticated) {
      return;
    }

    router.replace('/login');
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    initializedEditablePostIdRef.current = undefined;
  }, [postId]);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || !isEditMode || !postId) {
      return;
    }

    if (editablePostQuery.isSuccess) {
      if (!editablePostQuery.data.canEdit) {
        router.replace(buildCommunityPostHref(postId, returnPage));

        return;
      }

      if (!isCommunityBoard(editablePostQuery.data.board)) {
        showToast(unsupportedBoardMessage, 'error');
        router.replace(buildCommunityPostHref(postId, returnPage));

        return;
      }

      if (initializedEditablePostIdRef.current === postId) {
        return;
      }

      registerCommunityMarkdownTrustedImageUrlsFromContent(
        editablePostQuery.data.contentHtml ?? '',
      );
      form.reset({
        board: editablePostQuery.data.board,
        title: editablePostQuery.data.title,
        content: editablePostQuery.data.contentHtml ?? '',
      });
      initializedEditablePostIdRef.current = postId;
    }
  }, [
    editablePostQuery.data,
    editablePostQuery.isSuccess,
    form,
    isAuthenticated,
    isEditMode,
    isHydrated,
    postId,
    returnPage,
    router,
    showToast,
  ]);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || !isEditMode || !postId) {
      return;
    }

    if (!editablePostQuery.isError) {
      return;
    }

    if (isCommunityNotFoundError(editablePostQuery.error)) {
      router.replace('/community');

      return;
    }

    showToast(
      getCommunityErrorMessage(
        editablePostQuery.error,
        '글 정보를 불러오지 못했습니다.',
      ),
      'error',
    );
    router.replace(buildCommunityPostHref(postId, returnPage));
  }, [
    editablePostQuery.error,
    editablePostQuery.isError,
    isAuthenticated,
    isEditMode,
    isHydrated,
    postId,
    returnPage,
    router,
    showToast,
  ]);

  const handleBoardChange = (nextBoard: CommunityBoard) => {
    form.setValue('board', nextBoard, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleCancel = () => {
    router.push(backHref);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const request = {
      board: values.board,
      contentHtml: values.content,
      title: values.title,
    };

    form.clearErrors('content');

    try {
      if (isEditMode && postId) {
        const editablePost = editablePostQuery.data;

        if (!editablePost?.revision) {
          return;
        }

        const updatedPost = await updatePostMutation.mutateAsync({
          postId,
          revision: editablePost.revision,
          request,
        });

        showToast('글을 수정했습니다.');
        router.push(buildCommunityPostHref(updatedPost.postId, returnPage));

        return;
      }

      const createdPost = await createPostMutation.mutateAsync({
        request,
        idempotencyKey: createCommunityIdempotencyKey('community-post'),
      });

      showToast('글을 등록했습니다.');
      router.push(buildCommunityPostHref(createdPost.postId, returnPage));
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

      if (isEditMode && postId && isCommunityPostRevisionConflictError(error)) {
        const latestPostQuery = await editablePostQuery.refetch();
        const latestPost = latestPostQuery.data;

        if (latestPost?.canEdit && isCommunityBoard(latestPost.board)) {
          registerCommunityMarkdownTrustedImageUrlsFromContent(
            latestPost.contentHtml ?? '',
          );
          form.reset({
            board: latestPost.board,
            title: latestPost.title,
            content: latestPost.contentHtml ?? '',
          });
          initializedEditablePostIdRef.current = postId;
        }

        if (latestPost?.canEdit && !isCommunityBoard(latestPost.board)) {
          showToast(unsupportedBoardMessage, 'error');
          router.replace(buildCommunityPostHref(postId, returnPage));

          return;
        }

        showToast(getCommunityPostRevisionConflictMessage(), 'error');

        return;
      }

      showToast(
        getCommunityErrorMessage(error, '글 저장에 실패했습니다.'),
        'error',
      );
    }
  });

  const isLoadingEditablePost = isEditMode && editablePostQuery.isPending;
  const isSubmitting =
    form.formState.isSubmitting ||
    createPostMutation.isPending ||
    updatePostMutation.isPending;

  return {
    form,
    state: {
      isAccessReady:
        isHydrated &&
        isAuthenticated &&
        (!isEditMode || Boolean(editablePostQuery.data)),
      isSubmitting,
    },
    actions: {
      handleBoardChange,
      handleCancel,
      handleSubmit,
    },
    viewModel: {
      backHref,
      boardOptions: COMMUNITY_BOARD_OPTIONS,
      contentError: form.formState.errors.content?.message,
      isSubmitDisabled:
        !form.formState.isValid || isSubmitting || isLoadingEditablePost,
      pageDescription: isEditMode ? '글 수정' : '글 작성',
      pageTitle: isEditMode ? '커뮤니티 글 수정' : '커뮤니티 글 작성',
      selectedBoard: selectedBoard ?? COMMUNITY_BOARD.FREE,
      submitLabel: isEditMode ? '수정 완료' : '등록하기',
      titleError: form.formState.errors.title?.message,
    },
  };
};
