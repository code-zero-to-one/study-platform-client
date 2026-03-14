import { axiosServerInstance } from '@/api/client/axios.server';
import {
  ArchiveResponse,
  GetArchiveParams,
} from '@/types/one-to-one-study/archive';

export const getArchiveServer = async (params: GetArchiveParams) => {
  const { data } = await axiosServerInstance.get<{ content: ArchiveResponse }>(
    '/archive',
    {
      params,
    },
  );

  return data.content;
};
