import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import {
  GetGroupStudiesStatusesEnum,
  GroupStudyManagementApi,
} from '@/api/openapi/api/group-study-management-api';
import type {
  GetGroupStudiesClassificationEnum,
  GetGroupStudiesMethodEnum,
  GetGroupStudiesTargetRolesEnum,
  GetGroupStudiesTypeEnum,
} from '@/api/openapi/api/group-study-management-api';

const groupStudyManagementApi = createApiInstance(GroupStudyManagementApi);

interface GetStudiesParams {
  classification: GetGroupStudiesClassificationEnum;
  page?: number;
  pageSize?: number;
  type?: GetGroupStudiesTypeEnum[];
  targetRoles?: GetGroupStudiesTargetRolesEnum[];
  method?: GetGroupStudiesMethodEnum[];
  recruiting?: boolean;
}

export const useGetStudies = ({
  classification,
  page = 1,
  pageSize = 15,
  type,
  targetRoles,
  method,
  recruiting,
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
      recruiting,
    ],
    queryFn: async () => {
      const statuses = recruiting
        ? [GetGroupStudiesStatusesEnum.Recruiting]
        : undefined;
      const { data } = await groupStudyManagementApi.getGroupStudies(
        classification,
        page,
        pageSize,
        type,
        targetRoles,
        method,
        statuses,
      );

      return data.content;
    },
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};
