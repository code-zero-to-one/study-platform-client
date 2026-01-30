import { axiosInstance } from '@/api/client/axios';
import type { HallOfFameResponse, HallOfFameData } from '../types';

/**
 * 명예의 전당 정보 조회
 * GET /api/v1/hall-of-fame
 */
export const getHallOfFame = async (): Promise<HallOfFameData> => {
  try {
    const response =
      await axiosInstance.get<HallOfFameResponse>('/hall-of-fame');

    if (response.data && response.data.content) {
      return response.data.content;
    }

    throw new Error('Invalid API response structure');
  } catch (error) {
    console.error('Failed to fetch hall of fame data:', error);
    throw error;
  }
};
