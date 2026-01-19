import { z } from 'zod';

// 올바른 URL인지 확인
export const isValidUrl = (v: string) => {
  try {
    return Boolean(new URL(v));
  } catch {
    return false;
  }
};

export const UrlSchema = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || isValidUrl(v), {
    message: '올바른 URL 형식이 아닙니다.',
  });

// Discussion 댓글 폼 스키마
export const CommentFormSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, '댓글 내용을 입력해주세요.')
    .max(1000, '댓글은 1000자 이하로 입력해주세요.'),
});

export type CommentFormData = z.infer<typeof CommentFormSchema>;

// Discussion 작성 폼 스키마
export const DiscussionFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, '제목은 5자 이상 입력해주세요.')
    .max(100, '제목은 100자 이하로 입력해주세요.'),
  content: z
    .string()
    .trim()
    .min(10, '내용은 10자 이상 입력해주세요.')
    .max(5000, '내용은 5000자 이하로 입력해주세요.'),
  topic: z.enum(['development', 'study', 'free', 'question'], {
    errorMap: () => ({ message: '주제를 선택해주세요.' }),
  }),
  tags: z.array(z.string()).min(1, '태그를 1개 이상 입력해주세요.').max(5, '태그는 5개까지만 입력 가능합니다.').optional(),
});

export type DiscussionFormData = z.infer<typeof DiscussionFormSchema>;