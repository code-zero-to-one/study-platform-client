import ArchiveTabClient from './archive-tab-client';
import { getArchiveServer } from '@/features/archive/api/get-archive.server';
import { GetArchiveParams } from '@/types/archive';

export default async function ArchiveTab() {
  const initialParams: GetArchiveParams = {
    page: 0,
    size: 10,
    sort: 'LATEST',
  };

  const initialData = await getArchiveServer(initialParams);

  return (
    <ArchiveTabClient initialData={initialData} initialParams={initialParams} />
  );
}
