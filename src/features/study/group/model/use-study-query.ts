import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteGroupStudy } from '../api/delete-group-study';
import { getGroupStudyDetail } from '../api/get-group-study-detail';
import { DeleteGroupStudyRequest } from '../api/group-study-types';
import { patchGroupStudyComplete } from '../api/patch-group-study-complete';

// study-detail
export const useGroupStudyDetailQuery = (groupStudyId: number) => {
  return useQuery({
    queryKey: ['groupStudyDetail', groupStudyId],
    queryFn: () => getGroupStudyDetail({ groupStudyId }),
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
