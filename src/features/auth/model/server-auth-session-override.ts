import { normalizeMemberId } from './auth-session';

export const SERVER_AUTH_SESSION_OVERRIDE_STATES = {
  ANONYMOUS: 'anonymous',
  PENDING_SIGNUP: 'pending-signup',
  AUTHENTICATED: 'authenticated',
} as const;

export type ServerAuthSessionOverrideState =
  (typeof SERVER_AUTH_SESSION_OVERRIDE_STATES)[keyof typeof SERVER_AUTH_SESSION_OVERRIDE_STATES];

export const SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES = {
  STATE: 'x-zeroone-auth-session-state',
  ACCESS_TOKEN: 'x-zeroone-auth-access-token',
  MEMBER_ID: 'x-zeroone-auth-member-id',
} as const;

interface AnonymousServerAuthSessionOverride {
  state: typeof SERVER_AUTH_SESSION_OVERRIDE_STATES.ANONYMOUS;
}

interface PendingSignupServerAuthSessionOverride {
  state: typeof SERVER_AUTH_SESSION_OVERRIDE_STATES.PENDING_SIGNUP;
  accessToken: string;
}

interface AuthenticatedServerAuthSessionOverride {
  state: typeof SERVER_AUTH_SESSION_OVERRIDE_STATES.AUTHENTICATED;
  accessToken: string;
  memberId: string;
}

export type ServerAuthSessionOverride =
  | AnonymousServerAuthSessionOverride
  | PendingSignupServerAuthSessionOverride
  | AuthenticatedServerAuthSessionOverride;

export const readServerAuthSessionOverride = (
  headers: Pick<Headers, 'get'>,
): ServerAuthSessionOverride | undefined => {
  const state = headers.get(SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.STATE);

  switch (state) {
    case SERVER_AUTH_SESSION_OVERRIDE_STATES.ANONYMOUS:
      return { state };
    case SERVER_AUTH_SESSION_OVERRIDE_STATES.PENDING_SIGNUP: {
      const accessToken =
        headers.get(SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.ACCESS_TOKEN) ??
        undefined;

      return accessToken ? { state, accessToken } : undefined;
    }
    case SERVER_AUTH_SESSION_OVERRIDE_STATES.AUTHENTICATED: {
      const accessToken =
        headers.get(SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.ACCESS_TOKEN) ??
        undefined;
      const memberId = normalizeMemberId(
        headers.get(SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.MEMBER_ID),
      );

      return accessToken && memberId
        ? { state, accessToken, memberId }
        : undefined;
    }
    default:
      return undefined;
  }
};

export const writeServerAuthSessionOverride = ({
  headers,
  override,
}: {
  headers: Headers;
  override: ServerAuthSessionOverride;
}): void => {
  headers.set(SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.STATE, override.state);

  switch (override.state) {
    case SERVER_AUTH_SESSION_OVERRIDE_STATES.ANONYMOUS:
      headers.delete(SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.ACCESS_TOKEN);
      headers.delete(SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.MEMBER_ID);

      return;
    case SERVER_AUTH_SESSION_OVERRIDE_STATES.PENDING_SIGNUP:
      headers.set(
        SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.ACCESS_TOKEN,
        override.accessToken,
      );
      headers.delete(SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.MEMBER_ID);

      return;
    case SERVER_AUTH_SESSION_OVERRIDE_STATES.AUTHENTICATED:
      headers.set(
        SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.ACCESS_TOKEN,
        override.accessToken,
      );
      headers.set(
        SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.MEMBER_ID,
        override.memberId,
      );
  }
};

export const clearServerAuthSessionOverride = (headers: Headers): void => {
  headers.delete(SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.STATE);
  headers.delete(SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.ACCESS_TOKEN);
  headers.delete(SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.MEMBER_ID);
};

export const createRequestHeadersWithServerAuthSessionOverride = ({
  requestHeaders,
  override,
}: {
  requestHeaders: Headers;
  override?: ServerAuthSessionOverride;
}): Headers => {
  const headers = new Headers(requestHeaders);
  clearServerAuthSessionOverride(headers);

  if (override) {
    writeServerAuthSessionOverride({
      headers,
      override,
    });
  }

  return headers;
};
