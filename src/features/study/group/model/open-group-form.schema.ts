import { z } from 'zod';
import { OpenGroupRequest } from '../api/group-types';
import {
  EXPERIENCE_LEVEL_OPTIONS,
  METHOD_OPTIONS,
  REGULAR_MEETING_OPTIONS,
  TYPE_OPTIONS,
} from '../const/group-const';

// YYYY-MM-DD 형식 검증
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ExperienceLevelEnum = z.enum(EXPERIENCE_LEVEL_OPTIONS);

export const OpenGroupFormSchema = z.object({
  type: z.enum(TYPE_OPTIONS),
  targetRole: z.array(z.string()).min(1, '역할을 1개 이상 선택해 주세요.'),
  maxMembers: z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, '최소 1 이상의 정수를 입력해 주세요.'),
  experienceLevel: z
    .union([ExperienceLevelEnum, z.literal('')])
    .transform((v) => (v === '' ? undefined : v))
    .pipe(ExperienceLevelEnum),
  method: z.enum(METHOD_OPTIONS),
  regularMeeting: z.enum(REGULAR_MEETING_OPTIONS),
  startDate: z
    .string()
    .trim()
    .regex(ISO_DATE_REGEX, 'YYYY-MM-DD 형식의 시작일을 입력해 주세요.'),
  durationWeeks: z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, '기간은 1 이상 정수로 입력해 주세요.'),
  price: z
    .string()
    .trim()
    .regex(/^\d+$/, '가격은 0 이상 정수로 입력해 주세요.'),
});

export type OpenGroupFormValues = z.input<typeof OpenGroupFormSchema>;
export type OpenGroupParsedValues = z.output<typeof OpenGroupFormSchema>;

export function buildOpenGroupDefaultValues(): OpenGroupFormValues {
  return {
    type: '프로젝트',
    targetRole: [],
    maxMembers: '',
    experienceLevel: '',
    method: '온라인',
    regularMeeting: '주1회',
    startDate: '',
    durationWeeks: '',
    price: '',
  };
}

export function toOpenGroupRequest(v: OpenGroupParsedValues): OpenGroupRequest {
  return {
    type: v.type,
    targetRole: v.targetRole.join(','),
    maxMembers: Number(v.maxMembers),
    experienceLevel: v.experienceLevel,
    method: v.method,
    regularMeeting: v.regularMeeting,
    startDate: v.startDate.trim(),
    durationWeeks: Number(v.durationWeeks),
    price: Number(v.price),
  };
}
