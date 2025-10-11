import { useMutation } from '@tanstack/react-query';
import { createGroupStudy } from '../api/creat-group-study';
import { OpenGroupStudyRequest } from '../api/group-study-types';

// 그룹 스터디 개설 mutation
export const useCreateGroupStudyMutation = () => {
  return useMutation({
    mutationFn: (payload: OpenGroupStudyRequest) => createGroupStudy(payload),
  });
};
