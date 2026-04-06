import {
  COMMUNITY_BOARD,
  type CommunityPostBoard,
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
) =>
  getCommunityFeedItemKind(board) === COMMUNITY_FEED_ITEM_KIND.QNA
    ? buildCommunityQuestionHref(itemId, page)
    : buildCommunityPostHref(itemId, page);
