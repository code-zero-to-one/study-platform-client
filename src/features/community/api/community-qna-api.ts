import { isAxiosError } from 'axios';
import { type ApiError, isApiError } from '@/api/client/api-error';
import { axiosInstance } from '@/api/client/axios';
import { analyzeError, ErrorType } from '@/utils/error-handler';
import type {
  CommunityQnaAcceptanceApiResponse,
  CommunityQnaAnswerCommentsPageApiResponse,
  CommunityQnaAnswerDeleteApiResponse,
  CommunityQnaAnswerMutationApiResponse,
  CommunityQnaAnswerUpsertRequest,
  CommunityQnaBaseResponse,
  CommunityQnaCommentDeleteApiResponse,
  CommunityQnaCommentRequest,
  CommunityQnaQuestionCommentsPageApiResponse,
  CommunityQnaQuestionDeleteApiResponse,
  CommunityQnaQuestionDetailAggregateApiResponse,
  CommunityQnaQuestionDetailQueryParams,
  CommunityQnaQuestionListApiResponse,
  CommunityQnaQuestionListQueryParams,
  CommunityQnaQuestionUpsertRequest,
  CommunityQnaQuestionViewEventApiResponse,
} from './community-qna-api.types';

const unwrap = <T>(response: { data: CommunityQnaBaseResponse<T> }) =>
  response.data.content;

