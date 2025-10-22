import { axiosInstance } from '@/shared/tanstack-query/axios';
import { UpdateGreetingRequest } from './group-study-types';

export const updateMemberGreeting = async ({
  groupStudyId,
  content,
}: UpdateGreetingRequest) => {
  const res = await axiosInstance.put(
    `/api/v1/group-studies/${groupStudyId}/members/greeting`,
    {
      content,
    },
  );

  return res.data;
};
