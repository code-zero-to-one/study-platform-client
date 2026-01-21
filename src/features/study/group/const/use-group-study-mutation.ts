import { useMutation } from '@tanstack/react-query';
import { createGroupStudy } from '../api/create-group-study';
import {
  GroupStudyCreateRequest,
  GroupStudyUpdateRequest,
} from '../api/group-study-types';
import { updateGroupStudy } from '../api/update-group-study';

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
