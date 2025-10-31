import { axiosInstance } from '@/shared/tanstack-query/axios';
import {
  GroupStudyListRequest,
  GroupStudyListResponse,
} from './group-study-types';

// 그룹 스터디 리스트 조회
export const getGroupStudyList = async (
  params: GroupStudyListRequest,
): Promise<GroupStudyListResponse> => {
  const { page, size, status } = params;

  try {
    const { data } = await axiosInstance.get('/group-studies', {
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
  } catch (err) {
    console.error(err);
  }
};
