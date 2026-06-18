import { sendGTMEvent } from '@next/third-parties/google';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getUserProfile,
  patchAutoMatching,
} from '@/api/endpoints/user/get-user-profile';
import type { GetUserProfileResponse } from '@/types/api/user.types';
import { scheduleQueryKeys } from '@/types/schedule/query';
import { hashValue } from '@/utils/hash';

export const useUserProfileQuery = (memberId: number) => {
  return useQuery<GetUserProfileResponse>({
    queryKey: ['userProfile', memberId],
    queryFn: () => getUserProfile(memberId),
    enabled: !!memberId,
    staleTime: 0,
  });
};

export interface PatchAutoMatchingParams {
  memberId: number;
  autoMatching: boolean;
}

export const usePatchAutoMatchingMutation = () => {
  const qc = useQueryClient();

  return useMutation<
    void,
    unknown,
    PatchAutoMatchingParams,
    { prev?: unknown }
  >({
    mutationFn: patchAutoMatching,

    onMutate: async ({ memberId, autoMatching }) => {
      await qc.cancelQueries({ queryKey: ['userProfile', memberId] });
      const prev = qc.getQueryData(['userProfile', memberId]);
      if (prev && typeof prev === 'object') {
        qc.setQueryData(['userProfile', memberId], {
          ...prev,
          autoMatching,
        });
      }

      return { prev };
    },

    onError: (_err, { memberId }, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(['userProfile', memberId], ctx.prev);
      }
    },

    onSuccess: async (_data, { memberId, autoMatching }) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['userProfile', memberId] }),
        qc.invalidateQueries({
          queryKey: scheduleQueryKeys.weeklyParticipations(),
        }),
        qc.invalidateQueries({
          predicate: (q) =>
            Array.isArray(q.queryKey) &&
            q.queryKey[0] === 'weeklyReservationMembers',
        }),
      ]);

      sendGTMEvent({
        event: autoMatching
          ? 'custom_member_study_toggle_on'
          : 'custom_member_study_toggle_off',
        dl_timestamp: new Date().toISOString(),
        dl_member_id: hashValue(String(memberId)),
      });
    },
  });
};
