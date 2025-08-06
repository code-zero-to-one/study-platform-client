import { axiosAllInstance } from './axios.all';

export const getNewAccessToken = async (): Promise<{
  accessToken: string;
}> => {
  const res = await axiosAllInstance.get('/auth/refresh');

  return res.data.content;
};
