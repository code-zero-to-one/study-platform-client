import { axiosInstance } from '@/api/client/axios';

export interface TestLoginResponse {
  accessToken: string;
  memberId: string;
  profileImageUrl?: string;
}

export const testLogin = async (
  memberId: number,
): Promise<TestLoginResponse> => {
  const { data } = await axiosInstance.post<{ content: TestLoginResponse }>(
    '/growth/test/login',
    { memberId },
  );

  return data.content;
};
