import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getUserProfile,
  patchAutoMatching,
} from '@/entities/user/api/get-user-profile';
import type {
  GetUserProfileResponse,
  PatchAutoMatchingParams,
} from '@/entities/user/api/types';

export const useUserProfileQuery = (memberId: number) => {
  return useQuery<GetUserProfileResponse>({
    queryKey: ['userProfile', memberId],
    queryFn: () => getUserProfile(memberId),
    enabled: !!memberId,
    staleTime: 1000 * 60 * 5,
  });
};

export const usePatchAutoMatchingMutation = () => {
  return useMutation<void, unknown, PatchAutoMatchingParams>({
    mutationFn: patchAutoMatching,
  });
};
