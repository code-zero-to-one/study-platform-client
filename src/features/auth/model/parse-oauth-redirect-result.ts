import type {
  OAuthRedirectParamSnapshot,
  OAuthRedirectResult,
} from '@/types/auth/domain';
import { OAUTH_REDIRECT_RESULT_KINDS } from '@/types/auth/domain';
import { normalizeMemberId } from './auth-session';
import {
  normalizeAuthVendor,
  OAUTH_REDIRECT_CONTRACT_MESSAGES,
  OAUTH_REDIRECT_CONTRACT_REASONS,
  OAUTH_REDIRECT_QUERY_PARAMS,
  OAUTH_REDIRECT_QUERY_VALUES,
} from './oauth-redirect-contract';

interface SearchParamsLike {
  get(name: string): string | null;
}

type SearchParamName =
  (typeof OAUTH_REDIRECT_QUERY_PARAMS)[keyof typeof OAUTH_REDIRECT_QUERY_PARAMS];

const PARAM = OAUTH_REDIRECT_QUERY_PARAMS;
const VALUE = OAUTH_REDIRECT_QUERY_VALUES;
const MESSAGE = OAUTH_REDIRECT_CONTRACT_MESSAGES;
const REASON = OAUTH_REDIRECT_CONTRACT_REASONS;

export class OAuthRedirectContractError extends Error {
  public readonly code = 'OAUTH_REDIRECT_CONTRACT_ERROR' as const;
  public readonly snapshot: OAuthRedirectParamSnapshot;
  public readonly reasons: string[];

  public constructor({
    message,
    snapshot,
    reasons,
  }: {
    message: string;
    snapshot: OAuthRedirectParamSnapshot;
    reasons: string[];
  }) {
    super(message);
    this.name = 'OAuthRedirectContractError';
    this.snapshot = snapshot;
    this.reasons = reasons;
  }
}

const readParam = (
  searchParams: SearchParamsLike,
  name: SearchParamName,
): string | undefined => {
  const value = searchParams.get(name)?.trim();

  return value ? value : undefined;
};

export const getOAuthRedirectParamSnapshot = (
  searchParams: SearchParamsLike,
): OAuthRedirectParamSnapshot => ({
  type: readParam(searchParams, PARAM.TYPE),
  isSuccess: readParam(searchParams, PARAM.IS_SUCCESS),
  isGuest: readParam(searchParams, PARAM.IS_GUEST),
  authVendor: readParam(searchParams, PARAM.AUTH_VENDOR),
  memberId: readParam(searchParams, PARAM.MEMBER_ID),
  hasAccessToken: Boolean(readParam(searchParams, PARAM.ACCESS_TOKEN)),
  hasUserName: Boolean(readParam(searchParams, PARAM.USER_NAME)),
  hasProfileImageUrl: Boolean(readParam(searchParams, PARAM.PROFILE_IMAGE_URL)),
});

const throwContractError = ({
  message,
  reasons,
  searchParams,
}: {
  message: string;
  reasons: string[];
  searchParams: SearchParamsLike;
}): never => {
  throw new OAuthRedirectContractError({
    message,
    reasons,
    snapshot: getOAuthRedirectParamSnapshot(searchParams),
  });
};

export const parseOAuthRedirectResult = (
  searchParams: SearchParamsLike,
): OAuthRedirectResult => {
  const type = readParam(searchParams, PARAM.TYPE);
  if (type !== VALUE.TYPE_OAUTH2) {
    throwContractError({
      message: MESSAGE.INVALID_TYPE,
      reasons: [REASON.TYPE_MUST_BE_OAUTH2],
      searchParams,
    });
  }

  const authVendor = normalizeAuthVendor(
    readParam(searchParams, PARAM.AUTH_VENDOR),
  );
  const isSuccess = readParam(searchParams, PARAM.IS_SUCCESS);

  if (isSuccess === VALUE.FLAG_FALSE) {
    return {
      kind: OAUTH_REDIRECT_RESULT_KINDS.FAILURE,
      authVendor,
    };
  }

  if (isSuccess !== VALUE.FLAG_TRUE) {
    throwContractError({
      message: MESSAGE.INVALID_SUCCESS_FLAG,
      reasons: [REASON.SUCCESS_FLAG_MUST_BE_BOOLEAN_STRING],
      searchParams,
    });
  }

  const accessToken = readParam(searchParams, PARAM.ACCESS_TOKEN);
  if (!accessToken) {
    throwContractError({
      message: MESSAGE.MISSING_ACCESS_TOKEN,
      reasons: [REASON.ACCESS_TOKEN_IS_REQUIRED],
      searchParams,
    });
  }

  const isGuest = readParam(searchParams, PARAM.IS_GUEST);
  if (isGuest === VALUE.FLAG_TRUE) {
    return {
      kind: OAUTH_REDIRECT_RESULT_KINDS.NEW_MEMBER_SUCCESS,
      accessToken,
      authVendor,
      userName: readParam(searchParams, PARAM.USER_NAME),
      profileImageUrl: readParam(searchParams, PARAM.PROFILE_IMAGE_URL),
    };
  }

  if (isGuest === VALUE.FLAG_FALSE) {
    const memberId = normalizeMemberId(
      readParam(searchParams, PARAM.MEMBER_ID),
    );

    if (!memberId) {
      throwContractError({
        message: MESSAGE.MISSING_MEMBER_ID,
        reasons: [REASON.MEMBER_ID_IS_REQUIRED_FOR_EXISTING_MEMBER],
        searchParams,
      });
    }

    return {
      kind: OAUTH_REDIRECT_RESULT_KINDS.EXISTING_MEMBER_SUCCESS,
      accessToken,
      memberId,
      authVendor,
    };
  }

  throwContractError({
    message: MESSAGE.INVALID_GUEST_FLAG,
    reasons: [REASON.GUEST_FLAG_IS_REQUIRED],
    searchParams,
  });
};
