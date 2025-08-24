import { FieldNamesMarkedBoolean } from 'react-hook-form';
import { z } from 'zod';
import type { MemberProfile } from '@/entities/user/api/types';
import { UrlSchema } from '@/shared/util/zod-schema';
import { UpdateUserProfileRequest } from '../api/types';

const nameRegex = /^[가-힣a-zA-Z]{2,10}$/;
const telRegex = /^\d{2,3}-\d{3,4}-\d{4}$/;
const birthRegex = /^\d{4}\.(0[1-9]|1[0-2])\.(0[1-9]|[12]\d|3[01])$/;

export const ProfileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '이름은 필수입니다.')
    .regex(nameRegex, '이름은 2~10자의 한글 또는 영문만 허용됩니다.'),

  tel: z
    .string()
    .trim()
    .min(1, '연락처는 필수입니다.')
    .regex(telRegex, '연락처는 숫자와 하이픈(-) 형식으로 입력해주세요.'),

  birthDate: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === '' || v === undefined ? undefined : v))
    .refine((v) => v === undefined || birthRegex.test(v), {
      message: '잘못된 형식입니다.',
    })
    .refine(
      (v) => {
        if (!v) return true;
        const d = new Date(v.replace(/\./g, '-'));
        const year = d.getFullYear();
        const now = new Date().getFullYear();

        return !Number.isNaN(d.getTime()) && year >= 1900 && year <= now;
      },
      { message: '잘못된 형식입니다.' },
    )
    .transform((v) => (v ? v.replace(/\./g, '-') : undefined)),

  githubLink: UrlSchema,
  blogOrSnsLink: UrlSchema,

  simpleIntroduction: z
    .string()
    .trim()
    .max(200, '최대 200자까지 입력할 수 있어요.')
    .optional()
    .transform((v) => (v === '' || v === undefined ? undefined : v)),

  mbti: z
    .string()
    .optional()
    .transform((v) => (v === '' || v === undefined ? undefined : v)),

  interests: z
    .array(z.string())
    .optional()
    .transform((arr) => (!arr || arr.length === 0 ? undefined : arr)),
});

export type ProfileFormInput = z.input<typeof ProfileFormSchema>;
export type ProfileFormValues = z.output<typeof ProfileFormSchema>;

export function buildProfileDefaultValues(
  member: MemberProfile,
): ProfileFormInput {
  return {
    name: member.memberName ?? '',
    tel: member.tel ?? '',
    // 화면에서는 점(.)으로 보여주기, 스키마 제출 시 하이픈(-) 변환
    birthDate: member.birthDate ? member.birthDate.replace(/-/g, '.') : '',
    githubLink: member.githubLink?.url ?? '',
    blogOrSnsLink: member.blogOrSnsLink?.url ?? '',
    mbti: (member.mbti as string) ?? '',
    simpleIntroduction: member.simpleIntroduction ?? '',
    interests: member.interests?.map((i) => i.name) ?? [],
  };
}

// 서버 전송 payload
export function toUpdateProfilePayload(
  v: ProfileFormValues,
  extra?: Partial<Pick<UpdateUserProfileRequest, 'profileImageExtension'>>,
): UpdateUserProfileRequest {
  const payload: UpdateUserProfileRequest = {
    name: v.name,
    tel: v.tel,
    birthDate: v.birthDate,
    githubLink: v.githubLink,
    blogOrSnsLink: v.blogOrSnsLink,
    simpleIntroduction: v.simpleIntroduction,
    mbti: v.mbti,
    interests: v.interests,
  };

  if (extra?.profileImageExtension) {
    payload.profileImageExtension = extra.profileImageExtension;
  }

  return payload;
}
