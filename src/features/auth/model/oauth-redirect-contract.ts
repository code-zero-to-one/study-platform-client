import { AUTH_VENDORS, type AuthVendor } from '@/types/auth/domain';

/**
 * 백엔드 OAuth 리다이렉트 계약에서 사용하는 쿼리 파라미터 이름이다.
 * 파서는 이 상수만 보고 파라미터를 읽어야 한다.
 */
export const OAUTH_REDIRECT_QUERY_PARAMS = {
  TYPE: 'type',
  IS_SUCCESS: 'is-success',
  IS_GUEST: 'is-guest',
  AUTH_VENDOR: 'auth-vendor',
  ACCESS_TOKEN: 'access-token',
  MEMBER_ID: 'member-id',
  USER_NAME: 'user-name',
  PROFILE_IMAGE_URL: 'profile-image-url',
} as const;

/**
 * OAuth 리다이렉트에서 비교해야 하는 닫힌 값 집합이다.
 */
export const OAUTH_REDIRECT_QUERY_VALUES = {
  TYPE_OAUTH2: 'oauth2',
  FLAG_TRUE: 'true',
  FLAG_FALSE: 'false',
} as const;

/**
 * 리다이렉트 계약 검증 실패 메시지다.
 * 로그와 디버깅에서 바로 읽히도록 한국어로 유지한다.
 */
export const OAUTH_REDIRECT_CONTRACT_MESSAGES = {
  INVALID_TYPE: 'OAuth 리다이렉트 type 값이 없거나 올바르지 않습니다.',
  INVALID_SUCCESS_FLAG:
    'OAuth 리다이렉트 성공 여부 값이 없거나 올바르지 않습니다.',
  MISSING_ACCESS_TOKEN: 'OAuth 리다이렉트 결과에 액세스 토큰이 없습니다.',
  MISSING_MEMBER_ID: '기존 회원 로그인 결과에 member-id가 없습니다.',
  INVALID_GUEST_FLAG:
    'OAuth 리다이렉트 신규 회원 여부 값이 없거나 올바르지 않습니다.',
} as const;

/**
 * 계약 위반 이유 목록이다.
 * 에러 메시지보다 구체적인 설명이 필요할 때 함께 기록한다.
 */
export const OAUTH_REDIRECT_CONTRACT_REASONS = {
  TYPE_MUST_BE_OAUTH2: '`type` 쿼리 파라미터는 `oauth2`여야 합니다.',
  SUCCESS_FLAG_MUST_BE_BOOLEAN_STRING:
    '`is-success` 쿼리 파라미터는 `true` 또는 `false`여야 합니다.',
  ACCESS_TOKEN_IS_REQUIRED:
    '로그인 성공 결과에는 `access-token` 쿼리 파라미터가 반드시 포함되어야 합니다.',
  MEMBER_ID_IS_REQUIRED_FOR_EXISTING_MEMBER:
    '기존 회원 로그인 성공 결과에는 숫자 형태의 `member-id`가 반드시 포함되어야 합니다.',
  GUEST_FLAG_IS_REQUIRED:
    '로그인 성공 결과에는 `is-guest` 쿼리 파라미터가 반드시 포함되어야 합니다.',
} as const;

/**
 * OAuth 리다이렉트 처리 중 남기는 디버그 로그 메시지다.
 */
export const OAUTH_REDIRECT_LOG_MESSAGES = {
  LOGIN_FAILED: '[OAuthRedirect] 소셜 로그인이 실패했습니다.',
  CONTRACT_MISMATCH:
    '[OAuthRedirect] 백엔드 OAuth 리다이렉트 계약과 다른 결과를 받았습니다.',
  UNEXPECTED_ERROR:
    '[OAuthRedirect] OAuth 리다이렉트 처리 중 예기치 못한 오류가 발생했습니다.',
} as const;

const AUTH_VENDOR_VALUES = Object.values(AUTH_VENDORS);

export const normalizeAuthVendor = (
  authVendor: string | undefined,
): AuthVendor | undefined =>
  AUTH_VENDOR_VALUES.includes(authVendor as AuthVendor)
    ? (authVendor as AuthVendor)
    : undefined;
