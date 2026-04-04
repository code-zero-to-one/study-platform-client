'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useAuthReady } from '@/features/auth/model/use-auth';
import {
  createCommunityIdempotencyKey,
  getCommunityErrorMessage,
  getCommunityPostRevisionConflictMessage,
  getCommunityWriteContentErrorMessage,
  isCommunityNotFoundError,
  isCommunityPostRevisionConflictError,
} from '@/features/community/api/community-api';
import {
  useCreateCommunityPostMutation,
  useUpdateCommunityPostMutation,
} from '@/features/community/model/use-community-mutation';
import { useCommunityPostDetailQuery } from '@/features/community/model/use-community-query';
import { useToastStore } from '@/stores/use-toast-store';
import { useUserStore } from '@/stores/useUserStore';
import {
  COMMUNITY_BOARD,
  isCommunityBoard,
  type CommunityBoard,
  type CommunityPost,
} from '@/types/community/domain';
import { registerCommunityMarkdownTrustedImageUrlsFromContent } from '@/types/community/markdown';
import {
  communityWriteSchema,
  type CommunityWriteFormValues,
} from '@/types/schemas/community-write-schema';
import { COMMUNITY_MOCK_AUTHOR } from './community-page-mock-data';
import { isCommunityPostOwnedByMember } from './community-post-ownership';
import {
  findCommunityLocalPostById,
  getCommunityPostsFromStorage,
  persistCommunityLocalPosts,
  updateCommunityLocalPost,
} from './community-post-storage';
import {
  createCommunityPostSummary,
  extractCommunityPostPreviewImage,
} from './community-rich-content';
import {
  buildCommunityListHref,
  buildCommunityPostHref,
} from './community-route';
import { COMMUNITY_BOARD_OPTIONS } from './community-view-config';

export type CommunityWriteMode = 'create' | 'edit';

interface UseCommunityWriteControllerParams {
  initialBoard?: CommunityBoard;
  mode: CommunityWriteMode;
  postId?: number;
  returnPage?: number;
}

const isGeneralCommunityWriteBoard = (
  board: string,
): board is Exclude<
  CommunityWriteFormValues['board'],
  typeof COMMUNITY_BOARD.QNA
> => isCommunityBoard(board) && board !== COMMUNITY_BOARD.QNA;

const resolveInitialBoard = (
  initialBoard?: CommunityBoard,
): CommunityWriteFormValues['board'] =>
  initialBoard && isCommunityBoard(initialBoard)
    ? initialBoard
    : COMMUNITY_BOARD.FREE;

