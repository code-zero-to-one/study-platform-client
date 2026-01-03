import { useQuery } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import {
  GroupStudyManagementApi,
  GetGroupStudiesClassificationEnum,
  GetGroupStudiesTypeEnum,
  GetGroupStudiesTargetRolesEnum,
  GetGroupStudiesMethodEnum,
} from '@/api/openapi/api/group-study-management-api';

const groupStudyManagementApi = createApiInstance(GroupStudyManagementApi);

interface GetStudiesParams {
  classification: GetGroupStudiesClassificationEnum;
  page?: number;
  pageSize?: number;
  type?: GetGroupStudiesTypeEnum[];
  targetRoles?: GetGroupStudiesTargetRolesEnum[];
  method?: GetGroupStudiesMethodEnum[];
  inProgress?: boolean;
}

export const useGetStudies = ({
  classification,
  page = 1,
  pageSize = 15,
  type,
  targetRoles,
  method,
  inProgress,
}: GetStudiesParams) => {
  return useQuery({
    queryKey: [
      'studies',
      classification,
      page,
      pageSize,
      type,
      targetRoles,
      method,
      inProgress,
    ],
    queryFn: async () => {
      const { data } = await groupStudyManagementApi.getGroupStudies(
        classification,
        page,
        pageSize,
        type,
        targetRoles,
        method,
        inProgress,
      );

      return data.content;
    },
  });
};
