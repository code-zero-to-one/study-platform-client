import { getBalanceGameListServer } from '@/api/endpoints/balance-game/balance-game-api.server';
import { safeServerPrefetch } from '@/utils/safe-server-prefetch';
import CommunityTabClient from './community-tab-client';

export default async function CommunityTab() {
  const initialList = await safeServerPrefetch(
    () =>
      getBalanceGameListServer({
        page: 1,
        size: 10,
        sort: 'latest',
        status: 'active',
      }),
    { logLabel: 'Balance game prefetch' },
  );

  return <CommunityTabClient initialList={initialList} />;
}
