'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuthReady } from '@/hooks/common/use-auth';
import { getLowestPriceOption, getMentorSettings } from '@/mocks/mentoring-mock-data';
import type {
  MentorProfile,
  MentorProfileListProps,
  MentorSortType,
} from '@/types/mentoring';
import { parseMentorProfileListParams } from './mentor-directory-contract';
import { useMentorDirectoryQuery } from './use-mentor-directory-query';

export type MentorProfileListViewState = 'loading' | 'empty' | 'ready';

export interface MentorProfileListControllerState {
  keywords: string[];
  sortType: MentorSortType;
}

export interface MentorProfileListControllerActions {
  onKeywordChange: (nextKeywords: string[]) => void;
  onSortTypeChange: (nextSortType: MentorSortType) => void;
  onPageChange: (page: number) => void;
}

export interface MentorProfileListControllerViewModel {
  listState: MentorProfileListViewState;
  shouldShowMentorJoinCard: boolean;
  currentPage: number;
  totalPages: number;
  showPagination: boolean;
  keywordOptions: string[];
  leadMentors: MentorProfile[];
  remainingMentors: MentorProfile[];
}

const MENTOR_PAGE_SIZE = 12;

const sortMentors = (mentors: MentorProfile[], sortType: MentorSortType) => {
  const copiedMentors = [...mentors];

  if (sortType === 'rating') {
    return copiedMentors.sort((first, second) => second.rating - first.rating);
  }

  if (sortType === 'review') {
    return copiedMentors.sort(
      (first, second) => second.reviewCount - first.reviewCount,
    );
  }

  if (sortType === 'low-price') {
    return copiedMentors.sort((first, second) => {
      const firstPrice =
        getLowestPriceOption(first)?.price ?? Number.MAX_SAFE_INTEGER;
      const secondPrice =
        getLowestPriceOption(second)?.price ?? Number.MAX_SAFE_INTEGER;

      return firstPrice - secondPrice;
    });
  }

  return copiedMentors.sort((first, second) => first.priority - second.priority);
};

const getMentorTechnicalKeywords = (mentor: MentorProfile) => {
  const mentorSettings = getMentorSettings(mentor);

  return Array.from(new Set([...mentorSettings.skillTags, ...mentor.tags]))
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);
};

const getSecondTechnicalKeyword = (mentor: MentorProfile) => {
  return getMentorTechnicalKeywords(mentor)[1] ?? '';
};

export const useMentorProfileListController = ({
  initialKeyword = '',
  initialSortType = 'default',
}: MentorProfileListProps = {}) => {
  const [initialParams] = useState(() => {
    return parseMentorProfileListParams({
      initialKeyword,
      initialSortType,
    });
  });
  const [keywords, setKeywords] = useState<string[]>(() => {
    const trimmedKeyword = initialParams.initialKeyword.trim();

    return trimmedKeyword ? [trimmedKeyword] : [];
  });
  const [sortType, setSortType] = useState<MentorSortType>(
    initialParams.initialSortType,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const { isHydrated: isAuthHydrated, isAuthenticated } = useAuthReady();
  const { mentors, hasHydrated } = useMentorDirectoryQuery();
  const keywordOptions = useMemo(() => {
    return Array.from(
      new Set(
        mentors
          .map((mentor) => getSecondTechnicalKeyword(mentor))
          .filter((keyword) => keyword.length > 0),
      ),
    ).sort((first, second) => first.localeCompare(second, 'ko'));
  }, [mentors]);
  const normalizedKeywordSet = useMemo(() => {
    return new Set(keywords.map((keyword) => keyword.toLowerCase()));
  }, [keywords]);

  const searchedMentors = useMemo(() => {
    if (normalizedKeywordSet.size === 0) {
      return mentors;
    }

    return mentors.filter((mentor) => {
      const secondKeyword = getSecondTechnicalKeyword(mentor).toLowerCase();

      return normalizedKeywordSet.has(secondKeyword);
    });
  }, [mentors, normalizedKeywordSet]);

  const sortedMentors = useMemo(() => {
    return sortMentors(searchedMentors, sortType);
  }, [searchedMentors, sortType]);
  const totalPages = Math.max(
    1,
    Math.ceil(sortedMentors.length / MENTOR_PAGE_SIZE),
  );

  useEffect(() => {
    setCurrentPage((previousPage) => {
      return Math.min(Math.max(previousPage, 1), totalPages);
    });
  }, [totalPages]);

  useEffect(() => {
    if (keywords.length === 0) {
      return;
    }

    const keywordOptionSet = new Set(keywordOptions);
    const nextKeywords = keywords.filter((keyword) => {
      return keywordOptionSet.has(keyword);
    });

    if (nextKeywords.length !== keywords.length) {
      setKeywords(nextKeywords);
      setCurrentPage(1);
    }
  }, [keywords, keywordOptions]);

  const pagedMentors = useMemo(() => {
    const startIndex = (currentPage - 1) * MENTOR_PAGE_SIZE;
    const endIndex = startIndex + MENTOR_PAGE_SIZE;

    return sortedMentors.slice(startIndex, endIndex);
  }, [currentPage, sortedMentors]);

  const listState: MentorProfileListViewState = !hasHydrated
    ? 'loading'
    : sortedMentors.length === 0
      ? 'empty'
      : 'ready';

  const shouldShowMentorJoinCard =
    keywords.length === 0 &&
    isAuthHydrated &&
    isAuthenticated &&
    currentPage === 1;
  const leadMentors = shouldShowMentorJoinCard
    ? pagedMentors.slice(0, 3)
    : pagedMentors;
  const remainingMentors = shouldShowMentorJoinCard
    ? pagedMentors.slice(3)
    : [];
  const showPagination = listState === 'ready';

  const handleKeywordChange = (nextKeywords: string[]) => {
    const deduplicatedKeywords = Array.from(
      new Set(
        nextKeywords
          .map((keyword) => keyword.trim())
          .filter((keyword) => keyword.length > 0),
      ),
    );

    setKeywords(deduplicatedKeywords);
    setCurrentPage(1);
  };
  const handleSortTypeChange = (nextSortType: MentorSortType) => {
    setSortType(nextSortType);
    setCurrentPage(1);
  };
  const handlePageChange = (nextPage: number) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return {
    state: {
      keywords,
      sortType,
    } satisfies MentorProfileListControllerState,
    actions: {
      onKeywordChange: handleKeywordChange,
      onSortTypeChange: handleSortTypeChange,
      onPageChange: handlePageChange,
    } satisfies MentorProfileListControllerActions,
    viewModel: {
      listState,
      shouldShowMentorJoinCard,
      currentPage,
      totalPages,
      showPagination,
      keywordOptions,
      leadMentors,
      remainingMentors,
    } satisfies MentorProfileListControllerViewModel,
  };
};
