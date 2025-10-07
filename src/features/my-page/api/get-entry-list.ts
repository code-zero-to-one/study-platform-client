import { axiosInstance } from '@/shared/tanstack-query/axios';
import { EntryListRequest } from './types';

// 그룹 스터디 리스트 조회
export const getEntryList = async (params: EntryListRequest) => {
  const { page, size, status, groupStudyId } = params;

  const { data } = await axiosInstance.get(
    `/group-studies/${groupStudyId}/applies`,
    {
      params: {
        page,
        size,
        status,
      },
    },
  );

  if (data.statusCode !== 200) {
    throw new Error('Failed to fetch entry list');
  }

  return data.content;
};
