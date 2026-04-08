import { useMutation, useQuery } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { deleteGroupStudy } from '@/api/endpoints/group-study/delete-group-study';
import { patchGroupStudyComplete } from '@/api/endpoints/group-study/patch-group-study-complete';
import { GroupStudyManagementApi } from '@/api/openapi/api/group-study-management-api';
import { DeleteGroupStudyRequest } from '@/types/api/group-study.types';

// study-detail
export const useGroupStudyDetailQuery = (groupStudyId: number) => {
  return useQuery({
    queryKey: ['groupStudyDetail', groupStudyId],
    queryFn: async () => {
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
