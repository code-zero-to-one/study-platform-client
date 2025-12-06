import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { getGroupStudyMyStatus } from '../api/get-group-study-my-status';
import { GroupStudyMyStatusRequest } from '../api/group-study-types';

export const useGroupStudyMyStatusQuery = ({
  groupStudyId,
  isLeader,
}: Pick<GroupStudyMyStatusRequest, 'groupStudyId'> & {
  isLeader: boolean;
}) => {
  const { data } = useAuth();

  return useQuery({
    queryKey: ['groupStudyMyStatus', groupStudyId],
    queryFn: () => getGroupStudyMyStatus({ groupStudyId }), // 그룹스터디 멤버만 상태 조회 가능 (리더는 조회 x)
    enabled: !!groupStudyId && !isLeader && data?.memberId !== undefined,
  });
};
