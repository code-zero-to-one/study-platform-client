'use client';

import { useQuery } from '@tanstack/react-query';
import { getMentorAvailability } from '@/features/mentoring/api/mentor-api';
import type {
  MentorAvailabilityQueryParams,
  MentoringReservableMethodType,
} from '@/types/mentoring/availability';
import { mentorDirectoryQueryKeys } from './mentor-directory-query-keys';

interface UseMentorAvailabilityQueryParams {
  mentorId: number;
  method?: MentoringReservableMethodType;
  date?: string;
  enabled?: boolean;
}

const toAvailabilityParams = ({
  mentorId,
  method,
  date,
}: {
  mentorId: number;
  method: MentoringReservableMethodType;
  date: string;
}): MentorAvailabilityQueryParams => ({
  mentorId,
  method,
  date,
});

export const useMentorAvailabilityQuery = ({
  mentorId,
  method,
  date,
  enabled = true,
}: UseMentorAvailabilityQueryParams) => {
  const isEnabled =
    enabled &&
    typeof mentorId === 'number' &&
    Number.isFinite(mentorId) &&
    method !== undefined &&
    typeof date === 'string' &&
    date.length > 0;

  const queryParams =
    method && date
      ? toAvailabilityParams({
          mentorId,
          method,
          date,
        })
      : undefined;

  return useQuery({
    queryKey: queryParams
      ? mentorDirectoryQueryKeys.availability(queryParams)
      : [
          ...mentorDirectoryQueryKeys.availabilities(),
          {
            mentorId,
            method: method ?? 'simple',
            date: date ?? '',
          },
        ],
    queryFn: () => {
      if (!queryParams) {
        throw new Error('멘토 예약 가능 시간 조회 파라미터가 올바르지 않습니다.');
      }

      return getMentorAvailability(queryParams);
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    enabled: isEnabled,
  });
};
