const COMMUNITY_FEED_ELEMENT_ID = 'community-feed';

interface CommunityFeedScrollState {
  feedTop: number;
  scrollY: number;
}

export const shouldScrollToCommunityFeedOnFilterChange = ({
  feedTop,
  scrollY,
}: CommunityFeedScrollState) => scrollY > feedTop;

const getCommunityFeedTop = () => {
  const feed = document.getElementById(COMMUNITY_FEED_ELEMENT_ID);

  if (!feed) {
    return undefined;
  }

  return feed.getBoundingClientRect().top + window.scrollY;
};

const scrollWindowTo = (top: number) => {
  window.scrollTo({ top });
};

export const scrollToCommunityFeed = () => {
  const feedTop = getCommunityFeedTop();

  if (feedTop === undefined) {
    return false;
  }

  scrollWindowTo(feedTop);
  return true;
};

export const scrollToCommunityFeedOnFilterChange = () => {
  const feedTop = getCommunityFeedTop();

  if (feedTop === undefined) {
    return false;
  }

  if (
    !shouldScrollToCommunityFeedOnFilterChange({
      feedTop,
      scrollY: window.scrollY,
    })
  ) {
    return false;
  }

  scrollWindowTo(feedTop);
  return true;
};
