import { axiosInstance } from '@/api/client/axios';
import { GroupStudyNoticeRequest } from '@/types/api/group-study.types';

// 그룹 스터디 공지 등록
export const postGroupStudyNotice = async (
  groupStudyId: number,
  body: GroupStudyNoticeRequest,
) => {
  const res = await axiosInstance.put(
    `/group-studies/${groupStudyId}/notice`,
    body,
  );

  return res.data.content;
};
