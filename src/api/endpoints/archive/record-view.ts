import { axiosInstance } from '@/api/client/axios';

export const recordArchiveView = async (id: number) => {
  await axiosInstance.post(`/archive/${id}/view`);
};
