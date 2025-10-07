import { axiosInstance } from '@/shared/tanstack-query/axios';
import { EntryStatusRequest } from './types';

// 그룹 스터디 리스트 조회
export const getEntryList = async (params: EntryStatusRequest) => {
  const { status, groupStudyId, applyId } = params;

  const { data } = await axiosInstance.patch(
    `/group-studies/${groupStudyId}/apply/${applyId}/process`,
    {
      params: {
        status,
      },
    },
  );

  if (data.statusCode !== 200) {
    throw new Error('Failed to fetch entry list');
  }

  return data.content;
};
