import { getHallOfFameServer } from '@/features/study/one-to-one/hall-of-fame/api/hall-of-fame-api.server';
import { safeServerPrefetch } from '@/utils/safe-server-prefetch';
import HallOfFameTabClient from './hall-of-fame-tab-client';

export default async function HallOfFameTab() {
  const initialData = await safeServerPrefetch(() => getHallOfFameServer(), {
    logLabel: 'Hall of fame prefetch',
  });

  return <HallOfFameTabClient initialData={initialData} />;
}
