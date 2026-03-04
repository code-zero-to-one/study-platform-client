import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changeMemberRole,
  changeMemberStatus,
  getMemberList,
} from '@/api/endpoints/admin/member-list';
import {
  ChangeMemberRoleRequest,
  ChangeMemberStatusRequest,
  GetMemberListRequest,
  GetMemberListResponse,
} from '@/types/api/admin.types';

// 사용자 목록 조회
export const useGetMemberListQuery = ({
  roleId,
  memberStatus,
  searchKeyword,
  page = 1,
}: GetMemberListRequest) => {
  return useQuery({
    queryKey: ['memberList', roleId, memberStatus, searchKeyword, page],
    queryFn: () =>
      getMemberList({
        roleId,
        memberStatus,
        searchKeyword,
        page,
      }),
  });
};

// 사용자 계정 상태 변경
export const useChangeMemberStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      members: GetMemberListResponse['content'];
      to: ChangeMemberStatusRequest['to'];
    }) => {
      // 병렬로 선택한 모든 사용자의 상태 변경 요청을 보냄
      // 성공: {status: "fulfilled", value: {memberId, success: true}}
      // 실패: {status: "fulfilled", value: {memberId, success: false}} (개별 요청 실패는 catch에서 처리했기 때문에 status가 rejected가 되지 않음)
      const results: PromiseSettledResult<{
        memberId: number;
        success: boolean;
      }>[] = await Promise.allSettled(
        data.members.map((member) =>
          changeMemberStatus({ memberId: member.memberId, to: data.to })
            .then(() => ({ memberId: member.memberId, success: true }))
            .catch(() => ({ memberId: member.memberId, success: false })),
        ),
      );

      const failedMemberIds = results
        .filter(
          (result) => result.status === 'fulfilled' && !result.value.success,
        )
        .map((result) =>
          result.status === 'fulfilled' ? result.value.memberId : null,
        )
        .filter(Boolean);

      if (failedMemberIds.length > 0) {
        const failedMemberNames = data.members
          .filter((member) => failedMemberIds.includes(member.memberId))
          .map((member) => member.memberName);

        alert(
          `다음 회원들의 상태 변경에 실패했습니다: ${failedMemberNames.join(', ')}`,
        );
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['memberList'] });
    },
  });
};

// 사용자 권한 변경
export const useChangeMemberRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      members: GetMemberListResponse['content'];
      roleId: ChangeMemberRoleRequest['roleId'];
    }) => {
      // 병렬로 선택한 모든 사용자의 상태 변경 요청을 보냄
      // 성공: {status: "fulfilled", value: {memberId, success: true}}
      // 실패: {status: "fulfilled", value: {memberId, success: false}} (개별 요청 실패는 catch에서 처리했기 때문에 status가 rejected가 되지 않음)
      const results: PromiseSettledResult<{
        memberId: number;
        success: boolean;
      }>[] = await Promise.allSettled(
        data.members.map((member) =>
          changeMemberRole({ memberId: member.memberId, roleId: data.roleId })
            .then(() => ({ memberId: member.memberId, success: true }))
            .catch(() => ({ memberId: member.memberId, success: false })),
        ),
      );

      const failedMemberIds = results
        .filter(
          (result) => result.status === 'fulfilled' && !result.value.success,
        )
        .map((result) =>
          result.status === 'fulfilled' ? result.value.memberId : null,
        )
        .filter(Boolean);

      if (failedMemberIds.length > 0) {
        const failedMemberNames = data.members
          .filter((member) => failedMemberIds.includes(member.memberId))
          .map((member) => member.memberName);

        alert(
          `다음 회원들의 권한 변경에 실패했습니다: ${failedMemberNames.join(', ')}`,
        );
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['memberList'] });
    },
  });
};
