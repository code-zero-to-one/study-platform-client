import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { GroupStudyMemberApi } from '@/api/openapi';
import type {
  UpdateGroupStudyMemberGreetingRequest,
  UpdateGroupStudyMemberDiscretionRequest,
} from '@/api/openapi/models';
// TEMPORARY: Keep until OpenAPI types fixed
import type { GroupStudyMembersResponse } from '@/features/study/group/api/group-study-types';
import { useAuth } from '../common/use-auth';

const groupStudyMemberApi = createApiInstance(GroupStudyMemberApi);

// Query Hooks
export const useGetGroupStudyMembers = ({
  id,
  isPaging,
  pageNumber,
  pageSize,
}: {
  id: number;
  isPaging?: boolean;
  pageNumber?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: ['groupStudyMemberList', id, pageNumber, pageSize, isPaging],
    queryFn: async () => {
      const { data } = await groupStudyMemberApi.getGroupStudyMembers(
        id,
        isPaging,
        pageSize,
        pageNumber,
      );

      return data.content as unknown as GroupStudyMembersResponse;
    },
    enabled: !!id,
  });
};

export const useGetMemberRole = (id: number) => {
  return useQuery({
    queryKey: ['groupStudyMemberRole', id],
    queryFn: async () => {
      const { data } = await groupStudyMemberApi.getMemberRole(id);

      return data.content;
    },
    enabled: !!id,
  });
};

export const useGetGroupStudyMyStatus = ({
  groupStudyId,
  isLeader,
}: {
  groupStudyId: number;
  isLeader: boolean;
}) => {
  const { data } = useAuth();

  return useQuery({
    queryKey: ['groupStudyMemberStatus', groupStudyId],
    queryFn: async () => {
      const { data } = await groupStudyMemberApi.getMemberStatus(groupStudyId);

      return data.content;
    },
    enabled: !!groupStudyId && !isLeader && data?.memberId !== undefined,
  });
};

// Mutation Hooks
export const useKickMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      targetMemberId,
      reason,
    }: {
      id: number;
      targetMemberId: number;
      reason: string;
    }) => {
      const { data } = await groupStudyMemberApi.kickMember(
        id,
        targetMemberId,
        reason,
      );

      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['groupStudyMemberList', variables.id],
      });
    },
  });
};

export const useUpdateGreeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: number;
      request: UpdateGroupStudyMemberGreetingRequest;
    }) => {
      const { data } = await groupStudyMemberApi.updateGreeting(id, request);

      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['groupStudyMemberList', variables.id],
      });
    },
  });
};

export const useUpdateMemberDiscretion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: number;
      request: UpdateGroupStudyMemberDiscretionRequest;
    }) => {
      const { data } = await groupStudyMemberApi.updateMemberDiscretion(
        id,
        request,
      );

      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['groupStudyMemberList', variables.id],
      });
    },
  });
};
