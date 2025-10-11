import { axiosInstance } from '@/shared/tanstack-query/axios';
import { EntryListRequest, GroupStudyApplyListResponse } from './types';

// 스터디 신청자 리스트 조회
export const getEntryList = async (
  params: EntryListRequest,
): Promise<GroupStudyApplyListResponse> => {
  const { page, size, status, groupStudyId } = params;

  const { data } = await axiosInstance.get(
    `/group-studies/${groupStudyId}/applies?applyStatus=${status}`,
    {
      params: {
        page,
        size,
      },
    },
  );

  if (data.statusCode !== 200) {
    throw new Error('Failed to fetch entry list');
  }

  return data.content;
};
