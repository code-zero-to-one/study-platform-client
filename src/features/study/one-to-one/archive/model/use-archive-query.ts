import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getArchive } from '@/features/study/one-to-one/archive/api/get-archive';
import { ARCHIVE_QUERY_KEYS } from '@/features/study/one-to-one/archive/model/archive-keys';
import { GetArchiveParams } from '@/types/one-to-one-study/archive';

export const useArchiveQuery = (
  params: GetArchiveParams,
  options?: { initialData?: Awaited<ReturnType<typeof getArchive>> },
) => {
  return useQuery({
    queryKey: ARCHIVE_QUERY_KEYS.list(params),
    queryFn: () => getArchive(params),
    placeholderData: keepPreviousData,
    initialData: options?.initialData,
  });
};
