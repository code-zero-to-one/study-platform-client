import { useMutation, useQuery } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { GroupStudyManagementApi } from '@/api/openapi/api/group-study-management-api';
import { MOCK_PREMIUM_STUDY_DETAIL_2 } from '@/mocks/premium-study-mock-data';
import { deleteGroupStudy } from '../api/delete-group-study';
import {
  DeleteGroupStudyRequest,
  GroupStudyFullResponse,
} from '../api/group-study-types';
import { patchGroupStudyComplete } from '../api/patch-group-study-complete';

// study-detail
export const useGroupStudyDetailQuery = (groupStudyId: number) => {
  return useQuery({
    queryKey: ['groupStudyDetail', groupStudyId],
    queryFn: async (): Promise<GroupStudyFullResponse | undefined> => {
      // 프로토타입: 멘토스터디 상세 id=2일 때 목데이터 반환
      if (groupStudyId === 2) {
        return MOCK_PREMIUM_STUDY_DETAIL_2 as GroupStudyFullResponse;
      }

      try {
        const groupStudyApi = createApiInstance(GroupStudyManagementApi);

        const { data } = await groupStudyApi.getGroupStudy(groupStudyId);

        return data.content;
      } catch (err) {
        console.error('Error in useGroupStudyDetailQuery:', err);
        throw err;
      }
    },
    enabled: !!groupStudyId, // id가 존재할 때만 실행
  });
};

//study-delete
export const useDeleteGroupStudyMutation = () => {
  return useMutation({
    mutationFn: (param: DeleteGroupStudyRequest) => deleteGroupStudy(param),
  });
};

export const useCompleteGroupStudyMutation = () => {
  return useMutation({
    mutationFn: (param: DeleteGroupStudyRequest) =>
      patchGroupStudyComplete(param),
  });
};
