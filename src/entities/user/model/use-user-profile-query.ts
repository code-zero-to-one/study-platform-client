import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/entities/user/api/get-user-profile';
import type { GetUserProfileResponse } from '@/entities/user/api/types';

export const useUserProfileQuery = (memberId: number) => {
  return useQuery<GetUserProfileResponse>({
    queryKey: ['userProfile', memberId],
    queryFn: () => getUserProfile(memberId),
    enabled: !!memberId,
    staleTime: 1000 * 60 * 5, // 5분 캐싱 (네 프로젝트 성격 따라 조절)
  });
};
