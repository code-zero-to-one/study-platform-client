import { axiosInstance } from '@/api/client/axios';
import { CompleteGroupStudyRequest } from '@/types/api/group-study.types';

export const patchGroupStudyComplete = async (
  params: CompleteGroupStudyRequest,
) => {
  const { groupStudyId } = params;

  const { data } = await axiosInstance.patch(
    `group-studies/${groupStudyId}/complete`,
  );

  return data.content;
};
