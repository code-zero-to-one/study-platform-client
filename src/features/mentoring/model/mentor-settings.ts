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

export type SettlementPayerType = 'INDIVIDUAL' | 'BUSINESS' | 'OVERSEAS';

export interface MentorHoliday {
  id: string;
  startDate: string;
  endDate: string;
  memo: string;
}

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
  jobGroup: string;
  jobTitle: string;
  careerYears: string;
  skillTags: string[];
  companyName: string;
  hideCompanyName: boolean;
  maxParticipants: number;
  noteEnabled: boolean;
  notePrice: number;
  phoneEnabled: boolean;
  phonePrice: number;
  onlineEnabled: boolean;
  onlinePrice: number;
  onlineDurationMinutes: ConsultingDurationMinutes;
  offlineEnabled: boolean;
  offlinePrice: number;
  offlineDurationMinutes: ConsultingDurationMinutes;
  schedule: MentorWeeklySchedule;
  holidays: MentorHoliday[];
  detailedDescription: string;
  interviewQuestions: string[];
  preNotice: string;
  settlementDraft: MentorSettlementDraft | null;
  schemaVersion: 3;
  updatedAt: string;
}

export type MentorSettingsV2 = MentorSettingsV3;

export const createEmptyWeeklySchedule = (): Record<WeekdayKey, string[]> => {
  return {
    MON: [],
    TUE: [],
    WED: [],
    THU: [],
    FRI: [],
    SAT: [],
    SUN: [],
  };
};

export const createDefaultMentorSettings = (): MentorSettingsV3 => {
  return {
    contactCountryCode: '+82',
    contactPhone: '',
    contactEmail: '',
    categories: [],
    mentoringTitle: '',
    jobGroup: '',
    jobTitle: '',
    careerYears: '',
    skillTags: [],
    companyName: '',
    hideCompanyName: false,
    maxParticipants: 1,
    noteEnabled: true,
    notePrice: 5000,
    phoneEnabled: true,
    phonePrice: 15000,
    onlineEnabled: true,
    onlinePrice: 30000,
    onlineDurationMinutes: 60,
    offlineEnabled: false,
    offlinePrice: 100000,
    offlineDurationMinutes: 60,
    schedule: {
      timezone: 'Asia/Seoul',
      slotUnitMinutes: 30,
      weekly: createEmptyWeeklySchedule(),
    },
    holidays: [],
    detailedDescription: '',
    interviewQuestions: [],
    preNotice: '',
    settlementDraft: null,
    schemaVersion: 3,
    updatedAt: new Date().toISOString(),
  };
};

export const getWeekdayKeyFromDate = (date: Date): WeekdayKey => {
  const day = date.getDay();
  const map: WeekdayKey[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return map[day] ?? 'MON';
};

export const isDateInHolidayRange = (
  date: Date,
  holidays: MentorHoliday[],
): boolean => {
  const target = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;

  return holidays.some((holiday) => {
    return target >= holiday.startDate && target <= holiday.endDate;
  });
};

export const createHalfHourTimeSlots = (): string[] => {
  const slots: string[] = [];

  for (let hour = 0; hour < 24; hour += 1) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    slots.push(`${String(hour).padStart(2, '0')}:30`);
  }

  return slots;
};

export const toReadableDuration = (
  minutes: ConsultingDurationMinutes,
): string => {
  return `${minutes}분`;
};

export const addMinutesToTime = (time: string, minutes: number): string => {
  const [hour, minute] = time.split(':').map(Number);
  const baseMinutes = hour * 60 + minute + minutes;
  const normalizedMinutes = ((baseMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const nextHour = Math.floor(normalizedMinutes / 60);
  const nextMinute = normalizedMinutes % 60;

  return `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;
};

export const toTimeRangeLabel = (
  startTime: string,
  durationMinutes: number,
): string => {
  return `${startTime}~${addMinutesToTime(startTime, durationMinutes)}`;
};

export const hasAnyWeeklyScheduleSlots = (
  schedule: MentorWeeklySchedule,
): boolean => {
  return WEEKDAY_KEYS.some((day) => schedule.weekly[day].length > 0);
};

export const parseDurationLabelToMinutes = (
  durationLabel: string,
): number | undefined => {
  const minuteMatch = durationLabel.match(/^(\d+)\s*분$/);
  if (minuteMatch) {
    return Number(minuteMatch[1]);
  }

  const hourMinuteMatch = durationLabel.match(
    /^(\d+)\s*시간(?:\s*(\d+)\s*분)?$/,
  );
  if (hourMinuteMatch) {
    const hour = Number(hourMinuteMatch[1]);
    const minute = Number(hourMinuteMatch[2] ?? '0');

    return hour * 60 + minute;
  }

  return undefined;
};
