import { axiosInstance } from '@/api/client/axios';
import {
  ApiResponse,
  BalanceGame,
  BalanceGameCommentListResponse,
  BalanceGameListResponse,
  CreateBalanceGameRequest,
  CreateCommentRequest,
  UpdateBalanceGameRequest,
  UpdateCommentRequest,
  VoteRequest,
  BalanceGameTagSuggestion,
} from '@/types/balance-game';

// 1. 밸런스 게임 목록 조회
export const getBalanceGameList = async (params: {
  page?: number;
  size?: number;
  sort?: 'latest' | 'popular';
  status?: 'active' | 'closed';
  tags?: string[];
  q?: string;
}): Promise<BalanceGameListResponse> => {
  // 백엔드는 page를 1부터 시작하고 size를 사용함
  const { page = 1, size = 10, sort = 'latest', status, tags, q } = params;
  const tagParam =
    tags && tags.length > 0 ? tags.filter(Boolean).join(',') : undefined;

  const response = await axiosInstance.get<
    ApiResponse<BalanceGameListResponse>
  >('/balance-games', {
    params: {
      page,
      size,
      sort,
      status,
      tags: tagParam,
      q,
    },
  });

  // content 필드 사용 (실제 백엔드 응답 구조 반영)
  if (response.data && 'content' in response.data) {
    return response.data.content;
  }

  // Fallback: 혹시 content 없이 바로 데이터가 오는 경우
  return response.data as unknown as BalanceGameListResponse;
};

// 2. 밸런스 게임 상세 조회
export const getBalanceGameDetail = async (
  gameId: number,
): Promise<BalanceGame> => {
  const response = await axiosInstance.get<ApiResponse<BalanceGame>>(
    `/balance-games/${gameId}`,
  );

  if (response.data && 'content' in response.data) {
    return response.data.content;
  }

  return response.data as unknown as BalanceGame;
};

// 3. 밸런스 게임 생성
export const createBalanceGame = async (
  body: CreateBalanceGameRequest,
): Promise<number> => {
  const response = await axiosInstance.post<ApiResponse<number>>(
    '/balance-games',
    body,
  );

  return response.data.content;
};

// 4. 투표하기
export const voteBalanceGame = async (
  gameId: number,
  body: VoteRequest,
): Promise<void> => {
  await axiosInstance.post<ApiResponse<null>>(
    `/balance-games/${gameId}/votes`,
    body,
  );
};

// 5. 투표 취소
export const cancelVoteBalanceGame = async (gameId: number): Promise<void> => {
  await axiosInstance.delete<ApiResponse<null>>(
    `/balance-games/${gameId}/votes`,
  );
};

// 6. 댓글 목록 조회
export const getBalanceGameComments = async (
  gameId: number,
  params: { page?: number; size?: number },
): Promise<BalanceGameCommentListResponse> => {
  const { page = 0, size = 10 } = params;

  const response = await axiosInstance.get<
    ApiResponse<BalanceGameCommentListResponse>
  >(`/balance-games/${gameId}/comments`, {
    params: { page, size },
  });

  if (response.data && 'content' in response.data) {
    return response.data.content;
  }

  return response.data as unknown as BalanceGameCommentListResponse;
};

// 7. 댓글 작성
export const createBalanceGameComment = async (
  gameId: number,
  body: CreateCommentRequest,
): Promise<number> => {
  const { data } = await axiosInstance.post<ApiResponse<number>>(
    `/balance-games/${gameId}/comments`,
    body,
  );

  return data.content;
};

// 8. 댓글 수정
export const updateBalanceGameComment = async (
  gameId: number,
  commentId: number,
  body: UpdateCommentRequest,
): Promise<void> => {
  await axiosInstance.put<ApiResponse<null>>(
    `/balance-games/${gameId}/comments/${commentId}`,
    body,
  );
};

// 9. 댓글 삭제
export const deleteBalanceGameComment = async (
  gameId: number,
  commentId: number,
): Promise<void> => {
  await axiosInstance.delete<ApiResponse<null>>(
    `/balance-games/${gameId}/comments/${commentId}`,
  );
};

// 10. 밸런스 게임 수정
export const updateBalanceGame = async (
  gameId: number,
  body: UpdateBalanceGameRequest,
): Promise<void> => {
  await axiosInstance.put<ApiResponse<null>>(`/balance-games/${gameId}`, body);
};

// 11. 밸런스 게임 삭제
export const deleteBalanceGame = async (gameId: number): Promise<void> => {
  await axiosInstance.delete<ApiResponse<null>>(`/balance-games/${gameId}`);
};

// 12. 밸런스 게임 태그 검색 (prefix)
export const getBalanceGameTagSuggestions = async (params: {
  q?: string;
  minLength?: number;
  size?: number;
  sort?: 'popular' | 'alphabetical';
}): Promise<BalanceGameTagSuggestion[]> => {
  const { q, minLength = 1, size = 10, sort = 'popular' } = params;
  const response = await axiosInstance.get<
    ApiResponse<{
      suggestions?: BalanceGameTagSuggestion[] | string[];
      tags?: BalanceGameTagSuggestion[] | string[];
    }>
  >('/balance-games/tags', {
    params: { q, minLength, size, sort },
  });

  const payload =
    response.data && 'content' in response.data
      ? response.data.content
      : (response.data as unknown as {
          suggestions?: BalanceGameTagSuggestion[] | string[];
          tags?: BalanceGameTagSuggestion[] | string[];
        });

  const rawTags = payload?.suggestions ?? payload?.tags ?? [];

  return rawTags.map((tag) => (typeof tag === 'string' ? { name: tag } : tag));
};
