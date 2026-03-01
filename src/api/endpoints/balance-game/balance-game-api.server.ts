import { axiosServerInstance } from '@/api/client/axios.server';
import type {
  ApiResponse,
  BalanceGame,
  BalanceGameCommentListResponse,
  BalanceGameListResponse,
} from '@/types/balance-game';

export const getBalanceGameListServer = async (params: {
  page?: number;
  size?: number;
  sort?: 'latest' | 'popular';
  status?: 'active' | 'closed';
  q?: string;
}): Promise<BalanceGameListResponse> => {
  const { page = 1, size = 10, sort = 'latest', status, q } = params;

  const response = await axiosServerInstance.get<
    ApiResponse<BalanceGameListResponse>
  >('/balance-games', {
    params: {
      page,
      size,
      sort,
      status,
      q,
    },
  });

  if (response.data && 'content' in response.data) {
    return response.data.content;
  }

  return response.data as unknown as BalanceGameListResponse;
};

export const getBalanceGameDetailServer = async (
  gameId: number,
): Promise<BalanceGame> => {
  const response = await axiosServerInstance.get<ApiResponse<BalanceGame>>(
    `/balance-games/${gameId}`,
  );

  if (response.data && 'content' in response.data) {
    return response.data.content;
  }

  return response.data as unknown as BalanceGame;
};

export const getBalanceGameCommentsServer = async (
  gameId: number,
  params: { page?: number; size?: number },
): Promise<BalanceGameCommentListResponse> => {
  const { page = 0, size = 10 } = params;
  const response = await axiosServerInstance.get<
    ApiResponse<BalanceGameCommentListResponse>
  >(`/balance-games/${gameId}/comments`, {
    params: { page, size },
  });

  if (response.data && 'content' in response.data) {
    return response.data.content;
  }

  return response.data as unknown as BalanceGameCommentListResponse;
};
