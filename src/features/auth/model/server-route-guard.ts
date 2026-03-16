import { redirect } from 'next/navigation';
import {
  AUTH_ROUTE_PATHS,
  getClearSessionRedirectUrl,
} from '@/features/auth/model/auth-route';
import { AUTH_ROLE_IDS } from '@/types/auth/domain';
import {
  isAnonymousSessionState,
  isPendingSignupSessionState,
  toNumberMemberId,
} from './auth-session';
import {
  readServerAuthSession,
  type DecodedServerToken,
} from './server-auth-session';

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

const redirectToClearedSession = (redirectTo: string): never => {
  redirect(getClearSessionRedirectUrl(redirectTo));
};

export const requireAuthenticatedMemberRoute = async ({
  anonymousRedirectTo = AUTH_ROUTE_PATHS.LANDING,
  invalidSessionRedirectTo = AUTH_ROUTE_PATHS.LOGIN,
  pendingSignupRedirectTo = AUTH_ROUTE_PATHS.SIGN_UP,
}: RequireAuthenticatedMemberRouteOptions = {}): Promise<AuthenticatedMemberRouteContext> => {
  const {
    accessToken,
    memberId: memberIdValue,
    sessionState,
    decodedToken,
    decodedMemberId,
  } = await readServerAuthSession();

  if (isAnonymousSessionState(sessionState)) {
    redirect(anonymousRedirectTo);
  }

  if (isPendingSignupSessionState(sessionState)) {
    redirect(pendingSignupRedirectTo);
  }

  const memberId = toNumberMemberId(memberIdValue);

  if (!accessToken || !memberId || !decodedToken || !decodedMemberId) {
    redirectToClearedSession(invalidSessionRedirectTo);
  }

  if (decodedMemberId !== memberId) {
    redirectToClearedSession(invalidSessionRedirectTo);
  }

  return {
    accessToken,
    decodedToken,
    memberId,
  };
};

export const requireAdminRoute = async ({
  anonymousRedirectTo = AUTH_ROUTE_PATHS.LANDING,
  invalidSessionRedirectTo = AUTH_ROUTE_PATHS.LOGIN,
  pendingSignupRedirectTo = AUTH_ROUTE_PATHS.SIGN_UP,
  unauthorizedRedirectTo = AUTH_ROUTE_PATHS.HOME,
}: RequireAdminRouteOptions = {}): Promise<AuthenticatedMemberRouteContext> => {
  const session = await requireAuthenticatedMemberRoute({
    anonymousRedirectTo,
    invalidSessionRedirectTo,
    pendingSignupRedirectTo,
  });

  if (!session.decodedToken.roleIds?.includes(AUTH_ROLE_IDS.ADMIN)) {
    redirect(unauthorizedRedirectTo);
  }

  return session;
};
