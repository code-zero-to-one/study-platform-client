import {
  AUTH_SESSION_STATES,
  type AuthSessionState,
} from '@/types/auth/domain';
import { decodeJwt } from '@/utils/jwt';
import { getServerCookie } from '@/utils/server-cookie';
import { AUTH_COOKIE_NAMES } from './auth-cookie';
import { resolveTokenBackedSession, toNumberMemberId } from './auth-session';

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
): DecodedServerToken | null => {
  if (!accessToken) {
    return null;
  }

  try {
    return decodeJwt(accessToken) as DecodedServerToken | null;
  } catch {
    return null;
  }
};

export const readServerAuthSession = async (): Promise<ServerAuthSession> => {
  const [accessToken, memberId] = await Promise.all([
    getServerCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN),
    getServerCookie(AUTH_COOKIE_NAMES.MEMBER_ID),
  ]);
  const decodedToken = decodeServerTokenSafely(accessToken);
  const { sessionState, decodedMemberId, cookieMemberId } =
    resolveTokenBackedSession({
      accessToken,
      memberId,
      decodedToken,
    });

  return {
    accessToken,
    memberId,
    sessionState,
    decodedToken: decodedToken ?? undefined,
    decodedMemberId: toNumberMemberId(decodedMemberId),
    authenticatedMemberId:
      sessionState === AUTH_SESSION_STATES.AUTHENTICATED_MEMBER
        ? toNumberMemberId(cookieMemberId)
        : undefined,
  };
};

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
