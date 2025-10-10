import { useMutation } from '@tanstack/react-query';
import { applyGroupStudy } from '../api/apply-group-study';

// 그룹 스터디 신청 훅
export const useApplyGroupStudyMutation = () => {
  return useMutation({
    mutationFn: applyGroupStudy,
  });
};