export const createCommunityQnaIdempotencyKey = (scope: string) => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return `${scope}-${crypto.randomUUID()}`;
  }

  return `${scope}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const getCommunityQnaApiError = (error: unknown): ApiError | undefined => {
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

export const COMMUNITY_QNA_API_ERROR_CODE = {
  ACCESS_DENIED: 'CMQ005',
  ANSWER_NOT_FOUND: 'CMQ004',
  AUTH_REQUIRED: 'AUTH001',
  CONTENT_IMAGE_NOT_OWNED: 'CMQ008',
  IDEMPOTENCY_KEY_CONFLICT: 'CMQ007',
  QUESTION_NOT_FOUND: 'CMQ003',
  QUESTION_REVISION_CONFLICT: 'CMQ006',
  SELF_ANSWER_NOT_ALLOWED: 'CMQ015',
  SELF_ACCEPTANCE_NOT_ALLOWED: 'CMQ016',
} as const;

const COMMUNITY_QNA_DUPLICATE_ANSWER_MESSAGE_PATTERN =
  /이미.*답변|답변.*이미|중복.*답변|하나의 답변|duplicate answer/i;

const getCommunityQnaApiErrorCode = (error: unknown) => {
  return getCommunityQnaApiError(error)?.errorCode;
};

export const getCommunityQnaErrorMessage = (
  error: unknown,
  fallbackMessage: string,
) => {
  const apiError = getCommunityQnaApiError(error);

  if (apiError) {
    return apiError.message;
  }

  const analyzedError = analyzeError(error);

  if (
    analyzedError.type === ErrorType.NETWORK ||
    analyzedError.type === ErrorType.AUTH
  ) {
    return analyzedError.userMessage;
  }

  return fallbackMessage;
};

export const isCommunityQnaNotFoundError = (error: unknown) => {
  const apiError = getCommunityQnaApiError(error);

  if (!apiError) {
    return false;
  }

  return (
    apiError.statusCode === 404 ||
    apiError.errorCode === COMMUNITY_QNA_API_ERROR_CODE.QUESTION_NOT_FOUND ||
    apiError.errorCode === COMMUNITY_QNA_API_ERROR_CODE.ANSWER_NOT_FOUND
  );
};

export const isCommunityQnaConflictError = (error: unknown) => {
  return getCommunityQnaApiError(error)?.statusCode === 409;
};

export const isCommunityQnaAuthRequiredError = (error: unknown) => {
  const apiError = getCommunityQnaApiError(error);

  if (!apiError) {
    return false;
  }

  return (
    apiError.errorCode === COMMUNITY_QNA_API_ERROR_CODE.AUTH_REQUIRED ||
    apiError.statusCode === 401 ||
    (apiError.statusCode === 403 && apiError.message.includes('로그인이 필요'))
  );
};

export const isCommunityQnaAccessDeniedError = (error: unknown) => {
  const apiError = getCommunityQnaApiError(error);

  if (!apiError || isCommunityQnaAuthRequiredError(error)) {
    return false;
  }

  return (
    apiError.errorCode === COMMUNITY_QNA_API_ERROR_CODE.ACCESS_DENIED ||
    apiError.statusCode === 403
  );
};

export const isCommunityQnaQuestionRevisionConflictError = (error: unknown) => {
  return (
    getCommunityQnaApiErrorCode(error) ===
    COMMUNITY_QNA_API_ERROR_CODE.QUESTION_REVISION_CONFLICT
  );
};

export const isCommunityQnaIdempotencyConflictError = (error: unknown) => {
  return (
    getCommunityQnaApiErrorCode(error) ===
    COMMUNITY_QNA_API_ERROR_CODE.IDEMPOTENCY_KEY_CONFLICT
  );
};

export const isCommunityQnaDuplicateAnswerConflictError = (error: unknown) => {
  const apiError = getCommunityQnaApiError(error);

  if (!apiError || apiError.statusCode !== 409) {
    return false;
  }

  if (
    isCommunityQnaIdempotencyConflictError(error) ||
    isCommunityQnaQuestionRevisionConflictError(error)
  ) {
    return false;
  }

  return COMMUNITY_QNA_DUPLICATE_ANSWER_MESSAGE_PATTERN.test(apiError.message);
};

export const getCommunityQnaAuthRequiredMessage = (action: string) => {
  return `로그인 후 ${action}할 수 있습니다.`;
};

export const getCommunityQnaAccessDeniedMessage = (action: string) => {
  return `${action} 권한이 없습니다.`;
};

export const getCommunityQnaIdempotencyConflictMessage = () => {
  return '같은 멱등 키에 다른 요청이 들어와 처리할 수 없습니다. 최신 상태를 다시 확인한 뒤 다시 시도해 주세요.';
};

export const getCommunityQnaDuplicateAnswerConflictMessage = () => {
  return '이미 답변을 작성해 최신 상태를 다시 불러왔습니다. 내 답변을 확인해 주세요.';
};

export const getCommunityQnaQuestionRevisionConflictMessage = () => {
  return '다른 탭에서 먼저 수정되어 최신 질문 내용을 다시 불러왔습니다. 내용을 확인한 뒤 다시 저장해 주세요.';
};

export const getCommunityQnaAnswerRevisionConflictMessage = () => {
  return '다른 탭에서 먼저 수정되어 최신 답변 내용을 다시 불러왔습니다. 내용을 확인한 뒤 다시 저장해 주세요.';
};

export const getCommunityQnaCommentRevisionConflictMessage = () => {
  return '다른 탭에서 먼저 수정되어 최신 댓글 내용을 다시 불러왔습니다. 내용을 확인한 뒤 다시 저장해 주세요.';
};

export const isCommunityQnaSelfAnswerError = (error: unknown) => {
  return (
    getCommunityQnaApiErrorCode(error) ===
    COMMUNITY_QNA_API_ERROR_CODE.SELF_ANSWER_NOT_ALLOWED
  );
};

export const isCommunityQnaSelfAcceptanceError = (error: unknown) => {
  return (
    getCommunityQnaApiErrorCode(error) ===
    COMMUNITY_QNA_API_ERROR_CODE.SELF_ACCEPTANCE_NOT_ALLOWED
  );
};

export const getCommunityQnaQuestions = async (
  params: CommunityQnaQuestionListQueryParams,
) => {
  const response = await axiosInstance.get<
    CommunityQnaBaseResponse<CommunityQnaQuestionListApiResponse>
  >('/community/questions', {
    params,
  });

  return unwrap(response);
};

export const getCommunityQnaQuestionDetail = async (
  questionId: number,
  params: CommunityQnaQuestionDetailQueryParams,
) => {
  const response = await axiosInstance.get<
    CommunityQnaBaseResponse<CommunityQnaQuestionDetailAggregateApiResponse>
  >(`/community/questions/${questionId}`, {
    params,
  });

  return unwrap(response);
};

export const createCommunityQnaQuestion = async (
  request: CommunityQnaQuestionUpsertRequest,
  idempotencyKey = createCommunityQnaIdempotencyKey('community-qna-question'),
) => {
  const response = await axiosInstance.post<
    CommunityQnaBaseResponse<
      CommunityQnaQuestionDetailAggregateApiResponse['question']
    >
  >('/community/questions', request, {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  });

  return unwrap(response);
};

export const updateCommunityQnaQuestion = async (
  questionId: number,
  request: CommunityQnaQuestionUpsertRequest,
  revision: number,
) => {
  const response = await axiosInstance.put<
    CommunityQnaBaseResponse<
      CommunityQnaQuestionDetailAggregateApiResponse['question']
    >
  >(`/community/questions/${questionId}`, request, {
    headers: {
      'If-Match': String(revision),
    },
  });

  return unwrap(response);
};

export const deleteCommunityQnaQuestion = async (
  questionId: number,
  revision: number,
) => {
  const response = await axiosInstance.delete<
    CommunityQnaBaseResponse<CommunityQnaQuestionDeleteApiResponse>
  >(`/community/questions/${questionId}`, {
    headers: {
      'If-Match': String(revision),
    },
  });

  return unwrap(response);
};

export const createCommunityQnaAnswer = async (
  questionId: number,
  request: CommunityQnaAnswerUpsertRequest,
  idempotencyKey = createCommunityQnaIdempotencyKey('community-qna-answer'),
) => {
  const response = await axiosInstance.post<
    CommunityQnaBaseResponse<CommunityQnaAnswerMutationApiResponse>
  >(`/community/questions/${questionId}/answers`, request, {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  });

  return unwrap(response);
};

export const updateCommunityQnaAnswer = async (
  answerId: number,
  request: CommunityQnaAnswerUpsertRequest,
  revision: number,
) => {
  const response = await axiosInstance.put<
    CommunityQnaBaseResponse<CommunityQnaAnswerMutationApiResponse['answer']>
  >(`/community/answers/${answerId}`, request, {
    headers: {
      'If-Match': String(revision),
    },
  });

  return unwrap(response);
};

export const deleteCommunityQnaAnswer = async (
  answerId: number,
  revision: number,
) => {
  const response = await axiosInstance.delete<
    CommunityQnaBaseResponse<CommunityQnaAnswerDeleteApiResponse>
  >(`/community/answers/${answerId}`, {
    headers: {
      'If-Match': String(revision),
    },
  });

  return unwrap(response);
};

export const getCommunityQnaQuestionComments = async (
  questionId: number,
  page = 1,
  size = 20,
) => {
  const response = await axiosInstance.get<
    CommunityQnaBaseResponse<CommunityQnaQuestionCommentsPageApiResponse>
  >(`/community/questions/${questionId}/comments`, {
    params: { page, size },
  });

  return unwrap(response);
};

export const createCommunityQnaQuestionComment = async (
  questionId: number,
  request: CommunityQnaCommentRequest,
  idempotencyKey = createCommunityQnaIdempotencyKey(
    'community-qna-question-comment',
  ),
) => {
  const response = await axiosInstance.post<
    CommunityQnaBaseResponse<
      CommunityQnaQuestionCommentsPageApiResponse['items'][number]
    >
  >(`/community/questions/${questionId}/comments`, request, {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  });

  return unwrap(response);
};

export const getCommunityQnaAnswerComments = async (
  answerId: number,
  page = 1,
  size = 10,
) => {
  const response = await axiosInstance.get<
    CommunityQnaBaseResponse<CommunityQnaAnswerCommentsPageApiResponse>
  >(`/community/answers/${answerId}/comments`, {
    params: { page, size },
  });

  return unwrap(response);
};

export const createCommunityQnaAnswerComment = async (
  answerId: number,
  request: CommunityQnaCommentRequest,
  idempotencyKey = createCommunityQnaIdempotencyKey(
    'community-qna-answer-comment',
  ),
) => {
  const response = await axiosInstance.post<
    CommunityQnaBaseResponse<
      CommunityQnaAnswerCommentsPageApiResponse['items'][number]
    >
  >(`/community/answers/${answerId}/comments`, request, {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  });

  return unwrap(response);
};

export const updateCommunityQnaComment = async (
  commentId: number,
  request: CommunityQnaCommentRequest,
  revision: number,
) => {
  const response = await axiosInstance.put<
    CommunityQnaBaseResponse<
      CommunityQnaQuestionCommentsPageApiResponse['items'][number]
    >
  >(`/community/qna-comments/${commentId}`, request, {
    headers: {
      'If-Match': String(revision),
    },
  });

  return unwrap(response);
};

export const deleteCommunityQnaComment = async (
  commentId: number,
  revision: number,
) => {
  const response = await axiosInstance.delete<
    CommunityQnaBaseResponse<CommunityQnaCommentDeleteApiResponse>
  >(`/community/qna-comments/${commentId}`, {
    headers: {
      'If-Match': String(revision),
    },
  });

  return unwrap(response);
};

export const acceptCommunityQnaAnswer = async (answerId: number) => {
  const response = await axiosInstance.put<
    CommunityQnaBaseResponse<CommunityQnaAcceptanceApiResponse>
  >(`/community/answers/${answerId}/acceptance`);

  return unwrap(response);
};

export const clearCommunityQnaAnswerAcceptance = async (answerId: number) => {
  const response = await axiosInstance.delete<
    CommunityQnaBaseResponse<CommunityQnaAcceptanceApiResponse>
  >(`/community/answers/${answerId}/acceptance`);

  return unwrap(response);
};

export const recordCommunityQnaQuestionView = async (questionId: number) => {
  const response = await axiosInstance.post<
    CommunityQnaBaseResponse<CommunityQnaQuestionViewEventApiResponse>
  >(`/community/questions/${questionId}/views`);

  return unwrap(response);
};