export const useCommunityWriteController = ({
  initialBoard,
  mode,
  postId,
  returnPage,
}: UseCommunityWriteControllerParams) => {
  const unsupportedBoardMessage =
    '지원하지 않는 게시판 타입의 글이라 수정할 수 없습니다.';
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const {
    isAuthenticated,
    isHydrated,
    memberId: authMemberId,
  } = useAuthReady();
  const nickname = useUserStore((state) => state.nickname);
  const profileImageUrl = useUserStore((state) => state.profileImageUrl);
  const createPostMutation = useCreateCommunityPostMutation();
  const updatePostMutation = useUpdateCommunityPostMutation();
  const isEditMode = mode === 'edit';
  const initializedEditablePostIdRef = useRef<number | undefined>(undefined);
  const form = useForm<CommunityWriteFormValues>({
    resolver: zodResolver(communityWriteSchema),
    mode: 'onChange',
    defaultValues: {
      board: resolveInitialBoard(initialBoard),
      title: '',
      content: '',
    },
  });
  const editableLocalPost = useMemo(
    () =>
      isEditMode && typeof postId === 'number'
        ? findCommunityLocalPostById(postId)
        : undefined,
    [isEditMode, postId],
  );
  const shouldUseRemoteEdit =
    isEditMode &&
    typeof postId === 'number' &&
    !editableLocalPost &&
    isHydrated &&
    isAuthenticated;
  const editableRemotePostQuery = useCommunityPostDetailQuery(
    postId ?? 0,
    shouldUseRemoteEdit,
  );
  const selectedBoard = useWatch({
    control: form.control,
    name: 'board',
  });
  const isLocalEditOwned =
    Boolean(authMemberId) &&
    Boolean(editableLocalPost) &&
    Boolean(
      editableLocalPost &&
        authMemberId &&
        isCommunityPostOwnedByMember(editableLocalPost, authMemberId),
    );
  const isRemoteEditReady =
    editableRemotePostQuery.isSuccess &&
    Boolean(editableRemotePostQuery.data?.canEdit) &&
    Boolean(
      editableRemotePostQuery.data &&
        isGeneralCommunityWriteBoard(editableRemotePostQuery.data.board),
    );
  const isAccessReady =
    isHydrated &&
    isAuthenticated &&
    (!isEditMode || isLocalEditOwned || isRemoteEditReady);
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

    if (!editableLocalPost) {
      return;
    }

    if (
      !authMemberId ||
      !isCommunityPostOwnedByMember(editableLocalPost, authMemberId)
    ) {
      router.replace(buildCommunityPostHref(postId, returnPage));

      return;
    }

    form.reset({
      board: isCommunityBoard(editableLocalPost.board)
        ? editableLocalPost.board
        : COMMUNITY_BOARD.FREE,
      title: editableLocalPost.title,
      content:
        editableLocalPost.contentHtml ?? editableLocalPost.content.join('\n\n'),
    });
  }, [
    authMemberId,
    editableLocalPost,
    form,
    isAuthenticated,
    isEditMode,
    isHydrated,
    postId,
    returnPage,
    router,
  ]);

  useEffect(() => {
    if (!shouldUseRemoteEdit || !postId || !editableRemotePostQuery.isSuccess) {
      return;
    }

    const editableRemotePost = editableRemotePostQuery.data;

    if (!editableRemotePost.canEdit) {
      router.replace(buildCommunityPostHref(postId, returnPage));

      return;
    }

    if (!isGeneralCommunityWriteBoard(editableRemotePost.board)) {
      showToast(unsupportedBoardMessage, 'error');
      router.replace(buildCommunityPostHref(postId, returnPage));

      return;
    }

    if (initializedEditablePostIdRef.current === postId) {
      return;
    }

    registerCommunityMarkdownTrustedImageUrlsFromContent(
      editableRemotePost.contentHtml ?? '',
    );
    form.reset({
      board: editableRemotePost.board,
      title: editableRemotePost.title,
      content: editableRemotePost.contentHtml ?? '',
    });
    initializedEditablePostIdRef.current = postId;
  }, [
    editableRemotePostQuery.data,
    editableRemotePostQuery.isSuccess,
    form,
    postId,
    returnPage,
    router,
    shouldUseRemoteEdit,
    showToast,
  ]);

  useEffect(() => {
    if (!shouldUseRemoteEdit || !postId || !editableRemotePostQuery.isError) {
      return;
    }

    if (isCommunityNotFoundError(editableRemotePostQuery.error)) {
      router.replace('/community');

      return;
    }

    showToast(
      getCommunityErrorMessage(
        editableRemotePostQuery.error,
        '글 정보를 불러오지 못했습니다.',
      ),
      'error',
    );
    router.replace(buildCommunityPostHref(postId, returnPage));
  }, [
    editableRemotePostQuery.error,
    editableRemotePostQuery.isError,
    postId,
    returnPage,
    router,
    shouldUseRemoteEdit,
    showToast,
  ]);

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    form.setValue('board', resolveInitialBoard(initialBoard), {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [form, initialBoard, isEditMode]);

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
    form.clearErrors('content');

    try {
      if (isEditMode && postId) {
        if (editableLocalPost) {
          if (
            !authMemberId ||
            !isCommunityPostOwnedByMember(editableLocalPost, authMemberId)
          ) {
            router.replace(buildCommunityPostHref(postId, returnPage));

            return;
          }

          const summary = createCommunityPostSummary(values.content);
          const previewImage = extractCommunityPostPreviewImage(values.content);
          const previewImageAlt = previewImage
            ? `${values.title} 미리보기 이미지`
            : undefined;
          const nextPost: CommunityPost = {
            ...editableLocalPost,
            board: values.board,
            title: values.title,
            summary,
            content: summary ? [summary] : [],
            contentHtml: values.content,
            previewImage,
            previewImageAlt,
          };

          updateCommunityLocalPost(nextPost);
          router.push(buildCommunityPostHref(postId, returnPage));

          return;
        }

        const editableRemotePost = editableRemotePostQuery.data;

        if (
          !editableRemotePost?.revision ||
          !editableRemotePost.canEdit ||
          !isGeneralCommunityWriteBoard(editableRemotePost.board)
        ) {
          return;
        }

        const updatedPost = await updatePostMutation.mutateAsync({
          postId,
          revision: editableRemotePost.revision,
          request: {
            board: values.board,
            contentHtml: values.content,
            title: values.title,
          },
        });

        showToast('글을 수정했습니다.');
        router.push(buildCommunityPostHref(updatedPost.postId, returnPage));

        return;
      }

      if (values.board !== COMMUNITY_BOARD.QNA) {
        const createdPost = await createPostMutation.mutateAsync({
          request: {
            board: values.board,
            contentHtml: values.content,
            title: values.title,
          },
          idempotencyKey: createCommunityIdempotencyKey('community-post'),
        });

        showToast('글을 등록했습니다.');
        router.push(buildCommunityPostHref(createdPost.postId, returnPage));

        return;
      }

      const summary = createCommunityPostSummary(values.content);
      const previewImage = extractCommunityPostPreviewImage(values.content);
      const previewImageAlt = previewImage
        ? `${values.title} 미리보기 이미지`
        : undefined;
      const nextPostId = Date.now();
      const nextPost: CommunityPost = {
        id: nextPostId,
        origin: 'local',
        board: values.board,
        title: values.title,
        summary,
        content: summary ? [summary] : [],
        contentHtml: values.content,
        previewImage,
        previewImageAlt,
        authorMemberId: authMemberId ?? COMMUNITY_MOCK_AUTHOR.memberId,
        authorName: nickname ?? COMMUNITY_MOCK_AUTHOR.name,
        authorImage: profileImageUrl ?? COMMUNITY_MOCK_AUTHOR.image,
        authorIntro: COMMUNITY_MOCK_AUTHOR.intro,
        role: COMMUNITY_MOCK_AUTHOR.role,
        viewCount: 0,
        reactionCount: 0,
        commentCount: 0,
        createdAt: '방금 전',
        isTrending: false,
      };

      persistCommunityLocalPosts([nextPost, ...getCommunityPostsFromStorage()]);
      router.push(buildCommunityPostHref(nextPostId, returnPage));
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
        const latestPostQuery = await editableRemotePostQuery.refetch();
        const latestPost = latestPostQuery.data;

        if (
          latestPost?.canEdit &&
          isGeneralCommunityWriteBoard(latestPost.board)
        ) {
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

        if (
          latestPost?.canEdit &&
          !isGeneralCommunityWriteBoard(latestPost.board)
        ) {
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

  const isLoadingEditablePost =
    shouldUseRemoteEdit && editableRemotePostQuery.isPending;
  const isSubmitting =
    form.formState.isSubmitting ||
    createPostMutation.isPending ||
    updatePostMutation.isPending;

  return {
    form,
    state: {
      isAccessReady,
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
        !form.formState.isValid ||
        form.formState.isSubmitting ||
        isLoadingEditablePost,
      pageDescription: isEditMode ? '글 수정' : '글 작성',
      pageTitle: isEditMode ? '커뮤니티 글 수정' : '커뮤니티 글 작성',
      selectedBoard: selectedBoard ?? resolveInitialBoard(initialBoard),
      submitLabel: isEditMode ? '수정 완료' : '등록하기',
      titleError: form.formState.errors.title?.message,
    },
  };
};
