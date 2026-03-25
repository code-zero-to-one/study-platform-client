export const WEEKDAY_KEYS = [
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
  'SUN',
] as const;
export const MENTOR_SCHEDULE_TIMEZONE = 'Asia/Seoul' as const;

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

export const WEEKDAY_LABEL_MAP: Record<WeekdayKey, string> = {
  MON: '월',
  TUE: '화',
  WED: '수',
  THU: '목',
  FRI: '금',
  SAT: '토',
  SUN: '일',
};

export const CONSULTING_DURATION_OPTIONS = [30, 60, 90] as const;
export type ConsultingDurationMinutes =
  (typeof CONSULTING_DURATION_OPTIONS)[number];
export const MENTOR_CAREER_ENTRY_MAX_COUNT = 5;

export const COMPANY_CATEGORY_OPTIONS = [
  '네카라쿠배',
  'IT 유니콘',
  '창업',
  '기타',
] as const;
export type CompanyCategory = (typeof COMPANY_CATEGORY_OPTIONS)[number];

export interface MentorCareerEntry {
  description: string;
  isCurrent: boolean;
  periodEnabled: boolean;
  startMonth: string;
  endMonth: string;
}

export interface MentorWeeklySchedule {
  timezone: typeof MENTOR_SCHEDULE_TIMEZONE;
  slotUnitMinutes: 30;
  weekly: Record<WeekdayKey, string[]>;
}

export type MentorScheduleTextDrafts = Record<WeekdayKey, string[]>;

export interface MentorSettings {
  contactCountryCode?: string;
  contactPhone?: string;
  categories: string[];
  mentoringTitle: string;
  appealLine: string;
  jobGroup: string;
  jobTitle: string;
  careerYears: string;
  careerEntries: MentorCareerEntry[];
  skillTags: string[];
  companyCategory: CompanyCategory;
  // Owner/admin editing still stores company visibility here. Public screens
  // must rely on structured backend visibility fields instead of legacy labels.
  companyName: string;
  hideCompanyName: boolean;
  listVisible: boolean;
  maxParticipants: number;
  noteEnabled: boolean;
  notePrice: number;
  simpleEnabled: boolean;
  simplePrice: number;
  deepEnabled: boolean;
  deepPrice: number;
  deepDurationMinutes: ConsultingDurationMinutes;
  offlineEnabled: boolean;
  offlinePrice: number;
  offlineDurationMinutes: ConsultingDurationMinutes;
  schedule: MentorWeeklySchedule;
  detailedDescription: string;
  interviewQuestions: string[];
  preNotice: string;
  updatedAt: string;
}
