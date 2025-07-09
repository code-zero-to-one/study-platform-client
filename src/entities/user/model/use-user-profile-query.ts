import { sendGTMEvent } from '@next/third-parties/google';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getStudyDashboard,
  getUserProfile,
  patchAutoMatching,
} from '@/entities/user/api/get-user-profile';
import type {
  GetUserProfileResponse,
  PatchAutoMatchingParams,
} from '@/entities/user/api/types';
import { hashValue } from '@/shared/lib/hash';

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
    onSuccess: (_, variables) => {
      if (variables.autoMatching) {
        sendGTMEvent({
          event_name: 'member_study_toggle_on',
          timestamp: new Date().toISOString(),
          dl_member_id: hashValue(String(variables.memberId)),
        });
      } else {
        sendGTMEvent({
          event_name: 'member_study_toggle_off',
          timestamp: new Date().toISOString(),
          dl_member_id: hashValue(String(variables.memberId)),
        });
      }
    },
  });
};

export const useStudyDashboardQuery = (memberId: number) => {
  return useQuery({
    queryKey: ['studyDashboard', memberId],
    queryFn: () => getStudyDashboard(memberId),
    enabled: !!memberId,
    staleTime: 60 * 1000,
  });
};
