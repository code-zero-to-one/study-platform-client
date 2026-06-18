import { COMMUNITY_BOARD, type CommunityPost } from '@/types/community/domain';

interface CommunityQnaPreviewFallback {
  previewImage?: string;
  previewImageAlt?: string;
}

export const collectCommunityFeedQnaPreviewFallbackIds = (
  posts: readonly CommunityPost[],
) => {
  const questionIds = new Set<number>();

  posts.forEach((post) => {
    if (post.board !== COMMUNITY_BOARD.QNA || post.previewImage) {
      return;
    }

    questionIds.add(post.id);
  });

  return Array.from(questionIds);
};

export const mergeCommunityFeedQnaPreviewImages = (
  posts: readonly CommunityPost[],
  previewByQuestionId: ReadonlyMap<number, CommunityQnaPreviewFallback>,
) =>
  posts.map((post) => {
    if (post.board !== COMMUNITY_BOARD.QNA || post.previewImage) {
      return post;
    }

    const preview = previewByQuestionId.get(post.id);

    if (!preview?.previewImage) {
      return post;
    }

    return {
      ...post,
      previewImage: preview.previewImage,
      previewImageAlt: preview.previewImageAlt ?? post.previewImageAlt,
    };
  });
