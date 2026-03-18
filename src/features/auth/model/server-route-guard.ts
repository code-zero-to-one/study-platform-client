import { PROTOTYPE_MEMBER_ID } from '@/mocks/prototype-mock';
import type { DecodedServerToken } from './server-auth-session';

interface RequireAuthenticatedMemberRouteOptions {
  anonymousRedirectTo?: string;
  invalidSessionRedirectTo?: string;
  pendingSignupRedirectTo?: string;
}

interface RequireAdminRouteOptions
  extends RequireAuthenticatedMemberRouteOptions {
  unauthorizedRedirectTo?: string;
}

interface AuthenticatedMemberRouteContext {
  accessToken: string;
  decodedToken: DecodedServerToken;
  memberId: number;
}

// [프로토타입 브랜치] 항상 목업 유저로 인증 통과 처리
const PROTOTYPE_CONTEXT: AuthenticatedMemberRouteContext = {
  accessToken: 'prototype-mock-token',
  decodedToken: {
    memberId: String(PROTOTYPE_MEMBER_ID),
    roleIds: ['ROLE_MEMBER'],
  } as DecodedServerToken,
  memberId: PROTOTYPE_MEMBER_ID,
};

export const requireAuthenticatedMemberRoute = async (
  _options: RequireAuthenticatedMemberRouteOptions = {},
): Promise<AuthenticatedMemberRouteContext> => {
  return PROTOTYPE_CONTEXT;
};

export const requireAdminRoute = async (
  _options: RequireAdminRouteOptions = {},
): Promise<AuthenticatedMemberRouteContext> => {
  return PROTOTYPE_CONTEXT;
};
