import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BALANCE_GAME_KEYS } from './use-balance-game-query';
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
import { UpdateBalanceGameRequest } from '../types';

export const useCreateBalanceGameMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBalanceGame,
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: BALANCE_GAME_KEYS.lists() })
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
          queryKey: BALANCE_GAME_KEYS.detail(gameId),
        })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
      queryClient
        .invalidateQueries({ queryKey: BALANCE_GAME_KEYS.lists() })
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
          queryKey: BALANCE_GAME_KEYS.detail(gameId),
        })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
      queryClient
        .invalidateQueries({ queryKey: BALANCE_GAME_KEYS.lists() })
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
          queryKey: BALANCE_GAME_KEYS.comments(gameId),
        })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
      queryClient
        .invalidateQueries({
          queryKey: BALANCE_GAME_KEYS.detail(gameId),
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
          queryKey: BALANCE_GAME_KEYS.comments(gameId),
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
          queryKey: BALANCE_GAME_KEYS.comments(gameId),
        })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
      queryClient
        .invalidateQueries({
          queryKey: BALANCE_GAME_KEYS.detail(gameId),
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
          queryKey: BALANCE_GAME_KEYS.detail(gameId),
        })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
      queryClient
        .invalidateQueries({ queryKey: BALANCE_GAME_KEYS.lists() })
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
        .invalidateQueries({ queryKey: BALANCE_GAME_KEYS.lists() })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
      queryClient.removeQueries({ queryKey: BALANCE_GAME_KEYS.detail(gameId) });
    },
  });
};
