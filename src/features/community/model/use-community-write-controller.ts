'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useUserStore } from '@/stores/useUserStore';
import {
  COMMUNITY_BOARD,
  isCommunityBoard,
  type CommunityBoard,
  type CommunityPost,
} from '@/types/community/domain';
import {
  communityWriteSchema,
  type CommunityWriteFormValues,
} from '@/types/schemas/community-write-schema';
import {
  COMMUNITY_BOARD_OPTIONS,
  COMMUNITY_MOCK_AUTHOR,
} from './community-page-mock-data';
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

export type CommunityWriteMode = 'create' | 'edit';

interface UseCommunityWriteControllerParams {
  initialBoard?: CommunityBoard;
  mode: CommunityWriteMode;
  postId?: number;
  returnPage?: number;
}

const resolveInitialBoard = (initialBoard?: CommunityBoard) =>
  initialBoard && isCommunityBoard(initialBoard)
    ? initialBoard
    : COMMUNITY_BOARD.FREE;

export const useCommunityWriteController = ({
  initialBoard,
  mode,
  postId,
  returnPage,
}: UseCommunityWriteControllerParams) => {
  const router = useRouter();
  const {
    isAuthenticated,
    isHydrated,
    memberId: authMemberId,
  } = useAuthReady();
  const nickname = useUserStore((state) => state.nickname);
  const profileImageUrl = useUserStore((state) => state.profileImageUrl);
  const form = useForm<CommunityWriteFormValues>({
    resolver: zodResolver(communityWriteSchema),
    mode: 'onChange',
    defaultValues: {
      board: resolveInitialBoard(initialBoard),
      title: '',
      content: '',
    },
  });
  const isEditMode = mode === 'edit';
  const editablePost = useMemo(
    () =>
      isEditMode && typeof postId === 'number'
        ? findCommunityLocalPostById(postId)
        : undefined,
    [isEditMode, postId],
  );
  const selectedBoard = useWatch({
    control: form.control,
    name: 'board',
  });
  const isAccessReady =
    isHydrated &&
    isAuthenticated &&
    (!isEditMode ||
      Boolean(
        typeof postId === 'number' &&
          authMemberId &&
          editablePost &&
          isCommunityPostOwnedByMember(editablePost, authMemberId),
      ));
  const backHref =
    isEditMode && postId
      ? buildCommunityPostHref(postId, returnPage)
      : buildCommunityListHref(returnPage);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated || !authMemberId) {
      router.replace('/login');

      return;
    }

    if (!isEditMode || !postId) {
      return;
    }

    const targetPost = editablePost;

    if (!targetPost) {
      router.replace('/community');

      return;
    }

    if (!isCommunityPostOwnedByMember(targetPost, authMemberId)) {
      router.replace(buildCommunityPostHref(postId, returnPage));

      return;
    }

    form.reset({
      board: isCommunityBoard(targetPost.board)
        ? targetPost.board
        : COMMUNITY_BOARD.FREE,
      title: targetPost.title,
      content: targetPost.contentHtml ?? targetPost.content.join('\n\n'),
    });
  }, [
    authMemberId,
    editablePost,
    form,
    isAuthenticated,
    isEditMode,
    isHydrated,
    postId,
    returnPage,
    router,
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

  const handleSubmit = form.handleSubmit((values) => {
    const summary = createCommunityPostSummary(values.content);
    const previewImage = extractCommunityPostPreviewImage(values.content);
    const previewImageAlt = previewImage
      ? `${values.title} 미리보기 이미지`
      : undefined;

    if (isEditMode && postId) {
      const targetPost = editablePost;

      if (
        !targetPost ||
        !isCommunityPostOwnedByMember(targetPost, authMemberId)
      ) {
        router.replace(
          targetPost
            ? buildCommunityPostHref(postId, returnPage)
            : '/community',
        );

        return;
      }

      const nextPost: CommunityPost = {
        ...targetPost,
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
  });

  return {
    form,
    state: {
      isAccessReady,
      isSubmitting: form.formState.isSubmitting,
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
      isSubmitDisabled: !form.formState.isValid || form.formState.isSubmitting,
      pageDescription: isEditMode ? '글 수정' : '글 작성',
      pageTitle: isEditMode ? '커뮤니티 글 수정' : '커뮤니티 글 작성',
      selectedBoard: selectedBoard ?? COMMUNITY_BOARD.FREE,
      submitLabel: isEditMode ? '수정 완료' : '등록하기',
      titleError: form.formState.errors.title?.message,
    },
  };
};
