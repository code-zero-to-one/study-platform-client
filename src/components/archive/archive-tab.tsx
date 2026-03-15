import { getArchiveServer } from '@/api/endpoints/archive/get-archive.server';
import { ARCHIVE_PAGE_SIZE } from '@/config/archive-const';
import { readServerAccessToken } from '@/features/auth/model/server-auth-session';
import { GetArchiveParams } from '@/types/one-to-one-study/archive';
import { safeServerPrefetch } from '@/utils/safe-server-prefetch';
import ArchiveTabClient from './archive-tab-client';

export default async function ArchiveTab() {
  const initialParams: GetArchiveParams = {
    page: 0,
    size: ARCHIVE_PAGE_SIZE.GRID,
    sort: 'LATEST',
  };

  const accessToken = await readServerAccessToken();
  const initialData = accessToken
    ? await safeServerPrefetch(() => getArchiveServer(initialParams), {
        logLabel: 'Archive prefetch',
      })
    : undefined;

  return (
    <ArchiveTabClient initialData={initialData} initialParams={initialParams} />
  );
}
