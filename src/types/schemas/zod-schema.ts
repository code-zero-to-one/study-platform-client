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
    message: '주제를 선택해주세요.',
  }),
  tags: z
    .array(z.string())
    .min(1, '태그를 1개 이상 입력해주세요.')
    .max(5, '태그는 5개까지만 입력 가능합니다.')
    .optional(),
});

export type DiscussionFormData = z.infer<typeof DiscussionFormSchema>;

// Voting 생성 폼 스키마
export const VotingCreateFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, '제목은 5자 이상 입력해주세요.')
    .max(200, '제목은 200자 이하로 입력해주세요.'),
  description: z
    .string()
    .trim()
    .max(500, '설명은 500자 이하로 입력해주세요.')
    .optional(),
  options: z
    .array(
      z.object({
        label: z
          .string()
          .trim()
          .min(1, '선택지를 입력해주세요.')
          .max(100, '선택지는 100자 이하로 입력해주세요.'),
      }),
    )
    .min(2, '선택지는 최소 2개 이상 입력해주세요.')
    .max(5, '선택지는 최대 5개까지 입력 가능합니다.'),
  tags: z
    .array(z.string().trim().min(1).max(40, '태그는 40자 이하로 입력해주세요.'))
    .max(3, '태그는 최대 3개까지 입력 가능합니다.')
    .optional(),
  endsAt: z.string().optional(), // ISO date string
});

export type VotingCreateFormData = z.infer<typeof VotingCreateFormSchema>;

// Voting 수정 폼 스키마 (옵션/마감일 수정 불가)
export const VotingEditFormSchema = VotingCreateFormSchema.omit({
  options: true,
  endsAt: true,
});

export type VotingEditFormData = z.infer<typeof VotingEditFormSchema>;
