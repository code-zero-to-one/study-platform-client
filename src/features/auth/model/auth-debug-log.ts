const AUTH_EVENT_LEVELS = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

type AuthEventLevel =
  (typeof AUTH_EVENT_LEVELS)[keyof typeof AUTH_EVENT_LEVELS];

interface AuthEventPayload {
  layer: string;
  message: string;
  route?: string;
  reason?: string;
  sessionKind?: string;
  verifyState?: string;
  refreshState?: string;
  hasAccessToken?: boolean;
  hasRefreshToken?: boolean;
  hasIdentityCookie?: boolean;
}

const isProduction = process.env.NODE_ENV === 'production';

const getConsoleMethod = (
  level: AuthEventLevel,
): ((message?: unknown, ...optionalParams: unknown[]) => void) => {
  switch (level) {
    case AUTH_EVENT_LEVELS.INFO:
      return console.info;
    case AUTH_EVENT_LEVELS.ERROR:
      return console.error;
    case AUTH_EVENT_LEVELS.WARN:
    default:
      return console.warn;
  }
};

const compactPayload = (
  payload: AuthEventPayload,
): Record<string, string | boolean> =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as Record<string, string | boolean>;

export const logAuthEvent = ({
  level = AUTH_EVENT_LEVELS.WARN,
  ...payload
}: AuthEventPayload & {
  level?: AuthEventLevel;
}): void => {
  if (level === AUTH_EVENT_LEVELS.INFO && isProduction) {
    return;
  }

  const log = getConsoleMethod(level);

  log('[auth]', compactPayload(payload));
};

export { AUTH_EVENT_LEVELS };
