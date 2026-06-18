import {
  COMMUNITY_BOARD,
  type CommunityBoard,
  type CommunityPostBoard,
  isCommunityBoard,
} from '@/types/community/domain';
import {
  buildCommunityPostHref,
  buildCommunityQuestionHref,
} from './community-route';

export const COMMUNITY_FEED_ITEM_KIND = {
  POST: 'post',
  QNA: 'qna',
} as const;

export type CommunityFeedItemKind =
  (typeof COMMUNITY_FEED_ITEM_KIND)[keyof typeof COMMUNITY_FEED_ITEM_KIND];

export const getCommunityFeedItemKind = (
  board: CommunityPostBoard,
): CommunityFeedItemKind =>
  board === COMMUNITY_BOARD.QNA
    ? COMMUNITY_FEED_ITEM_KIND.QNA
    : COMMUNITY_FEED_ITEM_KIND.POST;

export const buildCommunityFeedItemDetailHref = (
  itemId: number,
  board: CommunityPostBoard,
  page?: number,
  activeFilter?: string,
) => {
  const resolvedBoard: CommunityBoard | undefined =
    activeFilter && isCommunityBoard(activeFilter) ? activeFilter : undefined;

  return getCommunityFeedItemKind(board) === COMMUNITY_FEED_ITEM_KIND.QNA
    ? buildCommunityQuestionHref(itemId, page, resolvedBoard)
    : buildCommunityPostHref(itemId, page, resolvedBoard);
};
