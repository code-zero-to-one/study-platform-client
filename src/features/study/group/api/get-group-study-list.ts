import { axiosInstance } from '@/shared/tanstack-query/axios';
import { GroupStudyListRequest } from './group-study-types';

// 그룹 스터디 리스트 조회
export const getGroupStudyList = async (params: GroupStudyListRequest) => {
  const { page, size, status } = params;

  const { data } = await axiosInstance.get('/group-studies', {
    params: {
      page,
      size,
      status,
    },
  });

  if (data.statusCode !== 200) {
    throw new Error('Failed to fetch group study list');
  }

  return data.content;
};
