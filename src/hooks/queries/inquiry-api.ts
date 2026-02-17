import { useMutation } from '@tanstack/react-query';
import {
  createInquiry,
  CreateInquiryRequest,
} from '@/features/study/group/api/create-inquiry';

export const useCreateInquiry = () => {
  return useMutation({
    mutationFn: async ({
      groupStudyId,
      request,
    }: {
      groupStudyId: number;
      request: CreateInquiryRequest;
    }) => {
      const data = await createInquiry(groupStudyId, request);

      return data.content;
    },
  });
};
