import { describe, expect, it } from 'vitest';
import { shouldScrollToCommunityFeedOnFilterChange } from '@/features/community/model/community-feed-scroll';

describe('community-feed-scroll', () => {
  describe('shouldScrollToCommunityFeedOnFilterChange', () => {
    it('does not force-scroll when viewport is already at or above the feed anchor', () => {
      expect(
        shouldScrollToCommunityFeedOnFilterChange({
          feedTop: 305,
          scrollY: 0,
        }),
      ).toBe(false);
      expect(
        shouldScrollToCommunityFeedOnFilterChange({
          feedTop: 305,
          scrollY: 150,
        }),
      ).toBe(false);
      expect(
        shouldScrollToCommunityFeedOnFilterChange({
          feedTop: 305,
          scrollY: 305,
        }),
      ).toBe(false);
    });

    it('scrolls back only when viewport already passed the feed anchor', () => {
      expect(
        shouldScrollToCommunityFeedOnFilterChange({
          feedTop: 305,
          scrollY: 306,
        }),
      ).toBe(true);
    });
  });
});
