// 데이터 조회(Query) 를 담당하는 커스텀 훅

// cf. useQuery 는 클라이언트 컴포넌트에서 사용하는 React Hook 으로 실시간 데이터 구독, 캐싱, 리렌더링 처리를 담당함
// 한편, prefetchQuery 는 서버컴포넌트에서 사용하는 함수로 데이터를 미리 가져와서 캐시에 저장함

import { useQuery } from '@tanstack/react-query';
import { getCookie } from '@/api/client/cookie';
import { getMemberId } from '@/features/auth/api/auth';
import { useMemo } from 'react';
import { decodeJwt } from '@/utils/jwt';

// 회원 Id 조회
export const useMemberId = () => {
  return useQuery<{ memberId: string }>({
    queryKey: ['member'],
    queryFn: getMemberId,
    enabled: !!getCookie('accessToken'), // 토큰이 있을 때만 실행
  });
};

type RoleId = 'ROLE_MEMBER' | 'ROLE_ADMIN' | 'ROLE_MENTOR' | 'ROLE_GUEST';
type AuthVendor = 'GOOGLE' | 'KAKAO' | 'TEST'; // NATIVE -> TEST 변경

export interface DecodedToken {
  roleIds: RoleId[];
  authVendor: AuthVendor;

  memberId: number;
  sub: string;
  iat: number;
  exp: number;
}

interface UseAuthReturn {
  accessToken: string | undefined;
  data: DecodedToken | undefined;
  isAuthenticated: boolean;
}

function isDecodedToken(value: unknown): value is DecodedToken {
  if (!value || typeof value !== 'object') return false;

  const obj = value as Record<string, unknown>;

  // roleIds가 배열이고, 모든 요소가 유효한 RoleId인지 확인
  if (!Array.isArray(obj.roleIds)) return false;
  // TODO: 서버 역할과 프론트 역할 싱크 필요. 일단 validation 완화
  // const validRoles: RoleId[] = ['ROLE_MEMBER', 'ROLE_ADMIN', 'ROLE_MENTOR', 'ROLE_GUEST'];
  // if (!obj.roleIds.every((role) => validRoles.includes(role))) return false;

  // authVendor가 유효한 값인지 확인
  const validVendors: AuthVendor[] = ['GOOGLE', 'KAKAO', 'TEST']; // NATIVE -> TEST 변경
  if (!validVendors.includes(obj.authVendor as AuthVendor)) return false;

  // memberId가 숫자이거나 null인지 확인
  if (
    typeof obj.memberId !== 'number' &&
    obj.memberId !== null &&
    obj.memberId !== undefined
  )
    return false;

  return true;
}

export function useAuth(): UseAuthReturn {
  // getCookie는 클라이언트 사이드에서만 실행되어야 함
  const accessToken = typeof window !== 'undefined' ? getCookie('accessToken') : undefined;

  const decodedToken: DecodedToken | undefined = useMemo(() => {
    if (!accessToken) return undefined;

    try {
      const decoded = decodeJwt(accessToken);

      // decoded가 null이거나 형식이 안 맞으면 에러 출력
      if (!decoded || !isDecodedToken(decoded)) {
        console.error('Invalid token structure', decoded);
        return undefined;
      }

      return decoded;
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return undefined;
    }
  }, [accessToken]);

  const isGuest = decodedToken?.roleIds.includes('ROLE_GUEST');

  return {
    accessToken,
    data: decodedToken,
    isAuthenticated: !!accessToken && !!decodedToken && !isGuest,
  };
}
