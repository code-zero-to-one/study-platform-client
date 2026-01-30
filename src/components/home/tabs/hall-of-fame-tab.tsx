import HallOfFameTabClient from './hall-of-fame-tab-client';
import { getHallOfFameServer } from '@/features/hall-of-fame/api/hall-of-fame-api.server';

export default async function HallOfFameTab() {
  const initialData = await getHallOfFameServer();

  return <HallOfFameTabClient initialData={initialData} />;
}
