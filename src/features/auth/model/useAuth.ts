// 데이터 조회(Query) 를 담당하는 커스텀 훅

// cf. useQuery 는 클라이언트 컴포넌트에서 사용하는 React Hook 으로 실시간 데이터 구독, 캐싱, 리렌더링 처리를 담당함
// 한편, prefetchQuery 는 서버컴포넌트에서 사용하는 함수로 데이터를 미리 가져와서 캐시에 저장함

import { useQuery } from '@tanstack/react-query';
import { getCookie } from '@/shared/tanstack-query/cookie';
import { getMemberId, getProfile } from '@/features/auth/api/auth';
import { MemberInfoResponse } from './types';

// 회원 Id 조회
export const useMemberId = () => {
  return useQuery<{ memberId: string }>({
    queryKey: ['member'],
    queryFn: getMemberId,
    enabled: !!getCookie('accessToken'), // 토큰이 있을 때만 실행
  });
};

// 회원 프로필 조회
export const useProfile = (memberId?: string) => {
  return useQuery<MemberInfoResponse>({
    queryKey: ['profile', memberId],
    queryFn: () => getProfile(Number(memberId)),
    enabled: !!memberId, // memberId가 있을 때만 실행
    // staleTime으로 캐시 유효 기간 설정
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 회원 Id 기반 회원 정보 조회
export const useMemberInfo = () => {
  const memberId = getCookie('memberId');
  
  return useQuery<MemberInfoResponse>({
    queryKey: ['memberInfo', memberId],
    queryFn: async () => {
      if (!memberId) return { isLogin: false };
      
      try {
        const profileData = await getProfile(Number(memberId));
        
        return { isLogin: true, ...profileData };
      } catch (error) {
        return { isLogin: false };
      }
    },
    enabled: !!memberId
  });
};