import { axiosInstance } from '@/api/client/axios';
import {
  ArchiveResponse,
  GetArchiveParams,
} from '@/types/one-to-one-study/archive';

export const getArchive = async (params: GetArchiveParams) => {
  const { data } = await axiosInstance.get<{ content: ArchiveResponse }>(
    '/archive',
    {
      params,
    },
  );

  return data.content;
};
