import { useMutation } from '@tanstack/react-query';
import { postGroupStudyNotice } from '@/api/endpoints/group-study/post-group-study-notice';
import { GroupStudyNoticeRequest } from '@/types/api/group-study.types';

export const useGroupStudyNoticeMutation = () => {
  return useMutation({
    mutationFn: ({
      groupStudyId,
      payload,
    }: {
      groupStudyId: number;
      payload: GroupStudyNoticeRequest;
    }) => postGroupStudyNotice(groupStudyId, payload),
  });
};
