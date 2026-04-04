'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { startTransition, useEffect, useState } from 'react';
import { getCommunityErrorMessage } from '@/features/community/api/community-api';
import { getCommunityQnaErrorMessage } from '@/features/community/api/community-qna-api';
import { useCommunityQnaQuestionListQuery } from '@/features/community/model/use-community-qna-query';
import { useCommunityFeedQuery } from '@/features/community/model/use-community-query';
import {
  COMMUNITY_BOARD,
  COMMUNITY_FEED_FILTER,
  COMMUNITY_FEED_VIEW,
  type CommunityFeedFilter,
  type CommunityFeedView,
} from '@/types/community/domain';
import { COMMUNITY_QNA_QUESTION_STATUS } from '@/types/community/qna-domain';
import {
  COMMUNITY_DEFAULT_PAGE,
  COMMUNITY_PAGE_SIZE,
  buildCommunityWriteHref,
  normalizeCommunityPageParam,
} from './community-route';
import {
  COMMUNITY_DISCORD_URL,
  COMMUNITY_FEED_FILTER_OPTIONS,
  COMMUNITY_FEED_VIEW_OPTIONS,
} from './community-view-config';

const scrollToCommunityFeed = () => {
  document.getElementById('community-feed')?.scrollIntoView({
    block: 'start',
  });
};

interface UseCommunityPageControllerParams {
  initialPage: number;
}

const toCommunityApiBoardFilter = (
  filter: CommunityFeedFilter,
): 'all' | 'achievement' | 'free' | 'knowledge' | 'qna' => {
  switch (filter) {
    case COMMUNITY_FEED_FILTER.QNA:
    case COMMUNITY_FEED_FILTER.FREE:
    case COMMUNITY_FEED_FILTER.ACHIEVEMENT:
    case COMMUNITY_FEED_FILTER.KNOWLEDGE:
      return filter;
    default:
      return 'all';
  }
};

export const useCommunityPageController = ({
  initialPage,
}: UseCommunityPageControllerParams) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawPageParam = searchParams.get('page');
  const requestedPage =
    rawPageParam === null
      ? COMMUNITY_DEFAULT_PAGE
      : (normalizeCommunityPageParam(rawPageParam) ?? initialPage);

  const [activeFilter, setActiveFilter] = useState<CommunityFeedFilter>(
    COMMUNITY_FEED_FILTER.ALL,
  );
  const [activeView, setActiveView] = useState<CommunityFeedView>(
    COMMUNITY_FEED_VIEW.LIST,
  );
  const isQnaFilter = activeFilter === COMMUNITY_FEED_FILTER.QNA;

  const feedQuery = useCommunityFeedQuery(
    {
      board: toCommunityApiBoardFilter(activeFilter),
      page: requestedPage,
      size: COMMUNITY_PAGE_SIZE,
    },
    !isQnaFilter,
  );
  const qnaQuestionListQuery = useCommunityQnaQuestionListQuery(
    {
      page: requestedPage,
      size: COMMUNITY_PAGE_SIZE,
      status: COMMUNITY_QNA_QUESTION_STATUS.ALL,
    },
    isQnaFilter,
  );

  const feed = feedQuery.data ?? {
    popularItems: [],
    items: [],
    page: requestedPage,
    size: COMMUNITY_PAGE_SIZE,
    totalElements: 0,
    totalPages: COMMUNITY_DEFAULT_PAGE,
    hasNext: false,
    hasPrevious: false,
    totalPostCount: 0,
  };
  const qnaQuestionList = qnaQuestionListQuery.data ?? {
    items: [],
    page: requestedPage,
    size: COMMUNITY_PAGE_SIZE,
    totalElements: 0,
    totalPages: COMMUNITY_DEFAULT_PAGE,
    hasNext: false,
    hasPrevious: false,
  };
  const currentPage = isQnaFilter ? qnaQuestionList.page : feed.page;

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
    const normalizedPage = Math.max(nextPage, COMMUNITY_DEFAULT_PAGE);

    if (normalizedPage === requestedPage) {
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
      errorMessage: isQnaFilter
        ? qnaQuestionListQuery.isError
          ? getCommunityQnaErrorMessage(
              qnaQuestionListQuery.error,
              '질문 목록을 불러오지 못했습니다.',
            )
          : ''
        : feedQuery.isError
          ? getCommunityErrorMessage(
              feedQuery.error,
              '커뮤니티 글 목록을 불러오지 못했습니다.',
            )
          : '',
      isLoading: isQnaFilter
        ? qnaQuestionListQuery.isPending
        : feedQuery.isPending,
    },
    actions: {
      handleFilterChange,
      handlePageChange,
      handleViewChange,
    },
    viewModel: {
      currentPage,
      discordUrl: COMMUNITY_DISCORD_URL,
      isQnaFilter,
      featuredPosts:
        !isQnaFilter &&
        activeFilter === COMMUNITY_FEED_FILTER.ALL &&
        currentPage === COMMUNITY_DEFAULT_PAGE
          ? feed.popularItems
          : [],
      filterOptions: COMMUNITY_FEED_FILTER_OPTIONS,
      paginatedPosts: isQnaFilter ? [] : feed.items,
      qnaQuestions: isQnaFilter ? qnaQuestionList.items : [],
      postCount: isQnaFilter
        ? qnaQuestionList.totalElements
        : feed.totalPostCount,
      showPagination: isQnaFilter
        ? qnaQuestionList.totalPages > COMMUNITY_DEFAULT_PAGE
        : feed.totalPages > COMMUNITY_DEFAULT_PAGE,
      totalPages: Math.max(
        isQnaFilter ? qnaQuestionList.totalPages : feed.totalPages,
        COMMUNITY_DEFAULT_PAGE,
      ),
      viewOptions: COMMUNITY_FEED_VIEW_OPTIONS,
      writeHref: buildCommunityWriteHref(
        currentPage,
        isQnaFilter ? COMMUNITY_BOARD.QNA : undefined,
      ),
      writeLabel: '글 작성하기',
    },
  };
};
