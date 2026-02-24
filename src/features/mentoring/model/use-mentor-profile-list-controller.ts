'use client';

import { useMemo, useState } from 'react';
import { useAuthReady } from '@/hooks/common/use-auth';
import { getLowestPriceOption, getMentorSettings } from '@/mocks/mentoring-mock-data';
import type { MentorProfileListProps } from '@/types/mentoring-directory';
import type {
  MentorProfile,
  MentorSortType,
} from '@/types/mentoring-domain';
import { parseMentorProfileListParams } from './mentor-directory-contract';
import { useMentorDirectoryQuery } from './use-mentor-directory-query';

export type MentorProfileListViewState = 'loading' | 'empty' | 'ready';

export interface MentorProfileListControllerState {
  keyword: string;
  sortType: MentorSortType;
}

export interface MentorProfileListControllerActions {
  onKeywordChange: (nextKeyword: string) => void;
  onSortTypeChange: (nextSortType: MentorSortType) => void;
}

export interface MentorProfileListControllerViewModel {
  listState: MentorProfileListViewState;
  shouldShowMentorJoinCard: boolean;
  leadMentors: MentorProfile[];
  remainingMentors: MentorProfile[];
}

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
  const [keyword, setKeyword] = useState(initialParams.initialKeyword);
  const [sortType, setSortType] = useState<MentorSortType>(
    initialParams.initialSortType,
  );
  const { isHydrated: isAuthHydrated, isAuthenticated } = useAuthReady();
  const { mentors, hasHydrated } = useMentorDirectoryQuery();

  const searchedMentors = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return mentors;
    }

    return mentors.filter((mentor) => {
      const mentorSettings = getMentorSettings(mentor);
      const searchableText = [
        mentor.headline,
        mentor.nickname,
        mentor.role,
        mentor.career,
        mentorSettings.jobTitle,
        mentorSettings.careerYears,
        mentorSettings.companyCategory,
        mentorSettings.appealLine,
        mentor.summary,
        mentorSettings.mentoringTitle,
        ...mentorSettings.skillTags,
        ...mentor.tags,
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedKeyword);
    });
  }, [keyword, mentors]);

  const sortedMentors = useMemo(() => {
    return sortMentors(searchedMentors, sortType);
  }, [searchedMentors, sortType]);

  const listState: MentorProfileListViewState = !hasHydrated
    ? 'loading'
    : sortedMentors.length === 0
      ? 'empty'
      : 'ready';

  const shouldShowMentorJoinCard =
    keyword.trim().length === 0 && isAuthHydrated && isAuthenticated;
  const leadMentors = shouldShowMentorJoinCard
    ? sortedMentors.slice(0, 3)
    : sortedMentors;
  const remainingMentors = shouldShowMentorJoinCard
    ? sortedMentors.slice(3)
    : [];

  const handleKeywordChange = (nextKeyword: string) => {
    setKeyword(nextKeyword);
  };
  const handleSortTypeChange = (nextSortType: MentorSortType) => {
    setSortType(nextSortType);
  };

  return {
    state: {
      keyword,
      sortType,
    } satisfies MentorProfileListControllerState,
    actions: {
      onKeywordChange: handleKeywordChange,
      onSortTypeChange: handleSortTypeChange,
    } satisfies MentorProfileListControllerActions,
    viewModel: {
      listState,
      shouldShowMentorJoinCard,
      leadMentors,
      remainingMentors,
    } satisfies MentorProfileListControllerViewModel,
  };
};
