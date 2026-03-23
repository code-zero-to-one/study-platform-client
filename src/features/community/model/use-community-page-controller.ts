'use client';

import { startTransition, useEffect, useState } from 'react';
import {
  COMMUNITY_BOARD,
  COMMUNITY_FEED_FILTER,
  COMMUNITY_FEED_VIEW,
  type CommunityFeedFilter,
  type CommunityFeedView,
  type CommunityPost,
} from '@/types/community/domain';
import {
  COMMUNITY_DISCORD_URL,
  COMMUNITY_FEED_FILTER_OPTIONS,
  COMMUNITY_FEED_VIEW_OPTIONS,
  COMMUNITY_POSTS,
} from './community-page-mock-data';
import { getCommunityFeedPosts } from './community-post-storage';

const filterPosts = (
  activeFilter: CommunityFeedFilter,
  posts: readonly CommunityPost[],
) => {
  switch (activeFilter) {
    case COMMUNITY_FEED_FILTER.QNA:
      return posts.filter((post) => post.board === COMMUNITY_BOARD.QNA);
    case COMMUNITY_FEED_FILTER.FREE:
      return posts.filter((post) => post.board === COMMUNITY_BOARD.FREE);
    case COMMUNITY_FEED_FILTER.ACHIEVEMENT:
      return posts.filter((post) => post.board === COMMUNITY_BOARD.ACHIEVEMENT);
    case COMMUNITY_FEED_FILTER.KNOWLEDGE:
      return posts.filter((post) => post.board === COMMUNITY_BOARD.KNOWLEDGE);
    case COMMUNITY_FEED_FILTER.POPULAR:
      return posts.filter((post) => post.isTrending);
    default:
      return posts;
  }
};

export const useCommunityPageController = () => {
  const [posts, setPosts] = useState<readonly CommunityPost[]>(COMMUNITY_POSTS);
  const [activeFilter, setActiveFilter] = useState<CommunityFeedFilter>(
    COMMUNITY_FEED_FILTER.ALL,
  );
  const [activeView, setActiveView] = useState<CommunityFeedView>(
    COMMUNITY_FEED_VIEW.LIST,
  );

  const visiblePosts = filterPosts(activeFilter, posts);

  useEffect(() => {
    setPosts(getCommunityFeedPosts());
  }, []);

  const handleFilterChange = (nextFilter: CommunityFeedFilter) => {
    if (nextFilter === activeFilter) {
      return;
    }

    startTransition(() => {
      setActiveFilter(nextFilter);
    });
  };

  const handleViewChange = (nextView: CommunityFeedView) => {
    if (nextView === activeView) {
      return;
    }

    startTransition(() => {
      setActiveView(nextView);
    });
  };

  return {
    state: {
      activeFilter,
      activeView,
    },
    actions: {
      handleFilterChange,
      handleViewChange,
    },
    viewModel: {
      discordUrl: COMMUNITY_DISCORD_URL,
      filterOptions: COMMUNITY_FEED_FILTER_OPTIONS,
      viewOptions: COMMUNITY_FEED_VIEW_OPTIONS,
      visiblePosts,
    },
  };
};
