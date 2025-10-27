import { isAxiosError } from 'axios';
import { notFound } from 'next/navigation';
import { isApiError } from '@/shared/tanstack-query/api-error';
import { axiosServerInstance } from '@/shared/tanstack-query/axios.server';
import {
  GroupStudyDetailRequest,
  GroupStudyDetailResponse,
} from './group-study-types';

// 그룹 스터디 리스트 조회
export const getGroupStudyDetailInServer = async ({
  groupStudyId,
}: GroupStudyDetailRequest): Promise<GroupStudyDetailResponse> => {
  try {
    const res = await axiosServerInstance.get(`/group-studies/${groupStudyId}`);

    return res.data.content;
  } catch (error: any) {
    // 서버에서 그룹스터디를 찾을 수 없다는 에러가 오면 notFound 호출
    if (
      isAxiosError(error) &&
      error.response &&
      isApiError(error.response.data) &&
      error?.response?.data?.errorCode === 'CMM002'
    ) {
      notFound();
    }
  }
};
