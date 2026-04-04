'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { useUserStore } from '@/stores/useUserStore';
import {
  COMMUNITY_BOARD,
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
import {
  getCommunityPostsFromStorage,
  persistCommunityLocalPosts,
} from './community-post-storage';
import {
  createCommunityPostSummary,
  extractCommunityPostPreviewImage,
} from './community-rich-content';

export const useCommunityWriteController = () => {
  const router = useRouter();
  const {
    memberId: currentMemberId,
    nickname,
    profileImageUrl,
  } = useUserStore((state) => ({
    memberId: state.memberId,
    nickname: state.nickname,
    profileImageUrl: state.profileImageUrl,
  }));
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

  const handleBoardChange = (nextBoard: CommunityBoard) => {
    form.setValue('board', nextBoard, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleCancel = () => {
    router.push('/community');
  };

  const handleSubmit = form.handleSubmit((values) => {
    const postId = Date.now();
    const summary = createCommunityPostSummary(values.content);
    const previewImage = extractCommunityPostPreviewImage(values.content);

    const nextPost: CommunityPost = {
      id: postId,
      board: values.board,
      title: values.title,
      summary,
      content: summary ? [summary] : [],
      contentHtml: values.content,
      previewImage,
      previewImageAlt: previewImage ? `${values.title} 이미지` : undefined,
      authorMemberId: currentMemberId ?? COMMUNITY_MOCK_AUTHOR.memberId,
      authorName: nickname ?? COMMUNITY_MOCK_AUTHOR.name,
      authorImage: profileImageUrl ?? COMMUNITY_MOCK_AUTHOR.image,
      authorIntro: COMMUNITY_MOCK_AUTHOR.intro,
      role: COMMUNITY_MOCK_AUTHOR.role,
      viewCount: 0,
      reactionCount: 0,
      commentCount: 0,
      createdAt: '방금',
      isTrending: false,
    };

    persistCommunityLocalPosts([nextPost, ...getCommunityPostsFromStorage()]);
    router.push(`/community/${postId}`);
  });

  return {
    form,
    state: {
      isSubmitting: form.formState.isSubmitting,
    },
    actions: {
      handleBoardChange,
      handleCancel,
      handleSubmit,
    },
    viewModel: {
      boardOptions: COMMUNITY_BOARD_OPTIONS,
      isSubmitDisabled: !form.formState.isValid || form.formState.isSubmitting,
      selectedBoard: selectedBoard ?? COMMUNITY_BOARD.FREE,
      titleError: form.formState.errors.title?.message,
      contentError: form.formState.errors.content?.message,
    },
  };
};
