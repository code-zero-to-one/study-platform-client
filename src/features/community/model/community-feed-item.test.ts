import { describe, expect, it } from 'vitest';
import {
  buildCommunityFeedItemDetailHref,
  COMMUNITY_FEED_ITEM_KIND,
  getCommunityFeedItemKind,
} from '@/features/community/model/community-feed-item';
import {
  COMMUNITY_BOARD,
  COMMUNITY_UNSUPPORTED_BOARD,
} from '@/types/community/domain';

describe('community-feed-item', () => {
  describe('getCommunityFeedItemKind', () => {
    it('treats qna board as qna item', () => {
      expect(getCommunityFeedItemKind(COMMUNITY_BOARD.QNA)).toBe(
        COMMUNITY_FEED_ITEM_KIND.QNA,
      );
    });

    it('treats general and unsupported boards as post items', () => {
      expect(getCommunityFeedItemKind(COMMUNITY_BOARD.FREE)).toBe(
        COMMUNITY_FEED_ITEM_KIND.POST,
      );
      expect(getCommunityFeedItemKind(COMMUNITY_UNSUPPORTED_BOARD)).toBe(
        COMMUNITY_FEED_ITEM_KIND.POST,
      );
    });
  });

  describe('buildCommunityFeedItemDetailHref', () => {
    it('builds qna detail href for qna feed items', () => {
      expect(buildCommunityFeedItemDetailHref(17, COMMUNITY_BOARD.QNA, 2)).toBe(
        '/community/questions/17?page=2',
      );
    });

    it('builds general post detail href for non-qna feed items', () => {
      expect(
        buildCommunityFeedItemDetailHref(17, COMMUNITY_BOARD.KNOWLEDGE, 2),
      ).toBe('/community/17?page=2');
    });
  });
});
