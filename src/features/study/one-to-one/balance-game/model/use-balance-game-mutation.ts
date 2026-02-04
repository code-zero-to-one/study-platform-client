import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BALANCE_GAME_QUERY_KEYS } from '@/features/study/one-to-one/balance-game/model/balance-game-keys';
import { UpdateBalanceGameRequest } from '@/types/balance-game';
import {
  cancelVoteBalanceGame,
  createBalanceGame,
  createBalanceGameComment,
  deleteBalanceGame,
  deleteBalanceGameComment,
  updateBalanceGame,
  updateBalanceGameComment,
  voteBalanceGame,
} from '../api/balance-game-api';

export const useCreateBalanceGameMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBalanceGame,
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: BALANCE_GAME_QUERY_KEYS.lists() })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
    },
  });
};

export const useVoteBalanceGameMutation = (gameId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (optionId: number) => voteBalanceGame(gameId, { optionId }),
    onSuccess: () => {
      queryClient
        .invalidateQueries({
          queryKey: BALANCE_GAME_QUERY_KEYS.detail(gameId),
        })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
      queryClient
        .invalidateQueries({ queryKey: BALANCE_GAME_QUERY_KEYS.lists() })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
    },
  });
};

export const useCancelVoteBalanceGameMutation = (gameId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cancelVoteBalanceGame(gameId),
    onSuccess: () => {
      queryClient
        .invalidateQueries({
          queryKey: BALANCE_GAME_QUERY_KEYS.detail(gameId),
        })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
      queryClient
        .invalidateQueries({ queryKey: BALANCE_GAME_QUERY_KEYS.lists() })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
    },
  });
};

export const useCreateBalanceGameCommentMutation = (gameId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      createBalanceGameComment(gameId, { content }),
    onSuccess: () => {
      queryClient
        .invalidateQueries({
          queryKey: BALANCE_GAME_QUERY_KEYS.comments(gameId),
        })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
      queryClient
        .invalidateQueries({
          queryKey: BALANCE_GAME_QUERY_KEYS.detail(gameId),
        })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
    },
  });
};

export const useUpdateBalanceGameCommentMutation = (gameId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: number;
      content: string;
    }) => updateBalanceGameComment(gameId, commentId, { content }),
    onSuccess: () => {
      queryClient
        .invalidateQueries({
          queryKey: BALANCE_GAME_QUERY_KEYS.comments(gameId),
        })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
    },
  });
};

export const useDeleteBalanceGameCommentMutation = (gameId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) =>
      deleteBalanceGameComment(gameId, commentId),
    onSuccess: () => {
      queryClient
        .invalidateQueries({
          queryKey: BALANCE_GAME_QUERY_KEYS.comments(gameId),
        })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
      queryClient
        .invalidateQueries({
          queryKey: BALANCE_GAME_QUERY_KEYS.detail(gameId),
        })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
    },
  });
};

export const useUpdateBalanceGameMutation = (gameId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateBalanceGameRequest) =>
      updateBalanceGame(gameId, body),
    onSuccess: () => {
      queryClient
        .invalidateQueries({
          queryKey: BALANCE_GAME_QUERY_KEYS.detail(gameId),
        })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
      queryClient
        .invalidateQueries({ queryKey: BALANCE_GAME_QUERY_KEYS.lists() })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
    },
  });
};

export const useDeleteBalanceGameMutation = (gameId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteBalanceGame(gameId),
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: BALANCE_GAME_QUERY_KEYS.lists() })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
      queryClient.removeQueries({
        queryKey: BALANCE_GAME_QUERY_KEYS.detail(gameId),
      });
    },
  });
};
