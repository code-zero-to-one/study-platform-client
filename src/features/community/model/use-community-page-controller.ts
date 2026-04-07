'use client';

import { useQueries } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { startTransition, useEffect, useState } from 'react';
import { getCommunityErrorMessage } from '@/features/community/api/community-api';
import {
  getCommunityQnaErrorMessage,
  getCommunityQnaQuestionDetail,
} from '@/features/community/api/community-qna-api';
import {
  collectCommunityFeedQnaPreviewFallbackIds,
  mergeCommunityFeedQnaPreviewImages,
} from '@/features/community/model/community-feed-preview';
import { mapCommunityQnaQuestionDetailAggregate } from '@/features/community/model/community-qna-api.mapper';
import { useCommunityQnaQuestionListQuery } from '@/features/community/model/use-community-qna-query';
import { useCommunityFeedQuery } from '@/features/community/model/use-community-query';
import { useCommunityViewerQueryScope } from '@/features/community/model/use-community-viewer-query-scope';
import {
  COMMUNITY_BOARD,
  COMMUNITY_FEED_FILTER,
  COMMUNITY_FEED_VIEW,
  type CommunityFeedFilter,
  type CommunityFeedView,
  isCommunityBoard,
} from '@/types/community/domain';
import { COMMUNITY_QNA_QUESTION_STATUS } from '@/types/community/qna-domain';
import {
  scrollToCommunityFeed,
  scrollToCommunityFeedOnFilterChange,
} from './community-feed-scroll';
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

const COMMUNITY_QNA_PREVIEW_QUERY_STALE_TIME = 60_000;
const COMMUNITY_QNA_PREVIEW_QUERY_GC_TIME = 5 * 60_000;
const COMMUNITY_QNA_PREVIEW_QUERY_PARAMS = {
  answerPage: COMMUNITY_DEFAULT_PAGE,
  answerSize: 1,
  questionCommentPage: COMMUNITY_DEFAULT_PAGE,
  questionCommentSize: 1,
} as const;

export const useCommunityPageController = ({
  initialPage,
}: UseCommunityPageControllerParams) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewerQueryScope = useCommunityViewerQueryScope();
  const rawPageParam = searchParams.get('page');
  const rawBoardParam = searchParams.get('board');
  const requestedPage =
    rawPageParam === null
      ? COMMUNITY_DEFAULT_PAGE
      : (normalizeCommunityPageParam(rawPageParam) ?? initialPage);

  const resolveInitialFilter = (): CommunityFeedFilter => {
    if (!rawBoardParam) {
      return COMMUNITY_FEED_FILTER.ALL;
    }

    if (isCommunityBoard(rawBoardParam)) {
      return rawBoardParam as CommunityFeedFilter;
    }

    return COMMUNITY_FEED_FILTER.ALL;
  };

  const [activeFilter, setActiveFilter] =
    useState<CommunityFeedFilter>(resolveInitialFilter);
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
  const qnaPreviewFallbackIds = isQnaFilter
    ? []
    : collectCommunityFeedQnaPreviewFallbackIds([
        ...feed.popularItems,
        ...feed.items,
      ]);
  const qnaPreviewQueries = useQueries({
    queries: qnaPreviewFallbackIds.map((questionId) => ({
      queryKey: [
        'community',
        'qna',
        'question-preview',
        questionId,
        viewerQueryScope,
      ] as const,
      queryFn: async () => {
        const detail = mapCommunityQnaQuestionDetailAggregate(
          await getCommunityQnaQuestionDetail(
            questionId,
            COMMUNITY_QNA_PREVIEW_QUERY_PARAMS,
          ),
        );

        return {
          questionId,
          previewImage: detail.question.previewImage,
          previewImageAlt: detail.question.previewImageAlt,
        };
      },
      staleTime: COMMUNITY_QNA_PREVIEW_QUERY_STALE_TIME,
      gcTime: COMMUNITY_QNA_PREVIEW_QUERY_GC_TIME,
      retry: false,
      enabled: questionId > 0,
    })),
  });
  const qnaPreviewByQuestionId = new Map(
    qnaPreviewQueries.flatMap((query) =>
      query.data ? [[query.data.questionId, query.data] as const] : [],
    ),
  );
  const hydratedFeaturedPosts = isQnaFilter
    ? []
    : mergeCommunityFeedQnaPreviewImages(
        feed.popularItems,
        qnaPreviewByQuestionId,
      );
  const hydratedFeedItems = isQnaFilter
    ? []
    : mergeCommunityFeedQnaPreviewImages(feed.items, qnaPreviewByQuestionId);
  const currentPage = isQnaFilter ? qnaQuestionList.page : feed.page;

  const replaceUrlParams = (
    nextPage: number,
    nextFilter: CommunityFeedFilter,
  ) => {
    const nextSearchParams = new URLSearchParams();
    const normalizedPage = Math.max(nextPage, COMMUNITY_DEFAULT_PAGE);

    if (normalizedPage > COMMUNITY_DEFAULT_PAGE) {
      nextSearchParams.set('page', String(normalizedPage));
    }

    if (
      nextFilter !== COMMUNITY_FEED_FILTER.ALL &&
      isCommunityBoard(nextFilter)
    ) {
      nextSearchParams.set('board', nextFilter);
    }

    const nextQuery = nextSearchParams.toString();

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  };

  useEffect(() => {
    if (rawPageParam === null || rawPageParam === String(currentPage)) {
      return;
    }

    replaceUrlParams(currentPage, activeFilter);
  }, [currentPage, pathname, rawPageParam, router, searchParams, activeFilter]);

  const replacePage = (nextPage: number) => {
    const normalizedPage = Math.max(nextPage, COMMUNITY_DEFAULT_PAGE);

    if (normalizedPage === requestedPage) {
      return false;
    }

    replaceUrlParams(normalizedPage, activeFilter);

    return true;
  };

  const handleFilterChange = (nextFilter: CommunityFeedFilter) => {
    if (nextFilter === activeFilter) {
      return;
    }

    startTransition(() => {
      setActiveFilter(nextFilter);
    });

    replaceUrlParams(COMMUNITY_DEFAULT_PAGE, nextFilter);
    scrollToCommunityFeedOnFilterChange();
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
          ? hydratedFeaturedPosts
          : [],
      filterOptions: COMMUNITY_FEED_FILTER_OPTIONS,
      paginatedPosts: hydratedFeedItems,
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
