'use client';

import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '@/api/client/api-error';
import { getMentorSettings } from '@/features/mentoring/model/mentor-profile-utils';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useToastStore } from '@/stores/use-toast-store';
import type { MentorProfileListProps } from '@/types/mentoring/directory-view';
import type { MentorProfile, MentorSortType } from '@/types/mentoring/domain';
import { parseMentorProfileListParams } from './mentor-directory-contract';
import { useMentorDirectoryListQuery } from './use-mentor-directory-query';

export type MentorProfileListViewState = 'loading' | 'empty' | 'ready' | 'error';

export interface MentorProfileListControllerState {
  keyword: string;
  sortType: MentorSortType;
}

export interface MentorProfileListControllerActions {
  onKeywordChange: (nextKeyword: string) => void;
  onSortTypeChange: (nextSortType: MentorSortType) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

export interface MentorProfileListControllerViewModel {
  listState: MentorProfileListViewState;
  errorMessage: string;
  shouldShowMentorJoinCard: boolean;
  currentPage: number;
  totalPages: number;
  showPagination: boolean;
  keywordOptions: string[];
  leadMentors: MentorProfile[];
  remainingMentors: MentorProfile[];
}

const MENTOR_PAGE_SIZE = 12;
const DEFAULT_DIRECTORY_ERROR_MESSAGE =
  '멘토 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';

export const normalizeMentorDirectoryKeyword = (keyword: string | undefined) => {
  return keyword?.trim() ?? '';
};

const getMentorTechnicalKeywords = (mentor: MentorProfile) => {
  const mentorSettings = getMentorSettings(mentor);

  return Array.from(new Set([...mentorSettings.skillTags, ...mentor.tags]))
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);
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
  const [keyword, setKeyword] = useState(() =>
    normalizeMentorDirectoryKeyword(initialParams.initialKeyword),
  );
  const [sortType, setSortType] = useState<MentorSortType>(
    initialParams.initialSortType,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const { isHydrated: isAuthHydrated, isAuthenticated } = useAuthReady();
  const { showToast } = useToastStore();
  const selectedKeyword = normalizeMentorDirectoryKeyword(keyword) || undefined;
  const listSortType = sortType === 'default' ? undefined : sortType;
  const { data, isLoading, isError, error, refetch } =
    useMentorDirectoryListQuery({
      keyword: selectedKeyword,
      sortType: listSortType,
    });
  const mentors = useMemo(() => data ?? [], [data]);

  const errorMessage = useMemo(() => {
    if (error instanceof ApiError && error.message.trim().length > 0) {
      return error.message;
    }

    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }

    return DEFAULT_DIRECTORY_ERROR_MESSAGE;
  }, [error]);

  const keywordOptions = useMemo(() => {
    return Array.from(
      new Set(
        mentors.flatMap((mentor) => getMentorTechnicalKeywords(mentor)),
      ),
    ).sort((first, second) => first.localeCompare(second, 'ko'));
  }, [mentors]);
  const totalPages = Math.max(1, Math.ceil(mentors.length / MENTOR_PAGE_SIZE));

  useEffect(() => {
    setCurrentPage((previousPage) => {
      return Math.min(Math.max(previousPage, 1), totalPages);
    });
  }, [totalPages]);

  const pagedMentors = useMemo(() => {
    const startIndex = (currentPage - 1) * MENTOR_PAGE_SIZE;
    const endIndex = startIndex + MENTOR_PAGE_SIZE;

    return mentors.slice(startIndex, endIndex);
  }, [currentPage, mentors]);

  const listState: MentorProfileListViewState =
    isLoading
      ? 'loading'
      : isError
        ? 'error'
        : data === undefined
          ? 'loading'
        : mentors.length === 0
            ? 'empty'
            : 'ready';

  const shouldShowMentorJoinCard =
    keyword.length === 0 &&
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

  const handleKeywordChange = (nextKeyword: string) => {
    setKeyword(normalizeMentorDirectoryKeyword(nextKeyword));
    setCurrentPage(1);
  };
  const handleSortTypeChange = (nextSortType: MentorSortType) => {
    setSortType(nextSortType);
    setCurrentPage(1);
  };
  const handlePageChange = (nextPage: number) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages));
  };
  const handleRetry = () => {
    refetch({ throwOnError: true }).catch(() => {
      showToast(DEFAULT_DIRECTORY_ERROR_MESSAGE, 'error');
    });
  };

  return {
    state: {
      keyword,
      sortType,
    } satisfies MentorProfileListControllerState,
    actions: {
      onKeywordChange: handleKeywordChange,
      onSortTypeChange: handleSortTypeChange,
      onPageChange: handlePageChange,
      onRetry: handleRetry,
    } satisfies MentorProfileListControllerActions,
    viewModel: {
      listState,
      errorMessage,
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
