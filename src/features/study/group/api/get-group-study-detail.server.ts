import { isAxiosError } from 'axios';
import { notFound } from 'next/navigation';
import { isApiError } from '@/api/client/api-error';
import { createApiServerInstance } from '@/api/client/open-api-instance.server';
import { GroupStudyManagementApi } from '@/api/openapi/api/group-study-management-api';
import { MOCK_PREMIUM_STUDY_DETAIL_2 } from '@/mocks/premium-study-mock-data';
import {
  GroupStudyDetailRequest,
  GroupStudyFullResponse,
} from './group-study-types';

// 그룹 스터디 상세 조회
export const getGroupStudyDetailInServer = async ({
  groupStudyId,
}: GroupStudyDetailRequest): Promise<GroupStudyFullResponse | undefined> => {
  // 프로토타입: 멘토스터디 상세 id=2일 때 목데이터 반환
  if (groupStudyId === 2) {
    return MOCK_PREMIUM_STUDY_DETAIL_2 as GroupStudyFullResponse;
  }

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
  }
};
