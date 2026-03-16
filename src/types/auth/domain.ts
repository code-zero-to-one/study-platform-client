export interface AuthSessionLike {
  accessToken?: string | null;
  memberId?: number | string | null;
}

/**
 * JWT와 서버 응답에서 사용하는 인증 역할 식별자다.
 * 권한 분기와 역할 비교는 이 상수를 진실의 원천으로 사용한다.
 */
export const AUTH_ROLE_IDS = {
  MEMBER: 'ROLE_MEMBER',
  ADMIN: 'ROLE_ADMIN',
  GUEST: 'ROLE_GUEST',
} as const;

export type AuthRoleId = (typeof AUTH_ROLE_IDS)[keyof typeof AUTH_ROLE_IDS];

/**
 * 현재 프론트엔드가 해석하는 로그인 공급자 집합이다.
 * 토큰 디코딩과 OAuth 리다이렉트 파싱은 이 값을 기준으로 vendor를 해석한다.
 */
export const AUTH_VENDORS = {
  GOOGLE: 'GOOGLE',
  KAKAO: 'KAKAO',
  TEST: 'TEST',
} as const;

export type AuthVendor = (typeof AUTH_VENDORS)[keyof typeof AUTH_VENDORS];

/**
 * 브라우저 쿠키 조합을 해석한 인증 세션 상태다.
 * - ANONYMOUS: 액세스 토큰이 없음
 * - PENDING_SIGNUP: 액세스 토큰은 있지만 회원 식별자가 없음
 * - AUTHENTICATED_MEMBER: 액세스 토큰과 회원 식별자가 모두 있음
 */
export const AUTH_SESSION_STATES = {
  ANONYMOUS: 'anonymous',
  PENDING_SIGNUP: 'pending-signup',
  AUTHENTICATED_MEMBER: 'authenticated-member',
} as const;

export type AuthSessionState =
  (typeof AUTH_SESSION_STATES)[keyof typeof AUTH_SESSION_STATES];

export interface OAuthRedirectParamSnapshot {
  type?: string;
  isSuccess?: string;
  isGuest?: string;
  authVendor?: AuthVendor | string;
  memberId?: string;
  hasAccessToken: boolean;
  hasUserName: boolean;
  hasProfileImageUrl: boolean;
}

/**
 * `/redirection` 경계에서 해석한 OAuth 결과 종류다.
 * - EXISTING_MEMBER_SUCCESS: 기존 회원 로그인 완료
 * - NEW_MEMBER_SUCCESS: 신규 회원으로 회원가입 추가 진행 필요
 * - FAILURE: OAuth 자체 실패 또는 거부
 */
export const OAUTH_REDIRECT_RESULT_KINDS = {
  EXISTING_MEMBER_SUCCESS: 'existing-member-success',
  NEW_MEMBER_SUCCESS: 'new-member-success',
  FAILURE: 'failure',
} as const;

export type OAuthRedirectResultKind =
  (typeof OAUTH_REDIRECT_RESULT_KINDS)[keyof typeof OAUTH_REDIRECT_RESULT_KINDS];

export interface ExistingMemberOAuthRedirectResult {
  kind: typeof OAUTH_REDIRECT_RESULT_KINDS.EXISTING_MEMBER_SUCCESS;
  accessToken: string;
  memberId: string;
  authVendor?: AuthVendor;
}

export interface NewMemberOAuthRedirectResult {
  kind: typeof OAUTH_REDIRECT_RESULT_KINDS.NEW_MEMBER_SUCCESS;
  accessToken: string;
  authVendor?: AuthVendor;
  userName?: string;
  profileImageUrl?: string;
}

export interface OAuthRedirectFailureResult {
  kind: typeof OAUTH_REDIRECT_RESULT_KINDS.FAILURE;
  authVendor?: AuthVendor;
}

export type OAuthRedirectResult =
  | ExistingMemberOAuthRedirectResult
  | NewMemberOAuthRedirectResult
  | OAuthRedirectFailureResult;
