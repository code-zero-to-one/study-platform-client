import { axiosInstance } from '@/api/client/axios';

export interface NicknameCheckResponse {
  nickname: string;
  available: boolean;
}

/**
 * 닉네임 중복 체크 API
 */
export async function checkNicknameAvailability(
  nickname: string,
): Promise<NicknameCheckResponse> {
  const res = await axiosInstance.get<{
    statusCode: number;
    content: NicknameCheckResponse;
    message: string;
  }>('/nicknames/check', {
    params: { nickname },
  });

  return res.data.content;
}
