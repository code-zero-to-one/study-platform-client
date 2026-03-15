import { deleteCookie, setCookie } from '@/api/client/cookie';
import { decodeJwt } from '@/utils/jwt';
import { AUTH_COOKIE_NAMES } from './auth-cookie';
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

export const writeExistingMemberSession = ({
  accessToken,
  memberId,
  profileImageUrl,
}: {
  accessToken: string;
  memberId: string;
  profileImageUrl?: string;
}): void => {
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
    clearClientSession();

    return;
  }

  setCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, accessToken);
  setCookie(AUTH_COOKIE_NAMES.MEMBER_ID, decodedMemberId);

  if (profileImageUrl) {
    setCookie(AUTH_COOKIE_NAMES.SOCIAL_IMAGE_URL, profileImageUrl);
    notifyAuthSessionChanged();

    return;
  }

  deleteCookie(AUTH_COOKIE_NAMES.SOCIAL_IMAGE_URL);
  notifyAuthSessionChanged();
};

export const writeNewMemberSession = ({
  accessToken,
  profileImageUrl,
}: {
  accessToken: string;
  profileImageUrl?: string;
}): void => {
  setCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, accessToken);
  deleteCookie(AUTH_COOKIE_NAMES.MEMBER_ID);

  if (profileImageUrl) {
    setCookie(AUTH_COOKIE_NAMES.SOCIAL_IMAGE_URL, profileImageUrl);
    notifyAuthSessionChanged();

    return;
  }

  deleteCookie(AUTH_COOKIE_NAMES.SOCIAL_IMAGE_URL);
  notifyAuthSessionChanged();
};

export const writeAccessTokenSession = (
  accessToken: string,
): string | undefined => {
  setCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, accessToken);

  const decodedMemberId = getDecodedMemberId(accessToken);

  if (decodedMemberId) {
    setCookie(AUTH_COOKIE_NAMES.MEMBER_ID, decodedMemberId);
    notifyAuthSessionChanged();

    return decodedMemberId;
  }

  deleteCookie(AUTH_COOKIE_NAMES.MEMBER_ID);
  notifyAuthSessionChanged();

  return undefined;
};
