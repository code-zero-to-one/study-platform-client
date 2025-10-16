import { axiosInstance } from '@/shared/tanstack-query/axios';
import {
  GroupStudyDetailRequest,
  GroupStudyDetailResponse,
} from './group-study-types';

// 그룹 스터디 리스트 조회
export const getGroupStudyDetail = async (
  params: GroupStudyDetailRequest,
): Promise<GroupStudyDetailResponse> => {
  const { groupStudyId } = params;

  console.log('groupStudyId', groupStudyId);

  try {
    const { data } = await axiosInstance.get(`/group-studies/${groupStudyId}`);

    if (data.statusCode !== 200) {
      throw new Error('Failed to fetch group study list');
    }

    console.log('data', data);

    return data.content;
  } catch (err) {}
};
