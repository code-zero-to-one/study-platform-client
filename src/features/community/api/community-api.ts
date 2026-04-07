import { isAxiosError } from 'axios';
import { type ApiError, isApiError } from '@/api/client/api-error';
import { axiosInstance } from '@/api/client/axios';
import {
  getFileExtension,
  isAllowedCommunityMarkdownImageExtension,
} from '@/types/community/markdown';
import type {
  CommunityCommentPageApiResponse,
  CommunityCommentDeleteApiResponse,
  CommunityCommentMutationApiResponse,
  CommunityCommentReactionApiResponse,
  CommunityCommentRequest,
  CommunityCommentReactionRequest,
  CommunityCommentUpdateApiResponse,
  CommunityContentImageUploadTicketApiResponse,
  CommunityDeletePostApiResponse,
  CommunityFeedQueryParams,
  CommunityPostDetailApiResponse,
  CommunityPostFeedApiResponse,
  CommunityPostReactionApiResponse,
  CommunityPostReactionRequest,
  CommunityPostSummaryApiResponse,
  CommunityPostUpsertRequest,
  CommunityPostViewEventApiResponse,
  CommunityBaseResponse,
} from './community-api.types';

const unwrap = <T>(response: { data: CommunityBaseResponse<T> }) =>
  response.data.content;

