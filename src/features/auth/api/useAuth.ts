import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMemberId, getProfileImage } from './auth';
import { authKeys, UserResponse, ProfileResponse } from './auth';
import { getCookie } from '@/shared/api/cookie';

export const useUser = () => {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: getMemberId,
    enabled: !!getCookie('accessToken'), // 토큰이 있을 때만 실행
  });
};

export const useProfile = (memberId?: string) => {
  return useQuery({
    queryKey: authKeys.profile,
    queryFn: () => getProfileImage(memberId!),
    enabled: !!memberId, // memberId가 있을 때만 실행
  });
};

// 초기 데이터 설정을 위한 함수
export const prefetchUserData = async (queryClient: any) => {
  try {
    const userData = await getMemberId();
    queryClient.setQueryData(authKeys.user, userData);

    if (userData.content) {
      const profileData = await getProfileImage(userData.content);
      queryClient.setQueryData(authKeys.profile, profileData);
    }
  } catch (error) {
    console.error('Failed to prefetch user data:', error);
  }
}; 