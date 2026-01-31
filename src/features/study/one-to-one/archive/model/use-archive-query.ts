import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getArchive } from '@/features/study/one-to-one/archive/api/get-archive';
import { GetArchiveParams } from '@/types/archive';

export const ARCHIVE_QUERY_KEY = {
  all: ['archive'] as const,
  list: (params: GetArchiveParams) =>
    [...ARCHIVE_QUERY_KEY.all, params] as const,
};

export const useArchiveQuery = (
  params: GetArchiveParams,
  options?: { initialData?: Awaited<ReturnType<typeof getArchive>> },
) => {
  return useQuery({
    queryKey: ARCHIVE_QUERY_KEY.list(params),
    queryFn: () => getArchive(params),
    placeholderData: keepPreviousData,
    initialData: options?.initialData,
  });
};
