import { z } from 'zod';

// 그룹 스터디 공지 스키마
export const GroupStudyNoticeFormSchema = z.object({
  noticeTitle: z.string().trim().min(1, '면접 주제를 입력해 주세요.'),
  noticeContent: z
    .string()
    .trim()
    .min(1, '스터디 공지를 입력해 주세요.')
    .max(500, '최대 500자까지 입력 가능합니다.'),
});

export type GroupStudyNoticeFormValues = z.infer<
  typeof GroupStudyNoticeFormSchema
>;

export function buildGroupStudyNoticeDefaults(): GroupStudyNoticeFormValues {
  return {
    noticeTitle: '',
    noticeContent: '',
  };
}
