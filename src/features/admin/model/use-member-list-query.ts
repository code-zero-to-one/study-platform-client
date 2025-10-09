import { useQuery } from '@tanstack/react-query';
import { getMemberList } from '../api/member-list';
import { GetMemberListRequest } from '../api/types';

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
