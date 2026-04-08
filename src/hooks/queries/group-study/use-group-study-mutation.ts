import { useMutation } from '@tanstack/react-query';
import { createGroupStudy } from '@/api/endpoints/group-study/create-group-study';
import { updateGroupStudy } from '@/api/endpoints/group-study/update-group-study';
import {
  GroupStudyCreateRequest,
  GroupStudyUpdateRequest,
} from '@/types/api/group-study.types';

// 그룹 스터디 개설 mutation
export const useCreateGroupStudyMutation = () => {
  return useMutation({
    mutationFn: (payload: GroupStudyCreateRequest) => createGroupStudy(payload),
  });
};

// 그룹 스터디 수정 mutation
export const useUpdateGroupStudyMutation = (groupStudyId: number) => {
  return useMutation({
    mutationFn: (payload: GroupStudyUpdateRequest) =>
      updateGroupStudy(groupStudyId, payload),
  });
};
