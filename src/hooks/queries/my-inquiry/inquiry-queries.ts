import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstanceV6 } from '@/api/client/axios';

export type InquiryCategory =
  | 'CLASS'
  | 'PAYMENT_REFUND'
  | 'PROFILE_ACCOUNT'
  | 'LEARNING_PROGRESS'
  | 'OTHER';

export type InquiryStatus = 'ACCEPTED' | 'ANSWER_COMPLETED';

export interface OneToOneInquiryListItem {
  oneToOneInquiryId: number;
  inquiryStatus: InquiryStatus;
  inquiryCategory: InquiryCategory;
  inquiryPreviewText: string;
  createdAt: string;
  answeredAt: string | null;
}

interface OneToOneInquiryListResponse {
  oneToOneInquiries: OneToOneInquiryListItem[];
}

export interface InquiryReply {
  oneToOneInquiryReplyId: number;
  replyContent: string;
  createdAt: string;
}

export interface OneToOneInquiryDetailResponse {
  inquiryContent: string;
  attachmentUrls: string[];
  replies: InquiryReply[];
  alertPreferences: {
    replyAlerttalkOptIn: boolean;
    replyEmailOptIn: boolean;
  };
  createdAt: string;
  answeredAt: string | null;
}

export interface CreateOneToOneInquiryRequest {
  inquiryCategory: InquiryCategory;
  inquiryContent: string;
  inquiryAttachmentKeys: string[];
  replyAlerttalkOptIn: boolean;
  replyEmailOptIn: boolean;
}

interface DraftOneToOneInquiryRequest {
  inquiryCategory?: InquiryCategory;
  inquiryContent?: string;
}

export const useGetMyOneToOneInquiries = () => {
  return useQuery({
    queryKey: ['myOneToOneInquiries'],
    queryFn: async () => {
      const { data } = await axiosInstanceV6.get<{
        content: OneToOneInquiryListResponse;
      }>('mypage/one-to-one-inquiries');
      return data.content.oneToOneInquiries;
    },
  });
};

export const useGetMyOneToOneInquiryDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['myOneToOneInquiry', id],
    queryFn: async () => {
      const { data } = await axiosInstanceV6.get<{
        content: OneToOneInquiryDetailResponse;
      }>(`mypage/one-to-one-inquiries/${id}`);
      return data.content;
    },
    enabled: id !== null && id > 0,
  });
};

export const useCreateMyOneToOneInquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateOneToOneInquiryRequest) => {
      const { data } = await axiosInstanceV6.post<{
        content: { oneToOneInquiryId: number };
      }>('mypage/one-to-one-inquiries', request);
      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['myOneToOneInquiries'],
      });
    },
  });
};

export const useSaveDraftOneToOneInquiry = () => {
  return useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: number;
      request: DraftOneToOneInquiryRequest;
    }) => {
      const { data } = await axiosInstanceV6.patch<{
        content: { oneToOneInquiryId: number };
      }>(`mypage/one-to-one-inquiries/${id}/draft`, request);
      return data.content;
    },
  });
};
