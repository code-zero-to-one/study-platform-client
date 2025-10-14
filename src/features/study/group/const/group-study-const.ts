export const STUDY_TYPES = [
  'PROJECT',
  'MENTORING',
  'SEMINAR',
  'CHALLENGE',
  'BOOK_STUDY',
  'LECTURE_STUDY',
] as const;

export const TARGET_ROLE_OPTIONS = [
  'BACKEND',
  'FRONTEND',
  'PLANNER',
  'DESIGNER',
] as const;

export const EXPERIENCE_LEVEL_OPTIONS = [
  'BEGINNER',
  'JOB_SEEKER',
  'JUNIOR',
  'MIDDLE',
  'SENIOR',
] as const;

export const STUDY_METHODS = ['ONLINE', 'OFFLINE', 'HYBRID'] as const;

export const REGULAR_MEETINGS = [
  'NONE',
  'WEEKLY',
  'BIWEEKLY',
  'TRIPLE_WEEKLY_OR_MORE',
] as const;

export const THUMBNAIL_EXTENSION = [
  'DEFAULT',
  'JPG',
  'PNG',
  'GIF',
  'WEBP',
  'SVG',
  'JPEG',
] as const;

// UI 매칭을 위한 라벨 const
export const STUDY_TYPE_LABELS = {
  PROJECT: '프로젝트',
  MENTORING: '멘토링',
  SEMINAR: '세미나',
  CHALLENGE: '챌린지',
  BOOK_STUDY: '책 스터디',
  LECTURE_STUDY: '강의 스터디',
} as const;

export const ROLE_OPTIONS_UI = [
  { label: '백엔드', value: 'BACKEND' },
  { label: '프론트엔드', value: 'FRONTEND' },
  { label: '기획', value: 'PLANNER' },
  { label: '디자이너', value: 'DESIGNER' },
];

export const EXPERIENCE_LEVEL_OPTIONS_UI = [
  { label: '입문자', value: 'BEGINNER' },
  { label: '취준생', value: 'JOB_SEEKER' },
  { label: '주니어', value: 'JUNIOR' },
  { label: '미들', value: 'MIDDLE' },
  { label: '시니어', value: 'SENIOR' },
];

export const STUDY_METHOD_LABELS = {
  ONLINE: '온라인',
  OFFLINE: '오프라인',
  HYBRID: '온오프라인',
} as const;

export const REGULAR_MEETING_LABELS = {
  NONE: '없음',
  WEEKLY: '주 1회',
  BIWEEKLY: '주 2회',
  TRIPLE_WEEKLY_OR_MORE: '주 3회 이상',
} as const;
