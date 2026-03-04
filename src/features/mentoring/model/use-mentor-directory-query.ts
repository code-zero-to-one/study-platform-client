'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getMentorEntryOnboardingStatus,
  getMentorDetail,
  getMentorList,
  getMentorRegistrationOptions,
  getMyMentorSettings,
} from '@/features/mentoring/api/mentor-api';
import type { MentorSortType } from '@/types/mentoring/domain';
import { mentorDirectoryQueryKeys } from './mentor-directory-query-keys';

interface UseMentorDirectoryListQueryParams {
  keyword?: string;
  sortType?: MentorSortType;
  careerCodes?: string[];
  page?: number;
  size?: number;
}

export const useMentorDirectoryListQuery = ({
  keyword,
  sortType,
  careerCodes,
  page,
  size,
}: UseMentorDirectoryListQueryParams = {}) => {
  const mentorDirectoryQuery = useQuery({
    queryKey: mentorDirectoryQueryKeys.list({
      keyword,
      sortType,
      careerCodes,
      page,
      size,
    }),
    queryFn: () =>
      getMentorList({ keyword, sortType, careerCodes, page, size }),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  });

  return {
    data: mentorDirectoryQuery.data,
    isLoading: mentorDirectoryQuery.isLoading,
    isFetching: mentorDirectoryQuery.isFetching,
    isError: mentorDirectoryQuery.isError,
    error: mentorDirectoryQuery.error,
    refetch: mentorDirectoryQuery.refetch,
  };
};

export const useMentorDetailQuery = (mentorId: number, enabled = true) => {
  return useQuery({
    queryKey: mentorDirectoryQueryKeys.detail(mentorId),
    queryFn: () => getMentorDetail(mentorId),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    enabled,
  });
};

export const useMyMentorSettingsQuery = (enabled = true) => {
  return useQuery({
    queryKey: mentorDirectoryQueryKeys.mySettings(),
    queryFn: () => getMyMentorSettings(),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: false,
    enabled,
  });
};

export const useMentorRegistrationOptionsQuery = (enabled = true) => {
  return useQuery({
    queryKey: mentorDirectoryQueryKeys.registrationOptions(),
    queryFn: () => getMentorRegistrationOptions(),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    enabled,
  });
};

export const useMentorEntryOnboardingStatusQuery = (enabled = true) => {
  return useQuery({
    queryKey: mentorDirectoryQueryKeys.entryOnboarding(),
    queryFn: () => getMentorEntryOnboardingStatus(),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    enabled,
  });
};
