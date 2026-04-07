import {
  AUTH_ROUTE_PATHS,
  AUTH_ROUTE_PREFIXES,
} from '@/features/auth/model/auth-route';

/**
 * 미들웨어가 경로를 해석할 때 사용하는 정책 종류다.
 * - BYPASS: 인증 검증에 개입하지 않고 그대로 통과
 * - LOGIN: 로그인 페이지 전용 규칙 적용
 * - PUBLIC_SESSION: 비회원 접근은 허용하되 세션 유지/정리 수행
 * - SIGN_UP: 신규 회원가입 진행용 규칙 적용
 */
export const ROUTE_POLICY_KINDS = {
  BYPASS: 'bypass',
  LOGIN: 'login',
  PUBLIC_SESSION: 'public-session',
  SIGN_UP: 'sign-up',
} as const;

export type RoutePolicyKind =
  (typeof ROUTE_POLICY_KINDS)[keyof typeof ROUTE_POLICY_KINDS];

/**
 * 미들웨어 경로 정책이 path를 어떻게 해석할지 결정하는 매칭 방식이다.
 * - EXACT: path와 정확히 일치해야 함
 * - PREFIX: path 자체 또는 하위 경로까지 포함해 매칭
 */
export const ROUTE_MATCH_TYPES = {
  EXACT: 'exact',
  PREFIX: 'prefix',
} as const;

export type RouteMatchType =
  (typeof ROUTE_MATCH_TYPES)[keyof typeof ROUTE_MATCH_TYPES];

interface RoutePolicy {
  kind: RoutePolicyKind;
  path: string;
  match: RouteMatchType;
}

const ROUTE_POLICIES: readonly RoutePolicy[] = [
  {
    kind: ROUTE_POLICY_KINDS.BYPASS,
    path: AUTH_ROUTE_PATHS.REDIRECTION,
    match: ROUTE_MATCH_TYPES.PREFIX,
  },
  {
    kind: ROUTE_POLICY_KINDS.BYPASS,
    path: AUTH_ROUTE_PREFIXES.TEST_SENTRY,
    match: ROUTE_MATCH_TYPES.PREFIX,
  },
  {
    kind: ROUTE_POLICY_KINDS.BYPASS,
    path: AUTH_ROUTE_PREFIXES.TEST_SENTRY_SERVER_ERROR,
    match: ROUTE_MATCH_TYPES.PREFIX,
  },
  {
    kind: ROUTE_POLICY_KINDS.SIGN_UP,
    path: AUTH_ROUTE_PATHS.SIGN_UP,
    match: ROUTE_MATCH_TYPES.EXACT,
  },
  {
    kind: ROUTE_POLICY_KINDS.LOGIN,
    path: AUTH_ROUTE_PATHS.LOGIN,
    match: ROUTE_MATCH_TYPES.EXACT,
  },
  {
    kind: ROUTE_POLICY_KINDS.PUBLIC_SESSION,
    path: AUTH_ROUTE_PATHS.LANDING,
    match: ROUTE_MATCH_TYPES.EXACT,
  },
  {
    kind: ROUTE_POLICY_KINDS.PUBLIC_SESSION,
    path: '/group-study',
    match: ROUTE_MATCH_TYPES.PREFIX,
  },
  {
    kind: ROUTE_POLICY_KINDS.PUBLIC_SESSION,
    path: AUTH_ROUTE_PATHS.HOME,
    match: ROUTE_MATCH_TYPES.PREFIX,
  },
  {
    kind: ROUTE_POLICY_KINDS.PUBLIC_SESSION,
    path: '/mentoring',
    match: ROUTE_MATCH_TYPES.PREFIX,
  },
  {
    kind: ROUTE_POLICY_KINDS.PUBLIC_SESSION,
    path: '/premium-study',
    match: ROUTE_MATCH_TYPES.PREFIX,
  },
  {
    kind: ROUTE_POLICY_KINDS.PUBLIC_SESSION,
    path: '/insights',
    match: ROUTE_MATCH_TYPES.PREFIX,
  },
  {
    kind: ROUTE_POLICY_KINDS.PUBLIC_SESSION,
    path: '/one-on-one',
    match: ROUTE_MATCH_TYPES.PREFIX,
  },
  {
    kind: ROUTE_POLICY_KINDS.PUBLIC_SESSION,
    path: '/inquiry',
    match: ROUTE_MATCH_TYPES.PREFIX,
  },
] as const;

const matchesRoutePolicy = (pathname: string, policy: RoutePolicy): boolean => {
  if (policy.match === ROUTE_MATCH_TYPES.EXACT) {
    return pathname === policy.path;
  }

  return pathname === policy.path || pathname.startsWith(`${policy.path}/`);
};

export const resolveRoutePolicy = (
  pathname: string,
): RoutePolicyKind | undefined =>
  ROUTE_POLICIES.find((policy) => matchesRoutePolicy(pathname, policy))?.kind;
