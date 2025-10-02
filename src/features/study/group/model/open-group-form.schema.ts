import { z } from 'zod';
import { OpenGroupRequest } from '../api/group-types';
import {
  METHOD_OPTIONS,
  MEETING_OPTIONS,
  STUDY_TYPES,
} from '../const/group-const';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const StudyMap: Record<
  string,
  | 'PROJECT'
  | 'MENTORING'
  | 'SEMINAR'
  | 'CHALLENGE'
  | 'BOOK_STUDY'
  | 'LECTURE_STUDY'
> = {
  프로젝트: 'PROJECT',
  멘토링: 'MENTORING',
  세미나: 'SEMINAR',
  챌린지: 'CHALLENGE',
  '책 스터디': 'BOOK_STUDY',
  '강의 스터디': 'LECTURE_STUDY',
};

const MethodMap: Record<string, 'ONLINE' | 'OFFLINE' | 'HYBRID'> = {
  온라인: 'ONLINE',
  오프라인: 'OFFLINE',
  온오프라인: 'HYBRID',
};

const RegularMeetingMap: Record<
  string,
  'WEEKLY' | 'BIWEEKLY' | 'TRIPLE_WEEKLY_OR_MORE' | 'NONE'
> = {
  '주 1회': 'WEEKLY',
  '주 2회': 'BIWEEKLY',
  '주 3회 이상': 'TRIPLE_WEEKLY_OR_MORE',
  없음: 'NONE',
};

export const OpenGroupFormSchema = z.object({
  type: z.enum(STUDY_TYPES),
  targetRole: z.array(z.string()).min(1, '역할을 1개 이상 선택해 주세요.'),
  maxMembersCount: z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, '최소 1 이상의 정수를 입력해 주세요.'),
  experienceLevels: z
    .array(z.string())
    .min(1, '경력을 1개 이상 선택해 주세요.'),
  method: z.enum(METHOD_OPTIONS),
  location: z.string().trim(),
  regularMeeting: z.enum(MEETING_OPTIONS),
  startDate: z
    .string()
    .trim()
    .regex(ISO_DATE_REGEX, 'YYYY-MM-DD 형식의 시작일을 입력해 주세요.'),
  endDate: z
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
  title: z.string().trim(),
  description: z.string().trim(),
  summary: z.string().trim(),
  interviewPost: z.string().optional(),
  thumbnailExtension: z.enum([
    'DEFAULT',
    'JPG',
    'PNG',
    'GIF',
    'WEBP',
    'SVG',
    'JPEG',
  ]),
});

export type OpenGroupFormValues = z.input<typeof OpenGroupFormSchema>;
export type OpenGroupParsedValues = z.output<typeof OpenGroupFormSchema>;

export function buildOpenGroupDefaultValues(): OpenGroupFormValues {
  return {
    type: '프로젝트',
    targetRole: [],
    maxMembersCount: '',
    experienceLevels: [],
    method: '온라인',
    location: '',
    regularMeeting: '주 1회',
    startDate: '',
    endDate: '',
    durationWeeks: '',
    price: '',
    title: '',
    description: '',
    summary: '',
    interviewPost: '',
    thumbnailExtension: 'DEFAULT',
  };
}

export function toOpenGroupRequest(v: OpenGroupParsedValues): OpenGroupRequest {
  return {
    basicInfo: {
      groupStudyId: 0,
      type: StudyMap[v.type],
      targetRoles: v.targetRole,
      maxMembersCount: Number(v.maxMembersCount),
      experienceLevels: v.experienceLevels ?? [],
      method: MethodMap[v.method],
      regularMeeting: RegularMeetingMap[v.regularMeeting],
      location: v.location.trim(),
      startDate: v.startDate.trim(),
      endDate: v.endDate.trim(),
      price: Number(v.price),
      status: 'RECRUITING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    detailInfo: {
      thumbnail: {
        imageId: 0,
        resizedImages: [],
      },
      title: '',
      description: '',
      summary: '',
    },
    interviewPost: {
      interviewPost: v.interviewPost ?? '',
    },
    thumbnailExtension: v.thumbnailExtension,
  };
}
