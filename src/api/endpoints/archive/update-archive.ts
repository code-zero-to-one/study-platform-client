import { axiosInstance } from '@/api/client/axios';

export interface UpdateArchiveRequest {
  title?: string;
  description?: string;
  link?: string;
  isPrivate?: boolean;
}

export interface UpdateArchiveResponse {
  id: number;
  title: string;
  description: string;
  link: string;
  isPrivate: boolean;
}

export const updateArchive = async (
  id: number,
  request: UpdateArchiveRequest,
) => {
  const { data } = await axiosInstance.patch<{
    data?: UpdateArchiveResponse;
    content?: UpdateArchiveResponse;
  }>(`/archive/${id}`, request);

  return data.data ?? data.content;
};
