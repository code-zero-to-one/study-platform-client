// hooks/queries/useMemberStudiesQuery.ts
import { useQuery } from '@tanstack/react-query';
import {
  getMemberStudyList,
  getMemberStudyListV2,
} from '@/api/endpoints/group-study/get-member-study-list';
import type {
  MemberStudyListRequest,
  MemberStudyListV2Request,
} from '@/types/api/group-study.types';

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

export const useMemberStudyListV2Query = ({
  memberId,
  studyType,
  studyStatus,
  page,
  pageSize,
}: MemberStudyListV2Request) => {
  return useQuery({
    queryKey: [
      'memberStudiesV2',
      memberId,
      studyType,
      studyStatus,
      page,
      pageSize,
    ],
    queryFn: () =>
      getMemberStudyListV2({
        memberId,
        studyType,
        studyStatus,
        page,
        pageSize,
      }),
    enabled: memberId > 0,
  });
};
