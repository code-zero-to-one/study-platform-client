import { axiosInstance } from '@/api/client/axios';
import { createApiInstance } from '@/api/client/open-api-instance';
import { GroupStudyManagementApi } from '@/api/openapi';
import {
  GroupStudyDetailRequest,
  GroupStudyDetailResponse,
} from '@/types/api/group-study.types';

// 그룹 스터디 리스트 조회
export const getGroupStudyDetail = async (
  params: GroupStudyDetailRequest,
): Promise<GroupStudyDetailResponse> => {
  const { groupStudyId } = params;

  try {
    // const groupStudyApi = createApiInstance(GroupStudyManagementApi);

    // const { data } = await groupStudyApi.getGroupStudy(groupStudyId);
    const { data } = await axiosInstance.get(`/group-studies/${groupStudyId}`);

    if (data.statusCode !== 200) {
      throw new Error('Failed to fetch group study list');
    }

    return data.content;
  } catch (err) {
    console.error('Error in getGroupStudyDetail:', err);
    throw err;
  }
};
