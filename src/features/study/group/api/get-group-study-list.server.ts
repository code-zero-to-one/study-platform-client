import { axiosServerInstance } from '@/api/client/axios.server';
import {
  GroupStudyListRequest,
  GroupStudyListResponse,
} from './group-study-types';

// 그룹 스터디 리스트 조회 (서버사이드)
export const getGroupStudyListInServer = async (
  params: GroupStudyListRequest,
): Promise<GroupStudyListResponse> => {
  const { page, size, status } = params;

  const { data } = await axiosServerInstance.get('/group-studies', {
    params: {
      page,
      'page-size': size,
      groupStudyStatus: status,
    },
  });

  if (data.statusCode !== 200) {
    throw new Error('Failed to fetch group study list');
  }

  return data.content;
};
