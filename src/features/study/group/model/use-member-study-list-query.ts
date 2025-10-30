// hooks/queries/useMemberStudiesQuery.ts
import { useQuery } from '@tanstack/react-query';
import { getMemberStudyList } from '../api/get-member-study-list';
import { MemberStudyListRequest } from '../api/group-study-types';

export const useMemberStudyListQuery = ({
  memberId,
  studyType,
  studyStatus,
  inProgressPage,
  inProgressPageSize,
  completedPage,
  completedPageSize,
}: MemberStudyListRequest) => {
  return useQuery({
    queryKey: [
      'memberStudies',
      memberId,
      studyType,
      studyStatus,
      inProgressPage,
      inProgressPageSize,
      completedPage,
      completedPageSize,
    ],
    queryFn: () =>
      getMemberStudyList({
        memberId,
        studyType,
        studyStatus,
        inProgressPage,
        inProgressPageSize,
        completedPage,
        completedPageSize,
      }),
  });
};
