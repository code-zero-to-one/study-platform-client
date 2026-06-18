import { deleteCookie, setCookie } from '@/api/client/cookie';
import { decodeJwt } from '@/utils/jwt';
import {
  AUTH_COOKIE_NAMES,
  TOKEN_BACKED_AUTH_COOKIE_MAX_AGE_SECONDS,
} from './auth-cookie';
import { AUTH_EVENT_LEVELS, logAuthEvent } from './auth-debug-log';
import { normalizeMemberId } from './auth-session';
import { notifyAuthSessionChanged } from './client-auth-sync';

const getDecodedMemberId = (accessToken: string): string | undefined => {
  const decodedToken = decodeJwt(accessToken);

  return normalizeMemberId(decodedToken?.memberId);
};

export const clearClientSession = (): void => {
  deleteCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN);
  deleteCookie(AUTH_COOKIE_NAMES.MEMBER_ID);
  deleteCookie(AUTH_COOKIE_NAMES.SOCIAL_IMAGE_URL);
  notifyAuthSessionChanged();
};

const tokenBackedCookieOptions = {
  maxAge: TOKEN_BACKED_AUTH_COOKIE_MAX_AGE_SECONDS,
} as const;

export const writeExistingMemberSession = ({
  accessToken,
  memberId,
  profileImageUrl,
}: {
  accessToken: string;
  memberId: string;
  profileImageUrl?: string;
}): boolean => {
  const decodedMemberId = getDecodedMemberId(accessToken);
  const normalizedMemberId = normalizeMemberId(memberId);

  if (
    process.env.NODE_ENV !== 'production' &&
    (!decodedMemberId ||
      !normalizedMemberId ||
      decodedMemberId !== normalizedMemberId)
  ) {
    console.error('기존 회원 세션 저장을 중단합니다.', {
      decodedMemberId,
      memberId: normalizedMemberId,
    });
  }

  if (!decodedMemberId || decodedMemberId !== normalizedMemberId) {
    logAuthEvent({
      level: AUTH_EVENT_LEVELS.ERROR,
      layer: 'client-auth-session',
      message: '기존 회원 세션 저장을 중단합니다.',
      reason:
        'access token의 memberId와 redirect memberId가 일치하지 않습니다.',
      hasAccessToken: true,
      hasIdentityCookie: Boolean(normalizedMemberId),
    });
    clearClientSession();

    return false;
  }

  setCookie(
    AUTH_COOKIE_NAMES.ACCESS_TOKEN,
    accessToken,
    tokenBackedCookieOptions,
  );
  setCookie(
    AUTH_COOKIE_NAMES.MEMBER_ID,
    decodedMemberId,
    tokenBackedCookieOptions,
  );

  if (profileImageUrl) {
    setCookie(
      AUTH_COOKIE_NAMES.SOCIAL_IMAGE_URL,
      profileImageUrl,
      tokenBackedCookieOptions,
    );
    notifyAuthSessionChanged();

    return true;
  }

  deleteCookie(AUTH_COOKIE_NAMES.SOCIAL_IMAGE_URL);
  notifyAuthSessionChanged();

  return true;
};

export const writeNewMemberSession = ({
  accessToken,
  profileImageUrl,
}: {
  accessToken: string;
  profileImageUrl?: string;
}): void => {
  setCookie(
    AUTH_COOKIE_NAMES.ACCESS_TOKEN,
    accessToken,
    tokenBackedCookieOptions,
  );
  deleteCookie(AUTH_COOKIE_NAMES.MEMBER_ID);

  if (profileImageUrl) {
    setCookie(
      AUTH_COOKIE_NAMES.SOCIAL_IMAGE_URL,
      profileImageUrl,
      tokenBackedCookieOptions,
    );
    notifyAuthSessionChanged();

    return;
  }

  deleteCookie(AUTH_COOKIE_NAMES.SOCIAL_IMAGE_URL);
  notifyAuthSessionChanged();
};

export const writeAccessTokenSession = (
  accessToken: string,
): string | undefined => {
  setCookie(
    AUTH_COOKIE_NAMES.ACCESS_TOKEN,
    accessToken,
    tokenBackedCookieOptions,
  );

  const decodedMemberId = getDecodedMemberId(accessToken);

  if (decodedMemberId) {
    setCookie(
      AUTH_COOKIE_NAMES.MEMBER_ID,
      decodedMemberId,
      tokenBackedCookieOptions,
    );
    notifyAuthSessionChanged();

    return decodedMemberId;
  }

  deleteCookie(AUTH_COOKIE_NAMES.MEMBER_ID);
  notifyAuthSessionChanged();

  return undefined;
};
