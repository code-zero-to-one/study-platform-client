import { useQuery } from '@tanstack/react-query';
import { getGroupStudyMemberList } from '../api/get-group-study-member-list';
import { GroupStudyMembersRequest } from '../api/group-study-types';

export const useGroupStudyMembersQuery = ({
  id,
  pageNumber,
  pageSize,
}: GroupStudyMembersRequest) => {
  return useQuery({
    queryKey: ['groupStudyMembers', id, pageNumber, pageSize],
    queryFn: () => getGroupStudyMemberList({ id, pageNumber, pageSize }),
    enabled: !!id,
  });
};
