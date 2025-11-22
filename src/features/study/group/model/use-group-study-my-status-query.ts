import { useQuery } from '@tanstack/react-query';
import { getCookie } from '@/api/client/cookie';
import { getGroupStudyMyStatus } from '../api/get-group-study-my-status';
import { GroupStudyMyStatusRequest } from '../api/group-study-types';

export const useGroupStudyMyStatusQuery = ({
  groupStudyId,
  isLeader,
}: Pick<GroupStudyMyStatusRequest, 'groupStudyId'> & {
  isLeader: boolean;
}) => {
  return useQuery({
    queryKey: ['groupStudyMyStatus', groupStudyId],
    queryFn: () => getGroupStudyMyStatus({ groupStudyId }), // 그룹스터디 멤버만 상태 조회 가능 (리더는 조회 x)
    enabled: !!groupStudyId && !isLeader && getCookie('memberId') !== undefined,
  });
};
