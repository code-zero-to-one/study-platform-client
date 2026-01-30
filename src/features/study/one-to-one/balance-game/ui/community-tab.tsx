import CommunityTabClient from './community-tab-client';
import { getBalanceGameListServer } from '@/features/study/one-to-one/balance-game/api/balance-game-api.server';

export default async function CommunityTab() {
  const initialList = await getBalanceGameListServer({
    page: 1,
    size: 10,
    sort: 'latest',
    status: 'active',
  });

  return <CommunityTabClient initialList={initialList} />;
}
