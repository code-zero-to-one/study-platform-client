// hooks/queries/useMemberStudiesQuery.ts
import { useQuery } from '@tanstack/react-query';
import { getMemberStudyList } from '@/api/endpoints/group-study/get-member-study-list';
import type { MemberStudyListRequest } from '@/types/api/group-study.types';

export const useMemberStudyListQuery = ({
  memberId,
  studyType,
  studyStatus,
  inProgressPage,
  inProgressPageSize,
  completedPage,
  completedPageSize,
  asLeader,
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
      asLeader,
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
        asLeader,
      }),
    enabled: memberId > 0, // memberId가 유효할 때만 쿼리 실행
  });
};
