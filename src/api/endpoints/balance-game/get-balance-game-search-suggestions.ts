import { axiosInstance } from '@/api/client/axios';
import type {
  BalanceGameSearchSuggestionResponse,
  GetBalanceGameSearchSuggestionsParams,
} from '@/types/balance-game';

export const getBalanceGameSearchSuggestions = async ({
  q,
  minLength = 1,
  size = 10,
  scope = 'all',
}: GetBalanceGameSearchSuggestionsParams): Promise<BalanceGameSearchSuggestionResponse> => {
  const response = await axiosInstance.get<
    | BalanceGameSearchSuggestionResponse
    | { content?: BalanceGameSearchSuggestionResponse }
    | {
        statusCode?: number;
        timestamp?: string;
        content?: BalanceGameSearchSuggestionResponse;
        message?: string;
      }
  >('/balance-games/suggestions', {
    params: { q, minLength, size, scope },
  });

  const isSuggestionResponse = (
    value: unknown,
  ): value is BalanceGameSearchSuggestionResponse =>
    !!value &&
    typeof value === 'object' &&
    Array.isArray((value as BalanceGameSearchSuggestionResponse).titles) &&
    Array.isArray((value as BalanceGameSearchSuggestionResponse).authors);

  const payload =
    'content' in response.data ? response.data.content : response.data;
  const safePayload = isSuggestionResponse(payload) ? payload : undefined;

  return {
    titles: safePayload?.titles ?? [],
    authors: safePayload?.authors ?? [],
  };
};
