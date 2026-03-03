export const WEEKDAY_KEYS = [
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
  'SUN',
] as const;

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

export const CONTACT_COUNTRY_CODES = ['+82', '+1', '+81', '+86'] as const;
export type ContactCountryCode = (typeof CONTACT_COUNTRY_CODES)[number];

export const CONSULTING_DURATION_OPTIONS = [30, 60, 90] as const;
export type ConsultingDurationMinutes =
  (typeof CONSULTING_DURATION_OPTIONS)[number];

export const COMPANY_CATEGORY_OPTIONS = [
  '네카라쿠배',
  'IT 유니콘',
  '창업',
  '기타',
] as const;
export type CompanyCategory = (typeof COMPANY_CATEGORY_OPTIONS)[number];

export type SettlementPayerType = 'INDIVIDUAL' | 'BUSINESS' | 'OVERSEAS';

export interface MentorWeeklySchedule {
  timezone: 'Asia/Seoul';
  slotUnitMinutes: 30;
  weekly: Record<WeekdayKey, string[]>;
}

export interface MentorSettlementDraft {
  payerType: SettlementPayerType;
  contractName: string;
  accountHolder: string;
  bankCode: string;
  accountNumber: string;
  residentId?: string;
  businessName?: string;
  businessRegistrationNumber?: string;
  verified: boolean;
  updatedAt: string;
}

export interface MentorSettingsV3 {
  contactCountryCode: ContactCountryCode;
  contactPhone: string;
  contactEmail: string;
  categories: string[];
  mentoringTitle: string;
  appealLine: string;
  jobGroup: string;
  jobTitle: string;
  careerYears: string;
  skillTags: string[];
  companyCategory: CompanyCategory;
  companyName: string;
  hideCompanyName: boolean;
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
  settlementDraft: MentorSettlementDraft | null;
  schemaVersion: 3;
  updatedAt: string;
}

export type MentorSettingsV2 = MentorSettingsV3;
