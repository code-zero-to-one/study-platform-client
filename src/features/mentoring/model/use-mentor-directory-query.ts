'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
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
}

export const useMentorDirectoryListQuery = ({
  keyword,
  sortType,
}: UseMentorDirectoryListQueryParams = {}) => {
  const mentorDirectoryQuery = useQuery({
    queryKey: mentorDirectoryQueryKeys.list({
      keyword,
      sortType,
    }),
    queryFn: () => getMentorList({ keyword, sortType }),
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
