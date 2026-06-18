import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import {
  GetGroupStudiesStatusesEnum,
  GroupStudyManagementApi,
} from '@/api/openapi/api/group-study-management-api';
import type {
  GetGroupStudiesClassificationEnum,
  GetGroupStudiesMethodEnum,
  GetGroupStudiesSortEnum,
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
  sort?: GetGroupStudiesSortEnum;
}

export const useGetStudies = ({
  classification,
  page = 1,
  pageSize = 15,
  type,
  targetRoles,
  method,
  recruiting,
  sort,
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
      sort,
    ],
    queryFn: async () => {
      const statuses = recruiting
        ? [GetGroupStudiesStatusesEnum.Recruiting]
        : undefined;
      const { data } = await groupStudyManagementApi.getGroupStudies(
        classification,
        page,
        pageSize,
        undefined, // myParticipation
        type,
        targetRoles,
        method,
        statuses,
        sort,
      );

      return data.content;
    },
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};
