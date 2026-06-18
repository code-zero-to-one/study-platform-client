export const AUTH_COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  MEMBER_ID: 'memberId',
  SOCIAL_IMAGE_URL: 'socialImageURL',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const TOKEN_BACKED_AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60;

export type AuthCookieName =
  (typeof AUTH_COOKIE_NAMES)[keyof typeof AUTH_COOKIE_NAMES];

export const CLIENT_AUTH_COOKIE_NAMES = [
  AUTH_COOKIE_NAMES.ACCESS_TOKEN,
  AUTH_COOKIE_NAMES.MEMBER_ID,
  AUTH_COOKIE_NAMES.SOCIAL_IMAGE_URL,
] as const satisfies readonly AuthCookieName[];
