import { axiosInstance } from '@/shared/tanstack-query/axios';
import { GroupStudyNoticeRequest } from './group-study-types';

// 그룹 스터디 공지 등록
export const postGroupStudyNotice = async (
  groupStudyId: number,
  body: GroupStudyNoticeRequest,
) => {
  const res = await axiosInstance.post(
    `/group-studies/${groupStudyId}/notice`,
    body,
  );

  return res.data;
};
