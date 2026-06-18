import { useQuery } from '@tanstack/react-query';
import {
  getMyStudyHistory,
  GetMyStudyHistoryParams,
} from '@/api/endpoints/study-history/get-my-study-history';

export const STUDY_HISTORY_QUERY_KEY = {
  all: ['myStudyHistory'] as const,
  list: (params: GetMyStudyHistoryParams) =>
    [...STUDY_HISTORY_QUERY_KEY.all, params] as const,
};

export const useMyStudyHistoryQuery = (
  params: GetMyStudyHistoryParams,
  options?: { initialData?: Awaited<ReturnType<typeof getMyStudyHistory>> },
) => {
  return useQuery({
    queryKey: STUDY_HISTORY_QUERY_KEY.list(params),
    queryFn: () => getMyStudyHistory(params),
    select: (data) => data.content, // API 응답에서 content 부분만 추출해서 사용하기 편하게 함
    initialData: options?.initialData,
  });
};
