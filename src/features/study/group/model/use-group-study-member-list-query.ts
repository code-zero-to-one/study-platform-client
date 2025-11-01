import { useQuery } from '@tanstack/react-query';
import { getGroupStudyMemberList } from '../api/get-group-study-member-list';
import { GroupStudyMembersRequest } from '../api/group-study-types';

export const useGroupStudyMemberListQuery = ({
  id,
  pageNumber,
  pageSize,
}: GroupStudyMembersRequest) => {
  return useQuery({
    queryKey: ['groupStudyMemberList', id, pageNumber, pageSize],
    queryFn: () => getGroupStudyMemberList({ id, pageNumber, pageSize }),
    enabled: !!id,
  });
};
