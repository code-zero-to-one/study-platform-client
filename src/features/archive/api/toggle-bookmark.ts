import { axiosInstance } from '@/api/client/axios';

export const toggleArchiveBookmark = async (id: number) => {
  const { data } = await axiosInstance.post<{
    content: { isBookmarked: boolean };
  }>(`/archive/${id}/bookmark`);

  return data.content;
};
