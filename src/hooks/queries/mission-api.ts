import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { GetMissionsSearchTypeEnum, MissionApi } from '@/api/openapi';
import type {
  MissionCreationRequest,
  MissionUpdateRequest,
} from '@/api/openapi/models';

const missionApi = createApiInstance(MissionApi);

interface GetMissionsParams {
  groupStudyId: number;
  searchType?: GetMissionsSearchTypeEnum;
  page?: number;
  pageSize?: number;
}

export const useGetMissions = ({
  groupStudyId,
  searchType = GetMissionsSearchTypeEnum.All,
  page = 1,
  pageSize = 10,
}: GetMissionsParams) => {
  return useQuery({
    queryKey: ['missions', groupStudyId, searchType, page, pageSize],
    queryFn: async () => {
      const { data } = await missionApi.getMissions(
        groupStudyId,
        searchType,
        page,
        pageSize,
      );

      return data.content;
    },
  });
};

export const useCreateMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupStudyId,
      request,
    }: {
      groupStudyId: number;
      request: MissionCreationRequest;
    }) => {
      const { data } = await missionApi.createMission(groupStudyId, request);

      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['missions', variables.groupStudyId],
      });
    },
  });
};

export const useGetMission = (missionId: number) => {
  return useQuery({
    queryKey: ['mission', missionId],
    queryFn: async () => {
      const { data } = await missionApi.getMission(missionId);

      return data.content;
    },
  });
};

export const useUpdateMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      missionId,
      request,
    }: {
      missionId: number;
      request: MissionUpdateRequest;
    }) => {
      const { data } = await missionApi.updateMission(missionId, request);

      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['missions'],
      });
    },
  });
};
