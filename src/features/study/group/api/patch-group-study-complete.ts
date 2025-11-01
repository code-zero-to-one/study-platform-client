import { axiosInstance } from '@/shared/tanstack-query/axios';
import { CompleteGroupStudyRequest } from './group-study-types';

export const patchGroupStudyComplete = async (
  params: CompleteGroupStudyRequest,
) => {
  const { groupStudyId } = params;

  const { data } = await axiosInstance.patch(
    `group-studies/${groupStudyId}/complete`,
  );

  return data.content;
};
