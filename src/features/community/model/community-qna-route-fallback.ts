import { ErrorType, type ErrorInfo } from '@/utils/error-handler';

export const COMMUNITY_QNA_ROUTE_PREVIEW_KIND = {
  AUTH: 'auth',
  CLIENT: 'client',
  LOADING: 'loading',
  NETWORK: 'network',
  NOT_FOUND: 'not-found',
  SERVER: 'server',
  UNKNOWN: 'unknown',
} as const;

export type CommunityQnaRoutePreviewKind =
  (typeof COMMUNITY_QNA_ROUTE_PREVIEW_KIND)[keyof typeof COMMUNITY_QNA_ROUTE_PREVIEW_KIND];

const COMMUNITY_QNA_ROUTE_PREVIEW_ERROR_INFO: Record<
  Exclude<
    CommunityQnaRoutePreviewKind,
    | typeof COMMUNITY_QNA_ROUTE_PREVIEW_KIND.LOADING
    | typeof COMMUNITY_QNA_ROUTE_PREVIEW_KIND.NOT_FOUND
  >,
  Pick<ErrorInfo, 'type' | 'userMessage'>
> = {
  [COMMUNITY_QNA_ROUTE_PREVIEW_KIND.AUTH]: {
    type: ErrorType.AUTH,
    userMessage: '인증이 필요합니다. 다시 로그인해주세요.',
  },
  [COMMUNITY_QNA_ROUTE_PREVIEW_KIND.CLIENT]: {
    type: ErrorType.CLIENT,
    userMessage:
      '서버 응답 형식 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  },
  [COMMUNITY_QNA_ROUTE_PREVIEW_KIND.NETWORK]: {
    type: ErrorType.NETWORK,
    userMessage: '네트워크 연결을 확인해주세요.',
  },
  [COMMUNITY_QNA_ROUTE_PREVIEW_KIND.SERVER]: {
    type: ErrorType.SERVER,
    userMessage: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  },
  [COMMUNITY_QNA_ROUTE_PREVIEW_KIND.UNKNOWN]: {
    type: ErrorType.UNKNOWN,
    userMessage: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  },
};

export const isCommunityQnaRoutePreviewKind = (
  value: string | undefined,
): value is CommunityQnaRoutePreviewKind => {
  return (
    typeof value === 'string' &&
    Object.values(COMMUNITY_QNA_ROUTE_PREVIEW_KIND).includes(
      value as CommunityQnaRoutePreviewKind,
    )
  );
};

export const getCommunityQnaRoutePreviewErrorInfo = (
  kind: Exclude<
    CommunityQnaRoutePreviewKind,
    | typeof COMMUNITY_QNA_ROUTE_PREVIEW_KIND.LOADING
    | typeof COMMUNITY_QNA_ROUTE_PREVIEW_KIND.NOT_FOUND
  >,
) => {
  return COMMUNITY_QNA_ROUTE_PREVIEW_ERROR_INFO[kind];
};
