'use client';

import { useQuery } from '@tanstack/react-query';
import { getMentoringRequestDetail } from '@/features/mentoring/api/mentoring-lifecycle-api';
import { mentoringLifecycleQueryKeys } from './mentoring-lifecycle-query-keys';

export const useMentoringRequestDetailQuery = (
  requestId: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: mentoringLifecycleQueryKeys.requestDetail(requestId),
    queryFn: () => getMentoringRequestDetail(requestId),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    enabled: enabled && requestId.trim().length > 0,
  });
};
