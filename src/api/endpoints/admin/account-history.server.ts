import { axiosServerInstance } from '@/api/client/axios.server';
import {
  GetAccountHistoriesRequest,
  GetAccountHistoriesResponse,
} from '@/types/api/admin.types';

// 회원 계정 이력 조회
export const getAccountHistoriesInServer = async ({
  memberId,
}: GetAccountHistoriesRequest): Promise<GetAccountHistoriesResponse> => {
  const res = await axiosServerInstance.get(
    `/admin/members/${memberId}/account-histories`,
  );

  return res.data.content;
};
