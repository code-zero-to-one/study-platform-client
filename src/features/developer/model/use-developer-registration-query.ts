'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyDeveloperRegistration,
  updateMyDeveloperRegistration,
} from '@/features/developer/api/developer-registration-api';
import type { UpdateDeveloperRegistrationParams } from '@/types/developer/api-params';

export const developerRegistrationQueryKeys = {
  all: ['developer-registration'] as const,
  me: () => [...developerRegistrationQueryKeys.all, 'me'] as const,
};

export const useMyDeveloperRegistrationQuery = () => {
  return useQuery({
    queryKey: developerRegistrationQueryKeys.me(),
    queryFn: getMyDeveloperRegistration,
    staleTime: 60_000,
  });
};

export const useUpdateMyDeveloperRegistrationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateDeveloperRegistrationParams) =>
      updateMyDeveloperRegistration(params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: developerRegistrationQueryKeys.all,
      });
    },
  });
};
