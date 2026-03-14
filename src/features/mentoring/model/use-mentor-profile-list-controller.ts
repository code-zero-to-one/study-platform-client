'use client';

import { useEffect, useMemo, useState } from 'react';
import { getMentorSettings } from '@/features/mentoring/model/mentor-profile-utils';
import { useToastStore } from '@/stores/use-toast-store';
import type { MentorProfileListProps } from '@/types/mentoring/directory-view';
import type { MentorProfile, MentorSortType } from '@/types/mentoring/domain';
import { parseMentorProfileListParams } from './mentor-directory-contract';
import {
  useMentorDirectoryListQuery,
  useMentorRegistrationOptionsQuery,
} from './use-mentor-directory-query';

export type MentorProfileListViewState =
  | 'loading'
  | 'empty'
  | 'ready'
  | 'error';

export interface MentorProfileListControllerState {
  keyword: string;
  sortType: MentorSortType;
  careerCodes: string[];
}

export interface MentorProfileListControllerActions {
  onKeywordChange: (nextKeyword: string) => void;
  onSortTypeChange: (nextSortType: MentorSortType) => void;
  onCareerCodesChange: (nextCareerCodes: string[]) => void;
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
  careerOptions: Array<{
    code: string;
    label: string;
  }>;
  leadMentors: MentorProfile[];
  remainingMentors: MentorProfile[];
}

const MENTOR_PAGE_SIZE = 12;
const DEFAULT_DIRECTORY_ERROR_MESSAGE =
  '멘토 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';

export const normalizeMentorDirectoryKeyword = (
  keyword: string | undefined,
) => {
  return keyword?.trim() ?? '';
};

const normalizeMentorCareerCodes = (careerCodes: string[] | undefined) => {
  if (!careerCodes || careerCodes.length === 0) {
    return [];
  }

  return Array.from(
    new Set(
      careerCodes
        .map((careerCode) => careerCode.trim())
        .filter((careerCode) => careerCode.length > 0),
    ),
  );
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
  initialCareerCodes = [],
}: MentorProfileListProps = {}) => {
  const [initialParams] = useState(() => {
    return parseMentorProfileListParams({
      initialKeyword,
      initialSortType,
      initialCareerCodes,
    });
  });
  const [keyword, setKeyword] = useState(() =>
    normalizeMentorDirectoryKeyword(initialParams.initialKeyword),
  );
  const [sortType, setSortType] = useState<MentorSortType>(
    initialParams.initialSortType,
  );
  const [careerCodes, setCareerCodes] = useState<string[]>(() =>
    normalizeMentorCareerCodes(initialParams.initialCareerCodes),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const { showToast } = useToastStore();
  const selectedKeyword = normalizeMentorDirectoryKeyword(keyword) || undefined;
  const listSortType = sortType === 'default' ? undefined : sortType;
  const normalizedCareerCodes = normalizeMentorCareerCodes(careerCodes);
  const { data, isLoading, isError, error, refetch } =
    useMentorDirectoryListQuery({
      keyword: selectedKeyword,
      sortType: listSortType,
      careerCodes:
        normalizedCareerCodes.length > 0 ? normalizedCareerCodes : undefined,
      page: currentPage - 1,
      size: MENTOR_PAGE_SIZE,
  });
  const mentorRegistrationOptionsQuery =
    useMentorRegistrationOptionsQuery(true);
  const careerOptions = useMemo(() => {
    return (
      mentorRegistrationOptionsQuery.data?.careers
        .filter((career) => career.active)
        .map((career) => ({
          code: career.code,
          label: career.label,
        })) ?? []
    );
  }, [mentorRegistrationOptionsQuery.data?.careers]);
  const validCareerCodeSet = useMemo(() => {
    return new Set(careerOptions.map((careerOption) => careerOption.code));
  }, [careerOptions]);
  const mentors = useMemo(() => data?.mentors ?? [], [data]);

  useEffect(() => {
    if (validCareerCodeSet.size === 0 || normalizedCareerCodes.length === 0) {
      return;
    }

    const filteredCareerCodes = normalizedCareerCodes.filter((careerCode) =>
      validCareerCodeSet.has(careerCode),
    );

    if (filteredCareerCodes.length !== normalizedCareerCodes.length) {
      setCareerCodes(filteredCareerCodes);
    }
  }, [normalizedCareerCodes, validCareerCodeSet]);

  const errorMessage = useMemo(() => {
    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }

    return DEFAULT_DIRECTORY_ERROR_MESSAGE;
  }, [error]);

  const keywordOptions = useMemo(() => {
    return Array.from(
      new Set(mentors.flatMap((mentor) => getMentorTechnicalKeywords(mentor))),
    ).sort((first, second) => first.localeCompare(second, 'ko'));
  }, [mentors]);
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  const shouldShowMentorJoinCard = keyword.length === 0 && currentPage === 1;

  useEffect(() => {
    setCurrentPage((previousPage) => {
      return Math.min(Math.max(previousPage, 1), totalPages);
    });
  }, [totalPages]);

  const listState: MentorProfileListViewState = isLoading
    ? 'loading'
    : isError
      ? 'error'
      : data === undefined
        ? 'loading'
        : mentors.length === 0 && !shouldShowMentorJoinCard
          ? 'empty'
          : 'ready';
  const leadMentors = shouldShowMentorJoinCard ? mentors.slice(0, 3) : mentors;
  const remainingMentors = shouldShowMentorJoinCard ? mentors.slice(3) : [];
  const showPagination = listState === 'ready' && totalPages > 1;

  const handleKeywordChange = (nextKeyword: string) => {
    setKeyword(normalizeMentorDirectoryKeyword(nextKeyword));
    setCurrentPage(1);
  };
  const handleSortTypeChange = (nextSortType: MentorSortType) => {
    setSortType(nextSortType);
    setCurrentPage(1);
  };
  const handleCareerCodesChange = (nextCareerCodes: string[]) => {
    setCareerCodes(normalizeMentorCareerCodes(nextCareerCodes));
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
      careerCodes: normalizedCareerCodes,
    } satisfies MentorProfileListControllerState,
    actions: {
      onKeywordChange: handleKeywordChange,
      onSortTypeChange: handleSortTypeChange,
      onCareerCodesChange: handleCareerCodesChange,
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
      careerOptions,
      leadMentors,
      remainingMentors,
    } satisfies MentorProfileListControllerViewModel,
  };
};
