import { useMemo } from 'react';

import { getCookie } from '@/api/client/cookie';
import { decodeJwt } from '@/utils/jwt';

type RoleId = 'ROLE_MEMBER' | 'ROLE_ADMIN' | 'ROLE_MENTOR';
type AuthVendor = 'GOOGLE' | 'KAKAO';

interface DecodedToken {
  roleIds: RoleId[];
  authVendor: AuthVendor;
  memberId: number;
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
  const validRoles: RoleId[] = ['ROLE_MEMBER', 'ROLE_ADMIN', 'ROLE_MENTOR'];
  if (!obj.roleIds.every((role) => validRoles.includes(role))) return false;

  // authVendor가 유효한 값인지 확인
  const validVendors: AuthVendor[] = ['GOOGLE', 'KAKAO'];
  if (!validVendors.includes(obj.authVendor as AuthVendor)) return false;

  // memberId가 숫자인지 확인
  if (typeof obj.memberId !== 'number') return false;

  return true;
}

export function useAuth(): UseAuthReturn {
  const accessToken = getCookie('accessToken');

  const decodedToken: DecodedToken | undefined = useMemo(() => {
    if (!accessToken) return undefined;

    try {
      const decoded = decodeJwt(accessToken);

      if (!isDecodedToken(decoded)) {
        console.error('Invalid token structure');

        return undefined;
      }

      return decoded;
    } catch (error) {
      console.error('Failed to decode JWT:', error);

      return undefined;
    }
  }, [accessToken]);

  return {
    accessToken,
    data: decodedToken,
    isAuthenticated: !!accessToken && !!decodedToken,
  };
}
