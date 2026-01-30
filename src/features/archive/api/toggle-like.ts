import { axiosInstance } from '@/api/client/axios';

export const toggleArchiveLike = async (id: number) => {
  const { data } = await axiosInstance.post<{ content: { isLiked: boolean } }>(
    `/archive/${id}/like`
  );
  return data.content;
};
