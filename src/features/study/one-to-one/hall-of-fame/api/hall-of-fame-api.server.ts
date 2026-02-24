import { axiosServerInstance } from '@/api/client/axios.server';
import type { HallOfFameResponse, HallOfFameData } from '@/types/one-to-one-study/hall-of-fame';

export const getHallOfFameServer = async (): Promise<HallOfFameData> => {
  const response =
    await axiosServerInstance.get<HallOfFameResponse>('/hall-of-fame');

  if (response.data && response.data.content) {
    return response.data.content;
  }

  throw new Error('Invalid API response structure');
};
