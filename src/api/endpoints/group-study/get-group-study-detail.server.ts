import { isAxiosError } from 'axios';
import { notFound } from 'next/navigation';
import { isApiError } from '@/api/client/api-error';
import { createApiServerInstance } from '@/api/client/open-api-instance.server';
import { GroupStudyManagementApi } from '@/api/openapi/api/group-study-management-api';
import {
  GroupStudyDetailRequest,
  GroupStudyFullResponse,
} from '@/types/api/group-study.types';

// 그룹 스터디 리스트 조회
export const getGroupStudyDetailInServer = async ({
  groupStudyId,
}: GroupStudyDetailRequest): Promise<GroupStudyFullResponse> => {
  try {
    const groupStudyApi = createApiServerInstance(GroupStudyManagementApi);

    const { data } = await groupStudyApi.getGroupStudy(groupStudyId);

    return data.content;
  } catch (error: unknown) {
    // 서버에서 그룹스터디를 찾을 수 없다는 에러가 오면 notFound 호출
    if (
      isAxiosError(error) &&
      error.response &&
      isApiError(error.response.data) &&
      error?.response?.data?.errorCode === 'GSM001'
    ) {
      notFound();
    }

    throw error;
  }
};
