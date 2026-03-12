'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getMentorEntryOnboardingStatus,
  getMentorDetail,
  getMentorList,
  getMentorRegistrationOptions,
  getMyMentorSettings,
} from '@/features/mentoring/api/mentor-api';
import {
  findLocalFallbackMentor,
  getLocalMentorDirectoryPage,
  shouldUseLocalMentorFallback,
} from '@/features/mentoring/model/mentor-directory-local-fallback';
import {
  findLocalMyMentorSettingsFallback,
  getLocalMentorRegistrationOptions,
} from '@/features/mentoring/model/mentor-registration-local-fallback';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import { useUserStore } from '@/stores/useUserStore';
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
  const createdMentors = useMentorDirectoryStore(
    (state) => state.createdMentors,
  );
  const mentorDirectoryQuery = useQuery({
    queryKey: mentorDirectoryQueryKeys.list({
      keyword,
      sortType,
      careerCodes,
      page,
      size,
    }),
    queryFn: async () => {
      try {
        return await getMentorList({
          keyword,
          sortType,
          careerCodes,
          page,
          size,
        });
      } catch (error) {
        if (shouldUseLocalMentorFallback(error)) {
          return getLocalMentorDirectoryPage({
            createdMentors,
            keyword,
            sortType,
            careerCodes,
            page,
            size,
          });
        }

        throw error;
      }
    },
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
  const createdMentors = useMentorDirectoryStore(
    (state) => state.createdMentors,
  );

  return useQuery({
    queryKey: mentorDirectoryQueryKeys.detail(mentorId),
    queryFn: async () => {
      try {
        return await getMentorDetail(mentorId);
      } catch (error) {
        if (shouldUseLocalMentorFallback(error)) {
          const fallbackMentor = findLocalFallbackMentor({
            mentorId,
            createdMentors,
          });

          if (fallbackMentor) {
            return fallbackMentor;
          }
        }

        throw error;
      }
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    enabled,
  });
};

export const useMyMentorSettingsQuery = (enabled = true) => {
  const createdMentors = useMentorDirectoryStore(
    (state) => state.createdMentors,
  );
  const mentorIdByMember = useMentorDirectoryStore(
    (state) => state.mentorIdByMember,
  );
  const memberId = useUserStore((state) => state.memberId ?? undefined);
  const localMentorSignature = memberId
    ? `${memberId}:${mentorIdByMember[memberId] ?? 'none'}:${createdMentors.length}`
    : 'guest';

  return useQuery({
    queryKey: [
      ...mentorDirectoryQueryKeys.mySettings(),
      memberId,
      mentorIdByMember,
      createdMentors,
      localMentorSignature,
    ],
    queryFn: async () => {
      const localFallback = findLocalMyMentorSettingsFallback({
        memberId,
        mentorIdByMember,
        createdMentors,
      });

      try {
        const serverSettings = await getMyMentorSettings();

        if (serverSettings.kind === 'found' || !localFallback) {
          return serverSettings;
        }

        return {
          kind: 'found' as const,
          mentorId: localFallback.mentorId,
          settings: localFallback.settings,
          savedCoreKeywords: localFallback.savedCoreKeywords,
        };
      } catch (error) {
        if (shouldUseLocalMentorFallback(error) && localFallback) {
          return {
            kind: 'found' as const,
            mentorId: localFallback.mentorId,
            settings: localFallback.settings,
            savedCoreKeywords: localFallback.savedCoreKeywords,
          };
        }

        throw error;
      }
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: false,
    enabled,
  });
};

export const useMyMentorProfileQuery = (enabled = true) => {
  const myMentorSettingsQuery = useMyMentorSettingsQuery(enabled);
  const mentorId =
    myMentorSettingsQuery.data?.kind === 'found'
      ? myMentorSettingsQuery.data.mentorId
      : undefined;
  const mentorDetailQuery = useMentorDetailQuery(
    mentorId ?? 0,
    enabled && mentorId !== undefined,
  );

  return {
    mentor: mentorDetailQuery.data,
    mentorId,
    isLoading:
      myMentorSettingsQuery.isLoading ||
      (mentorId !== undefined && mentorDetailQuery.isLoading),
    isError: myMentorSettingsQuery.isError || mentorDetailQuery.isError,
    error: myMentorSettingsQuery.error ?? mentorDetailQuery.error,
    refetch: async () => {
      await myMentorSettingsQuery.refetch();

      if (mentorId !== undefined) {
        await mentorDetailQuery.refetch();
      }
    },
    myMentorSettingsQuery,
    mentorDetailQuery,
  };
};

export const useMentorRegistrationOptionsQuery = (enabled = true) => {
  return useQuery({
    queryKey: mentorDirectoryQueryKeys.registrationOptions(),
    queryFn: async () => {
      try {
        return await getMentorRegistrationOptions();
      } catch (error) {
        if (shouldUseLocalMentorFallback(error)) {
          return getLocalMentorRegistrationOptions();
        }

        throw error;
      }
    },
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
