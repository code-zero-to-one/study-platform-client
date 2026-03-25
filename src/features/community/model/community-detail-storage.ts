import {
  COMMUNITY_COMMENT_REACTION,
  type CommunityComment,
} from '@/types/community/domain';

const COMMUNITY_DETAIL_STORAGE_KEY = 'zeroone.community.detail-state';

export interface CommunityPostInteraction {
  postId: number;
  reactionCount: number;
  commentCount: number;
  isLikedByViewer: boolean;
  comments: readonly CommunityComment[];
}

const normalizeCommunityComment = (
  value: unknown,
): CommunityComment | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const candidate = value as Partial<CommunityComment>;
  const viewerReaction =
    candidate.viewerReaction === COMMUNITY_COMMENT_REACTION.LIKE ||
    candidate.viewerReaction === COMMUNITY_COMMENT_REACTION.DISLIKE
      ? candidate.viewerReaction
      : undefined;

  if (
    typeof candidate.id !== 'number' ||
    typeof candidate.authorName !== 'string' ||
    typeof candidate.authorImage !== 'string' ||
    typeof candidate.authorRole !== 'string' ||
    typeof candidate.content !== 'string' ||
    typeof candidate.createdAt !== 'string' ||
    typeof candidate.isAuthor !== 'boolean' ||
    (typeof candidate.isEdited !== 'boolean' &&
      typeof candidate.isEdited !== 'undefined') ||
    !Array.isArray(candidate.replies)
  ) {
    return undefined;
  }

  const normalizedReplies = candidate.replies
    .map(normalizeCommunityComment)
    .filter((reply): reply is CommunityComment => Boolean(reply));

  if (normalizedReplies.length !== candidate.replies.length) {
    return undefined;
  }

  return {
    id: candidate.id,
    authorName: candidate.authorName,
    authorImage: candidate.authorImage,
    authorRole: candidate.authorRole,
    content: candidate.content,
    createdAt: candidate.createdAt,
    isAuthor: candidate.isAuthor,
    isEdited: candidate.isEdited,
    likeCount:
      typeof candidate.likeCount === 'number' ? candidate.likeCount : 0,
    dislikeCount:
      typeof candidate.dislikeCount === 'number' ? candidate.dislikeCount : 0,
    viewerReaction,
    replies: normalizedReplies,
  };
};

const normalizeCommunityPostInteraction = (
  value: unknown,
): CommunityPostInteraction | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const candidate = value as Partial<CommunityPostInteraction>;
  const normalizedComments = Array.isArray(candidate.comments)
    ? candidate.comments
        .map(normalizeCommunityComment)
        .filter((comment): comment is CommunityComment => Boolean(comment))
    : undefined;

  if (
    typeof candidate.postId !== 'number' ||
    typeof candidate.reactionCount !== 'number' ||
    typeof candidate.commentCount !== 'number' ||
    typeof candidate.isLikedByViewer !== 'boolean' ||
    !Array.isArray(candidate.comments) ||
    !normalizedComments ||
    normalizedComments.length !== candidate.comments.length
  ) {
    return undefined;
  }

  return {
    postId: candidate.postId,
    reactionCount: candidate.reactionCount,
    commentCount: candidate.commentCount,
    isLikedByViewer: candidate.isLikedByViewer,
    comments: normalizedComments,
  };
};

const readStoredInteractions = (): readonly CommunityPostInteraction[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const rawValue = window.localStorage.getItem(COMMUNITY_DETAIL_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map(normalizeCommunityPostInteraction)
      .filter((interaction): interaction is CommunityPostInteraction =>
        Boolean(interaction),
      );
  } catch {
    return [];
  }
};

const writeStoredInteractions = (
  interactions: readonly CommunityPostInteraction[],
) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    COMMUNITY_DETAIL_STORAGE_KEY,
    JSON.stringify(interactions),
  );
};

export const getCommunityPostInteraction = (postId: number) =>
  readStoredInteractions().find((interaction) => interaction.postId === postId);

export const persistCommunityPostInteraction = (
  nextInteraction: CommunityPostInteraction,
) => {
  const interactions = readStoredInteractions();
  const filteredInteractions = interactions.filter(
    (interaction) => interaction.postId !== nextInteraction.postId,
  );

  writeStoredInteractions([...filteredInteractions, nextInteraction]);
};

export const removeCommunityPostInteraction = (postId: number) => {
  const interactions = readStoredInteractions();
  const filteredInteractions = interactions.filter(
    (interaction) => interaction.postId !== postId,
  );

  if (filteredInteractions.length === interactions.length) {
    return false;
  }

  writeStoredInteractions(filteredInteractions);

  return true;
};
