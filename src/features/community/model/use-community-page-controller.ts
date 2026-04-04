'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
import {
  getCommunityFeedPosts,
  subscribeCommunityPostsChange,
} from './community-post-storage';
import {
  COMMUNITY_DEFAULT_PAGE,
  COMMUNITY_PAGE_SIZE,
  normalizeCommunityPageParam,
} from './community-route';

const FEATURED_POST_LIMIT = 3;

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
    default:
      return posts;
  }
};

const scrollToCommunityFeed = () => {
  document.getElementById('community-feed')?.scrollIntoView({
    block: 'start',
  });
};

interface UseCommunityPageControllerParams {
  initialPage: number;
}

export const useCommunityPageController = ({
  initialPage,
}: UseCommunityPageControllerParams) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<readonly CommunityPost[]>(COMMUNITY_POSTS);
  const [activeFilter, setActiveFilter] = useState<CommunityFeedFilter>(
    COMMUNITY_FEED_FILTER.ALL,
  );
  const [activeView, setActiveView] = useState<CommunityFeedView>(
    COMMUNITY_FEED_VIEW.LIST,
  );
  const rawPageParam = searchParams.get('page') ?? undefined;
  const requestedPage =
    rawPageParam === null
      ? COMMUNITY_DEFAULT_PAGE
      : (normalizeCommunityPageParam(rawPageParam) ?? initialPage);

  const featuredPosts =
    activeFilter === COMMUNITY_FEED_FILTER.ALL
      ? posts.filter((post) => post.isTrending).slice(0, FEATURED_POST_LIMIT)
      : [];
  const featuredPostIds = new Set(featuredPosts.map((post) => post.id));
  const filteredPosts =
    activeFilter === COMMUNITY_FEED_FILTER.ALL
      ? posts.filter((post) => !featuredPostIds.has(post.id))
      : filterPosts(activeFilter, posts);
  const totalPages = Math.max(
    COMMUNITY_DEFAULT_PAGE,
    Math.ceil(filteredPosts.length / COMMUNITY_PAGE_SIZE),
  );
  const currentPage = Math.min(requestedPage, totalPages);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - COMMUNITY_DEFAULT_PAGE) * COMMUNITY_PAGE_SIZE,
    currentPage * COMMUNITY_PAGE_SIZE,
  );
  const postCount = filteredPosts.length + featuredPosts.length;
  const showPagination = totalPages > COMMUNITY_DEFAULT_PAGE;

  useEffect(() => {
    setPosts(getCommunityFeedPosts());

    return subscribeCommunityPostsChange(() => {
      setPosts(getCommunityFeedPosts());
    });
  }, []);

  useEffect(() => {
    if (rawPageParam === null || rawPageParam === String(currentPage)) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set('page', String(currentPage));
    const nextQuery = nextSearchParams.toString();

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [currentPage, pathname, rawPageParam, router, searchParams]);

  const replacePage = (nextPage: number) => {
    const normalizedPage = Math.min(
      Math.max(nextPage, COMMUNITY_DEFAULT_PAGE),
      totalPages,
    );

    if (normalizedPage === currentPage) {
      return false;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set('page', String(normalizedPage));
    const nextQuery = nextSearchParams.toString();

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });

    return true;
  };

  const handleFilterChange = (nextFilter: CommunityFeedFilter) => {
    if (nextFilter === activeFilter) {
      return;
    }

    startTransition(() => {
      setActiveFilter(nextFilter);
    });

    replacePage(COMMUNITY_DEFAULT_PAGE);
    scrollToCommunityFeed();
  };

  const handleViewChange = (nextView: CommunityFeedView) => {
    if (nextView === activeView) {
      return;
    }

    startTransition(() => {
      setActiveView(nextView);
    });
  };

  const handlePageChange = (nextPage: number) => {
    if (!replacePage(nextPage)) {
      return;
    }

    scrollToCommunityFeed();
  };

  return {
    state: {
      activeFilter,
      activeView,
      currentPage,
    },
    actions: {
      handleFilterChange,
      handlePageChange,
      handleViewChange,
    },
    viewModel: {
      currentPage,
      discordUrl: COMMUNITY_DISCORD_URL,
      featuredPosts,
      filterOptions: COMMUNITY_FEED_FILTER_OPTIONS,
      paginatedPosts,
      postCount,
      showPagination,
      totalPages,
      viewOptions: COMMUNITY_FEED_VIEW_OPTIONS,
    },
  };
};
