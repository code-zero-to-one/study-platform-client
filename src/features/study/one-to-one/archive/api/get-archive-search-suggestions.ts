import { axiosInstance } from '@/api/client/axios';
import type {
  ArchiveSearchSuggestionResponse,
  GetArchiveSearchSuggestionsParams,
} from '@/types/one-to-one-study/archive';

const isArchiveSearchSuggestionResponse = (
  value: unknown,
): value is ArchiveSearchSuggestionResponse =>
  !!value &&
  typeof value === 'object' &&
  'titles' in value &&
  'authors' in value;

export const getArchiveSearchSuggestions = async ({
  q,
  minLength = 1,
  size = 10,
}: GetArchiveSearchSuggestionsParams): Promise<ArchiveSearchSuggestionResponse> => {
  const response = await axiosInstance.get<
    | ArchiveSearchSuggestionResponse
    | { content?: ArchiveSearchSuggestionResponse }
    | {
        statusCode?: number;
        timestamp?: string;
        content?: ArchiveSearchSuggestionResponse;
        message?: string;
      }
  >('/archive/suggestions', {
    params: { q, minLength, size },
  });

  const payload =
    response.data && 'content' in response.data
      ? response.data.content
      : response.data;

  if (!isArchiveSearchSuggestionResponse(payload)) {
    return { titles: [], authors: [] };
  }

  return {
    titles: payload.titles ?? [],
    authors: payload.authors ?? [],
  };
};
