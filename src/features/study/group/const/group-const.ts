export const TYPE_OPTIONS = [
  '프로젝트',
  '멘토링',
  '세미나',
  '챌린지',
  '책스터디',
  '강의스터디',
] as const;

export const EXPERIENCE_LEVEL_OPTIONS = [
  '입문자',
  '취준생',
  '주니어',
  '미들',
  '시니어',
] as const;

export const METHOD_OPTIONS = ['온라인', '오프라인', '온오프라인'] as const;

export const REGULAR_MEETING_OPTIONS = [
  '없음',
  '주1회',
  '주2회',
  '주3회이상',
] as const;

export type TypeOption = (typeof TYPE_OPTIONS)[number];
export type ExperienceLevelOption = (typeof EXPERIENCE_LEVEL_OPTIONS)[number];
export type MethodOption = (typeof METHOD_OPTIONS)[number];
export type RegularMeetingOption = (typeof REGULAR_MEETING_OPTIONS)[number];
