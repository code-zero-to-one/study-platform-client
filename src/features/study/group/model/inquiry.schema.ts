import { z } from 'zod';

export enum InquiryCategory {
  CURRICULUM = 'CURRICULUM',
  DIFFICULTY = 'DIFFICULTY',
  HW_AMOUNT = 'HW_AMOUNT',
  ETC = 'ETC',
}

export const INQUIRY_TITLE_MAX_LENGTH=50;
export const INQUIRY_CONTENT_MAX_LENGTH = 500;


export const inquirySchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').min(1).max(
		INQUIRY_TITLE_MAX_LENGTH,`제목은 ${INQUIRY_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`
	),
  content: z
    .string()
    .min(1, '내용을 입력해주세요.')
    .max(
      INQUIRY_CONTENT_MAX_LENGTH,
      `내용은 ${INQUIRY_CONTENT_MAX_LENGTH}자 이하로 입력해주세요.`,
    ),
  category: z.nativeEnum(InquiryCategory, {
    message: '카테고리를 선택해주세요.',
  }),
});

export type InquiryFormValues = z.infer<typeof inquirySchema>;