const COMMUNITY_IMAGE_EXTENSION_BY_MIME = {
  'image/gif': 'gif',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

export const COMMUNITY_API_ERROR_CODE = {
  CONTENT_IMAGE_TICKET_EXPIRED: 'CMT007',
  INVALID_CONTENT_IMAGE_EXTENSION: 'CMT014',
  POST_REVISION_CONFLICT: 'CMT004',
  CONTENT_IMAGE_NOT_OWNED: 'CMT013',
} as const;

const getCommunityApiError = (error: unknown): ApiError | undefined => {
  if (isApiError(error)) {
    return error as ApiError;
  }

  if (
    isAxiosError(error) &&
    error.response &&
    isApiError(error.response.data)
  ) {
    return error.response.data;
  }

  return undefined;
};

const isCommunityApiErrorCode = (
  error: unknown,
  errorCode: (typeof COMMUNITY_API_ERROR_CODE)[keyof typeof COMMUNITY_API_ERROR_CODE],
) => {
  return getCommunityApiError(error)?.errorCode === errorCode;
};

const resolveCommunityContentImageExtension = ({
  fileName,
  fileType,
}: {
  fileName: string;
  fileType?: string;
}) => {
  const fileNameExtension = getFileExtension(fileName);

  if (
    fileNameExtension &&
    isAllowedCommunityMarkdownImageExtension(fileNameExtension)
  ) {
    return fileNameExtension;
  }

  const normalizedFileType = fileType?.trim().toLowerCase();

  if (
    normalizedFileType &&
    normalizedFileType in COMMUNITY_IMAGE_EXTENSION_BY_MIME
  ) {
    return COMMUNITY_IMAGE_EXTENSION_BY_MIME[
      normalizedFileType as keyof typeof COMMUNITY_IMAGE_EXTENSION_BY_MIME
    ];
  }

  return fileNameExtension || 'png';
};

export const createCommunityIdempotencyKey = (scope: string) => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return `${scope}-${crypto.randomUUID()}`;
  }

  return `${scope}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const hasKoreanText = (text: string) => /[가-힣]/.test(text);

export const getCommunityErrorMessage = (
  error: unknown,
  fallbackMessage: string,
) => {
  const apiError = getCommunityApiError(error);

  if (apiError) {
    if (apiError.statusCode >= 500) {
      return fallbackMessage;
    }

    if (hasKoreanText(apiError.message)) {
      return apiError.message;
    }

    return fallbackMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

export const isCommunityNotFoundError = (error: unknown) => {
  return isApiError(error) && error.statusCode === 404;
};

export const isCommunityPostRevisionConflictError = (error: unknown) => {
  return isCommunityApiErrorCode(
    error,
    COMMUNITY_API_ERROR_CODE.POST_REVISION_CONFLICT,
  );
};

export const getCommunityPostRevisionConflictMessage = () => {
  return '다른 탭에서 먼저 수정되어 최신 글 내용을 다시 불러왔습니다. 내용을 확인한 뒤 다시 저장해 주세요.';
};

export const getCommunityWriteContentErrorMessage = (error: unknown) => {
  if (
    isCommunityApiErrorCode(
      error,
      COMMUNITY_API_ERROR_CODE.CONTENT_IMAGE_NOT_OWNED,
    )
  ) {
    return '현재 로그인한 계정이 업로드한 커뮤니티 이미지로만 저장할 수 있습니다. 이미지를 다시 업로드해 주세요.';
  }

  if (
    isCommunityApiErrorCode(
      error,
      COMMUNITY_API_ERROR_CODE.INVALID_CONTENT_IMAGE_EXTENSION,
    )
  ) {
    return '이미지는 jpg, jpeg, png, webp, gif 형식만 사용할 수 있습니다.';
  }

  return undefined;
};

export const getCommunityContentImageUploadErrorMessage = (
  error: unknown,
  fallbackMessage: string,
) => {
  if (
    isCommunityApiErrorCode(
      error,
      COMMUNITY_API_ERROR_CODE.INVALID_CONTENT_IMAGE_EXTENSION,
    )
  ) {
    return '이미지는 jpg, jpeg, png, webp, gif 형식만 업로드할 수 있습니다.';
  }

  if (
    isCommunityApiErrorCode(
      error,
      COMMUNITY_API_ERROR_CODE.CONTENT_IMAGE_TICKET_EXPIRED,
    )
  ) {
    return '이미지 업로드 티켓이 만료되었습니다. 이미지를 다시 업로드해 주세요.';
  }

  return getCommunityErrorMessage(error, fallbackMessage);
};

export const getCommunityFeed = async ({
  board,
  page,
  size,
}: CommunityFeedQueryParams) => {
  const response = await axiosInstance.get<
    CommunityBaseResponse<CommunityPostFeedApiResponse>
  >('/community/posts', {
    params: {
      board,
      page,
      size,
    },
  });

  return unwrap(response);
};

export const getCommunityPostDetail = async (postId: number) => {
  const response = await axiosInstance.get<
    CommunityBaseResponse<CommunityPostDetailApiResponse>
  >(`/community/posts/${postId}`);

  return unwrap(response);
};

export const getCommunityRelatedPosts = async (postId: number, size = 4) => {
  const response = await axiosInstance.get<
    CommunityBaseResponse<CommunityPostSummaryApiResponse[]>
  >(`/community/posts/${postId}/related-posts`, {
    params: { size },
  });

  return unwrap(response);
};

export const recordCommunityPostView = async (postId: number) => {
  const response = await axiosInstance.post<
    CommunityBaseResponse<CommunityPostViewEventApiResponse>
  >(`/community/posts/${postId}/views`);

  return unwrap(response);
};

export const assignCommunityPostReaction = async (
  postId: number,
  request: CommunityPostReactionRequest,
) => {
  const response = await axiosInstance.post<
    CommunityBaseResponse<CommunityPostReactionApiResponse>
  >(`/community/posts/${postId}/reactions`, request);

  return unwrap(response);
};

export const createCommunityContentImageUploadTicket = async ({
  fileName,
  fileType,
}: {
  fileName: string;
  fileType?: string;
}) => {
  const extension = resolveCommunityContentImageExtension({
    fileName,
    fileType,
  });
  const response = await axiosInstance.post<
    CommunityBaseResponse<CommunityContentImageUploadTicketApiResponse>
  >('/community/posts/content-images/upload-ticket', {
    extension,
  });

  return unwrap(response);
};

export const createCommunityPost = async (
  request: CommunityPostUpsertRequest,
  idempotencyKey: string,
) => {
  const response = await axiosInstance.post<
    CommunityBaseResponse<CommunityPostDetailApiResponse>
  >('/community/posts', request, {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  });

  return unwrap(response);
};

export const updateCommunityPost = async (
  postId: number,
  revision: number,
  request: CommunityPostUpsertRequest,
) => {
  const response = await axiosInstance.put<
    CommunityBaseResponse<CommunityPostDetailApiResponse>
  >(`/community/posts/${postId}`, request, {
    headers: {
      'If-Match': `"${revision}"`,
    },
  });

  return unwrap(response);
};

export const deleteCommunityPost = async (postId: number, revision: number) => {
  const response = await axiosInstance.delete<
    CommunityBaseResponse<CommunityDeletePostApiResponse>
  >(`/community/posts/${postId}`, {
    headers: {
      'If-Match': `"${revision}"`,
    },
  });

  return unwrap(response);
};

export const getCommunityComments = async (
  postId: number,
  page = 1,
  size = 20,
) => {
  const response = await axiosInstance.get<
    CommunityBaseResponse<CommunityCommentPageApiResponse>
  >(`/community/posts/${postId}/comments`, {
    params: {
      page,
      size,
    },
  });

  return unwrap(response);
};

export const createCommunityComment = async (
  postId: number,
  request: CommunityCommentRequest,
  idempotencyKey: string,
) => {
  const response = await axiosInstance.post<
    CommunityBaseResponse<CommunityCommentMutationApiResponse>
  >(`/community/posts/${postId}/comments`, request, {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  });

  return unwrap(response);
};

export const createCommunityReply = async (
  postId: number,
  commentId: number,
  request: CommunityCommentRequest,
  idempotencyKey: string,
) => {
  const response = await axiosInstance.post<
    CommunityBaseResponse<CommunityCommentMutationApiResponse>
  >(`/community/posts/${postId}/comments/${commentId}/replies`, request, {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  });

  return unwrap(response);
};

export const updateCommunityComment = async (
  postId: number,
  commentId: number,
  revision: number,
  request: CommunityCommentRequest,
) => {
  const response = await axiosInstance.put<
    CommunityBaseResponse<CommunityCommentUpdateApiResponse>
  >(`/community/posts/${postId}/comments/${commentId}`, request, {
    headers: {
      'If-Match': `"${revision}"`,
    },
  });

  return unwrap(response);
};

export const deleteCommunityComment = async (
  postId: number,
  commentId: number,
  revision: number,
) => {
  const response = await axiosInstance.delete<
    CommunityBaseResponse<CommunityCommentDeleteApiResponse>
  >(`/community/posts/${postId}/comments/${commentId}`, {
    headers: {
      'If-Match': `"${revision}"`,
    },
  });

  return unwrap(response);
};

export const assignCommunityCommentReaction = async (
  postId: number,
  commentId: number,
  request: CommunityCommentReactionRequest,
) => {
  const response = await axiosInstance.post<
    CommunityBaseResponse<CommunityCommentReactionApiResponse>
  >(`/community/posts/${postId}/comments/${commentId}/reactions`, request);

  return unwrap(response);
};
