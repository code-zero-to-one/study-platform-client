import ArchiveTabClient from './archive-tab-client';
import { getArchiveServer } from '@/features/study/one-to-one/archive/api/get-archive.server';
import { ARCHIVE_PAGE_SIZE } from '@/features/study/one-to-one/archive/const/archive';
import { GetArchiveParams } from '@/types/archive';

export default async function ArchiveTab() {
  const initialParams: GetArchiveParams = {
    page: 0,
    size: ARCHIVE_PAGE_SIZE.GRID,
    sort: 'LATEST',
  };

  const initialData = await getArchiveServer(initialParams);

  return (
    <ArchiveTabClient initialData={initialData} initialParams={initialParams} />
  );
}
