import { axiosInstance } from '@/api/client/axios';
import {
  GetSincerityTemperatureHistoryRequest,
  GetSincerityTemperatureHistoryResponse,
} from '@/types/api/admin.types';

// 성실 온도 이력 조회 API 요청 함수
export const getSincerityTemperatureHistory = async ({
  memberId,
  page = 1,
}: GetSincerityTemperatureHistoryRequest): Promise<GetSincerityTemperatureHistoryResponse> => {
  const queryString = `page=${page}&page-size=10`;

  const res = await axiosInstance.get(
    `/admin/members/${memberId}/sincerity-temperature-histories?${queryString}`,
  );

  return res.data.content;
};
