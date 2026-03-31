/**
 * 인증 흐름에서 반복 사용하는 핵심 경로 집합이다.
 * 로그인/회원가입/리다이렉트처럼 닫힌 집합인 경로는 이 상수를 진실의 원천으로 사용한다.
 */
export const AUTH_ROUTE_PATHS = {
  LANDING: '/',
  HOME: '/home',
  LOGIN: '/login',
  SIGN_UP: '/sign-up',
  REDIRECTION: '/redirection',
  CLEAR_SESSION_API: '/api/auth/clear-session',
} as const;

export const AUTH_ROUTE_QUERY_PARAMS = {
  PROTECTED_TRANSIENT_RETRY: '__authRetry',
  DOCUMENT_AUTH_RECOVERY: '__authRecovery',
} as const;

/**
 * 인증 미들웨어에서 별도 매칭 규칙을 갖는 특수 경로 prefix 모음이다.
 */
export const AUTH_ROUTE_PREFIXES = {
  ADMIN: '/admin',
  TEST_SENTRY: '/test-sentry',
  TEST_SENTRY_SERVER_ERROR: '/test-sentry-server-error',
} as const;

/**
 * 인증 redirect에 사용할 내부 경로인지 검증한다.
 * 외부 URL, 프로토콜 상대 경로, 역슬래시 시작 경로는 허용하지 않는다.
 */
export const isSafeInternalRedirectPath = (
  path: string | null | undefined,
): path is string =>
  typeof path === 'string' &&
  path.startsWith('/') &&
  !path.startsWith('//') &&
  !path.startsWith('\\');

/**
 * 내부 redirect 경로가 아니면 안전한 기본 경로로 치환한다.
 */
export const getSafeInternalRedirectPath = (
  path: string | null | undefined,
  fallbackPath: string,
): string => (isSafeInternalRedirectPath(path) ? path : fallbackPath);

/**
 * 서버와 브라우저가 보는 인증 쿠키를 함께 정리한 뒤
 * 안전한 내부 경로로 이동시키는 route handler URL을 만든다.
 */
export const getClearSessionRedirectUrl = (redirectPath: string): string =>
  `${AUTH_ROUTE_PATHS.CLEAR_SESSION_API}?redirect=${encodeURIComponent(
    getSafeInternalRedirectPath(redirectPath, AUTH_ROUTE_PATHS.LOGIN),
  )}`;

const getPathWithSearch = ({
  pathname,
  search,
}: {
  pathname: string;
  search: string;
}): string => `${pathname}${search}`;

const updatePathSearchParams = ({
  pathname,
  search,
  update,
}: {
  pathname: string;
  search: string;
  update: (searchParams: URLSearchParams) => void;
}): string => {
  const searchParams = new URLSearchParams(search);

  update(searchParams);

  const nextSearch = searchParams.toString();

  return getPathWithSearch({
    pathname,
    search: nextSearch ? `?${nextSearch}` : '',
  });
};

export const getProtectedTransientRetryPath = ({
  pathname,
  search,
}: {
  pathname: string;
  search: string;
}): string =>
  updatePathSearchParams({
    pathname,
    search,
    update: (searchParams) => {
      searchParams.set(AUTH_ROUTE_QUERY_PARAMS.PROTECTED_TRANSIENT_RETRY, '1');
    },
  });

export const getDocumentAuthRecoveryPath = ({
  pathname,
  search,
}: {
  pathname: string;
  search: string;
}): string =>
  updatePathSearchParams({
    pathname,
    search,
    update: (searchParams) => {
      searchParams.set(AUTH_ROUTE_QUERY_PARAMS.DOCUMENT_AUTH_RECOVERY, '1');
    },
  });

export const getAuthRecoveryCleanPath = ({
  pathname,
  search,
}: {
  pathname: string;
  search: string;
}): string =>
  updatePathSearchParams({
    pathname,
    search,
    update: (searchParams) => {
      searchParams.delete(AUTH_ROUTE_QUERY_PARAMS.PROTECTED_TRANSIENT_RETRY);
      searchParams.delete(AUTH_ROUTE_QUERY_PARAMS.DOCUMENT_AUTH_RECOVERY);
    },
  });

export const getProtectedTransientRetryCleanPath = ({
  pathname,
  search,
}: {
  pathname: string;
  search: string;
}): string =>
  getAuthRecoveryCleanPath({
    pathname,
    search,
  });

export const hasProtectedTransientRetryParam = (search: string): boolean => {
  const searchParams = new URLSearchParams(search);

  return (
    searchParams.get(AUTH_ROUTE_QUERY_PARAMS.PROTECTED_TRANSIENT_RETRY) === '1'
  );
};

export const hasDocumentAuthRecoveryParam = (search: string): boolean => {
  const searchParams = new URLSearchParams(search);

  return (
    searchParams.get(AUTH_ROUTE_QUERY_PARAMS.DOCUMENT_AUTH_RECOVERY) === '1'
  );
};
