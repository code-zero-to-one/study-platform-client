import { axiosInstance } from '@/api/client/axios';
import { UpdateGreetingRequest } from './group-study-types';

export const updateMemberGreeting = async ({
  groupStudyId,
  content,
}: UpdateGreetingRequest) => {
  const res = await axiosInstance.put(
    `/group-studies/${groupStudyId}/members/greeting`,
    {
      content,
    },
  );

  return res.data;
};
