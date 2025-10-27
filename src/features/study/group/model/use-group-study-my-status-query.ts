import { useQuery } from '@tanstack/react-query';
import { getGroupStudyMyStatus } from '../api/get-group-study-my-status';
import { GroupStudyMyStatusRequest } from '../api/group-study-types';

export const useGroupStudyMyStatusQuery = (
  groupStudyId: GroupStudyMyStatusRequest['groupStudyId'],
) => {
  return useQuery({
    queryKey: ['groupStudyMyStatus', groupStudyId],
    queryFn: () => getGroupStudyMyStatus({ groupStudyId }),
    enabled: !!groupStudyId,
  });
};
