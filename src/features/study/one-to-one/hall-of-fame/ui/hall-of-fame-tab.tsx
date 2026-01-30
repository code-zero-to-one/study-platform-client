import { getHallOfFameServer } from '@/features/study/one-to-one/hall-of-fame/api/hall-of-fame-api.server';
import HallOfFameTabClient from './hall-of-fame-tab-client';

export default async function HallOfFameTab() {
  const initialData = await getHallOfFameServer();

  return <HallOfFameTabClient initialData={initialData} />;
}
