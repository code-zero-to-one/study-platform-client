import { headers } from 'next/headers';
import { cache } from 'react';
import {
  AUTH_SESSION_STATES,
  type AuthSessionState,
} from '@/types/auth/domain';
import { decodeJwt } from '@/utils/jwt';
import { getServerCookie } from '@/utils/server-cookie';
import { AUTH_COOKIE_NAMES } from './auth-cookie';
import { resolveTokenBackedSession, toNumberMemberId } from './auth-session';
import {
  SERVER_AUTH_SESSION_OVERRIDE_STATES,
  readServerAuthSessionOverride,
  type ServerAuthSessionOverride,
} from './server-auth-session-override';

export interface DecodedServerToken {
  roleIds?: string[];
  exp?: number;
  memberId?: number | string;
}

export interface ServerAuthSession {
  accessToken?: string;
  memberId?: string;
  sessionState: AuthSessionState;
  decodedToken?: DecodedServerToken;
  decodedMemberId?: number;
  authenticatedMemberId?: number;
}

const decodeServerTokenSafely = (
  accessToken: string | undefined,
): DecodedServerToken | undefined => {
  if (!accessToken) {
    return undefined;
  }

  try {
    return decodeJwt(accessToken) as DecodedServerToken | undefined;
  } catch {
    return undefined;
  }
};

const createServerAuthSession = ({
  accessToken,
  memberId,
  sessionState,
  decodedToken = decodeServerTokenSafely(accessToken),
}: {
  accessToken: string | undefined;
  memberId: string | undefined;
  sessionState: AuthSessionState;
  decodedToken?: DecodedServerToken;
}): ServerAuthSession => {
  const decodedMemberId = toNumberMemberId(decodedToken?.memberId);

  return {
    accessToken,
    memberId,
    sessionState,
    decodedToken: decodedToken ?? undefined,
    decodedMemberId,
    authenticatedMemberId:
      sessionState === AUTH_SESSION_STATES.AUTHENTICATED_MEMBER
        ? (toNumberMemberId(memberId) ?? decodedMemberId)
        : undefined,
  };
};

const createOverriddenServerAuthSession = (
  override: ServerAuthSessionOverride,
): ServerAuthSession => {
  switch (override.state) {
    case SERVER_AUTH_SESSION_OVERRIDE_STATES.ANONYMOUS:
      return createServerAuthSession({
        accessToken: undefined,
        memberId: undefined,
        sessionState: AUTH_SESSION_STATES.ANONYMOUS,
      });
    case SERVER_AUTH_SESSION_OVERRIDE_STATES.PENDING_SIGNUP:
      return createServerAuthSession({
        accessToken: override.accessToken,
        memberId: undefined,
        sessionState: AUTH_SESSION_STATES.PENDING_SIGNUP,
      });
    case SERVER_AUTH_SESSION_OVERRIDE_STATES.AUTHENTICATED:
      return createServerAuthSession({
        accessToken: override.accessToken,
        memberId: override.memberId,
        sessionState: AUTH_SESSION_STATES.AUTHENTICATED_MEMBER,
      });
  }
};

const readCookieBackedServerAuthSession =
  async (): Promise<ServerAuthSession> => {
    const [accessToken, memberId, refreshToken] = await Promise.all([
      getServerCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN),
      getServerCookie(AUTH_COOKIE_NAMES.MEMBER_ID),
      getServerCookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN),
    ]);
    const decodedToken = decodeServerTokenSafely(accessToken);
    const { sessionState, resolvedMemberId } = resolveTokenBackedSession({
      accessToken,
      memberId,
      decodedToken,
      allowExpiredTokenRecovery: Boolean(refreshToken),
    });

    return createServerAuthSession({
      accessToken,
      memberId: resolvedMemberId,
      sessionState,
      decodedToken: decodedToken ?? undefined,
    });
  };

export const readServerAuthSession = cache(
  async (): Promise<ServerAuthSession> => {
    const headerStore = await headers();
    const override = readServerAuthSessionOverride(headerStore);

    if (override) {
      return createOverriddenServerAuthSession(override);
    }

    return readCookieBackedServerAuthSession();
  },
);

export const readServerAccessToken = async (): Promise<string | undefined> => {
  const { accessToken, sessionState } = await readServerAuthSession();

  if (sessionState === AUTH_SESSION_STATES.ANONYMOUS) {
    return undefined;
  }

  return accessToken;
};

export const readAuthenticatedMemberId = async (): Promise<
  number | undefined
> => {
  const { authenticatedMemberId } = await readServerAuthSession();

  return authenticatedMemberId;
};
