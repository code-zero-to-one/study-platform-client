import { useMutation } from '@tanstack/react-query';
import { GroupStudyNoticeRequest } from '../api/group-study-types';
import { postGroupStudyNotice } from '../api/post-group-study-notice';

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
