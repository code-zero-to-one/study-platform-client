import { axiosInstance } from '@/api/client/axios';

export const toggleArchiveVisibility = async (
  id: number,
  isPrivate: boolean,
) => {
  const { data } = await axiosInstance.patch<{
    content: { isPrivate: boolean };
  }>(`/archive/${id}/visibility`, {
    isPrivate,
  });

  return data.content;
};
