import {
  WEEKDAY_KEYS,
  type ConsultingDurationMinutes,
  type MentorHoliday,
  type MentorSettingsV3,
  type MentorWeeklySchedule,
  type WeekdayKey,
} from '@/types/mentoring-settings';

export {
  COMPANY_CATEGORY_OPTIONS,
  CONSULTING_DURATION_OPTIONS,
  CONTACT_COUNTRY_CODES,
  WEEKDAY_KEYS,
  WEEKDAY_LABEL_MAP,
  type CompanyCategory,
  type ContactCountryCode,
  type ConsultingDurationMinutes,
  type MentorHoliday,
  type MentorSettingsV2,
  type MentorSettingsV3,
  type MentorSettlementDraft,
  type MentorWeeklySchedule,
  type SettlementPayerType,
  type WeekdayKey,
} from '@/types/mentoring-settings';

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
    appealLine: '',
    jobGroup: '',
    jobTitle: '',
    careerYears: '',
    skillTags: [],
    companyCategory: '기타',
    companyName: '',
    hideCompanyName: false,
    maxParticipants: 1,
    noteEnabled: true,
    notePrice: 3000,
    phoneEnabled: true,
    phonePrice: 3000,
    onlineEnabled: true,
    onlinePrice: 3000,
    onlineDurationMinutes: 60,
    offlineEnabled: false,
    offlinePrice: 3000,
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
