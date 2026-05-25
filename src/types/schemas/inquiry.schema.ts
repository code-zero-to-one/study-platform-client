import { z } from 'zod';

export const INQUIRY_CATEGORIES = [
  'CLASS',
  'PAYMENT_REFUND',
  'PROFILE_ACCOUNT',
  'LEARNING_PROGRESS',
  'OTHER',
] as const;

export const INQUIRY_CATEGORY_LABELS: Record<
  (typeof INQUIRY_CATEGORIES)[number],
  string
> = {
  CLASS: '클래스',
  PAYMENT_REFUND: '결제/환불',
  PROFILE_ACCOUNT: '프로필/계정',
  LEARNING_PROGRESS: '학습 진도',
  OTHER: '기타',
};

export const inquirySchema = z.object({
  inquiryCategory: z.enum(INQUIRY_CATEGORIES, {
    error: '문의 유형을 선택해 주세요.',
  }),
  inquiryContent: z
    .string()
    .min(1, '내용을 입력해 주세요.')
    .max(2000, '내용은 2000자 이하로 입력해 주세요.'),
  replyEmailOptIn: z.boolean(),
  replyAlerttalkOptIn: z.boolean(),
});

export type InquiryFormValues = z.infer<typeof inquirySchema>;
