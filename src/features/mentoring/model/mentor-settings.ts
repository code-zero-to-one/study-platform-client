import {
  MENTOR_SCHEDULE_TIMEZONE,
  MENTOR_CAREER_ENTRY_MAX_COUNT,
  WEEKDAY_KEYS,
  type ConsultingDurationMinutes,
  type MentorCareerEntry,
  type MentorScheduleTextDrafts,
  type MentorSettings,
  type MentorWeeklySchedule,
  type WeekdayKey,
} from '@/types/mentoring/settings';

export {
  MENTOR_SCHEDULE_TIMEZONE,
  COMPANY_CATEGORY_OPTIONS,
  CONSULTING_DURATION_OPTIONS,
  CONTACT_COUNTRY_CODES,
  MENTOR_CAREER_ENTRY_MAX_COUNT,
  WEEKDAY_KEYS,
  WEEKDAY_LABEL_MAP,
  type CompanyCategory,
  type ContactCountryCode,
  type ConsultingDurationMinutes,
  type MentorCareerEntry,
  type MentorScheduleTextDrafts,
  type MentorSettings,
  type MentorWeeklySchedule,
  type WeekdayKey,
} from '@/types/mentoring/settings';

const SCHEDULE_RANGE_TOKEN_SPLIT_REGEX = /[,\n/]/;
const SCHEDULE_RANGE_TEXT_REGEX =
  /^(\d{2}:\d{2})\s*[~-]\s*(\d{2}:\d{2}|24:00)$/;
const SCHEDULE_TIME_TEXT_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const CAREER_ENTRY_MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
const SCHEDULE_RANGE_DELIMITER = ' / ';
const SCHEDULE_RANGE_PLACEHOLDER = '예: 09:00~12:00 / 13:30~15:00';
const MINUTES_PER_SLOT = 30;
const DAY_END_MINUTES = 24 * 60;
export const MENTOR_SCHEDULE_DRAFT_MAX_LENGTH = 64;
export const EMPTY_MENTOR_SCHEDULE_DRAFT_MESSAGE =
  '빈 스케줄 입력을 삭제하거나 시간을 입력해주세요.';

const createWeekdayRecord = <T>(
  buildValue: (day: WeekdayKey) => T,
): Record<WeekdayKey, T> => {
  return Object.fromEntries(
    WEEKDAY_KEYS.map((day) => [day, buildValue(day)]),
  ) as Record<WeekdayKey, T>;
};

export const createEmptyWeeklySchedule = (): Record<WeekdayKey, string[]> => {
  return createWeekdayRecord<string[]>(() => []);
};

export const createEmptyMentorCareerEntry = (): MentorCareerEntry => ({
  description: '',
  isCurrent: false,
  periodEnabled: false,
  startMonth: '',
  endMonth: '',
});

const isRecordObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const toTrimmedString = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

interface NormalizeMentorCareerEntriesOptions {
  preserveDisabledPeriodValues?: boolean;
}

export const normalizeMentorCareerEntryMonth = (value: unknown): string => {
  const normalized = toTrimmedString(value);

  return CAREER_ENTRY_MONTH_REGEX.test(normalized) ? normalized : '';
};

const hasMentorCareerEntryContent = ({
  description,
  periodEnabled,
  startMonth,
  endMonth,
}: MentorCareerEntry) => {
  return (
    description.length > 0 ||
    periodEnabled ||
    startMonth.length > 0 ||
    endMonth.length > 0
  );
};

export const normalizeMentorCareerEntries = (
  value: unknown,
  options: NormalizeMentorCareerEntriesOptions = {},
): MentorCareerEntry[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .flatMap((item) => {
      if (!isRecordObject(item)) {
        return [];
      }

      const description = toTrimmedString(item.description);
      const isCurrent = item.isCurrent === true;
      const startMonth = normalizeMentorCareerEntryMonth(item.startMonth);
      const endMonth = normalizeMentorCareerEntryMonth(item.endMonth);
      const hasExplicitPeriodEnabled = typeof item.periodEnabled === 'boolean';
      const periodEnabled = hasExplicitPeriodEnabled
        ? item.periodEnabled === true
        : startMonth.length > 0 || endMonth.length > 0;
      const shouldKeepHiddenPeriodValues =
        options.preserveDisabledPeriodValues === true;
      const normalizedEndMonth = isCurrent ? '' : endMonth;
      const normalizedEntry = {
        description,
        isCurrent,
        periodEnabled,
        startMonth:
          periodEnabled || shouldKeepHiddenPeriodValues ? startMonth : '',
        endMonth:
          periodEnabled || shouldKeepHiddenPeriodValues
            ? normalizedEndMonth
            : '',
      } satisfies MentorCareerEntry;

      if (!hasMentorCareerEntryContent(normalizedEntry)) {
        return [];
      }

      return [normalizedEntry];
    })
    .slice(0, MENTOR_CAREER_ENTRY_MAX_COUNT);
};

const formatMentorCareerEntryMonth = (value: string) => {
  return value.replace('-', '.');
};

export const getCurrentMentorCareerEntryMonth = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: MENTOR_SCHEDULE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';

  return `${year}-${month}`;
};

export const formatMentorCareerEntryPeriodLabel = ({
  periodEnabled,
  startMonth,
  endMonth,
  isCurrent,
}: Pick<
  MentorCareerEntry,
  'periodEnabled' | 'startMonth' | 'endMonth' | 'isCurrent'
>): string => {
  if (!periodEnabled || !startMonth) {
    return '';
  }

  if (isCurrent) {
    return `${formatMentorCareerEntryMonth(startMonth)} - 현재`;
  }

  if (!endMonth) {
    return '';
  }

  return `${formatMentorCareerEntryMonth(startMonth)} - ${formatMentorCareerEntryMonth(endMonth)}`;
};

export const createDefaultMentorSettings = (): MentorSettings => {
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
    careerEntries: [],
    skillTags: [],
    companyCategory: '기타',
    companyName: '',
    hideCompanyName: true,
    listVisible: true,
    maxParticipants: 1,
    noteEnabled: false,
    notePrice: 0,
    simpleEnabled: false,
    simplePrice: 0,
    deepEnabled: false,
    deepPrice: 0,
    deepDurationMinutes: 60,
    offlineEnabled: false,
    offlinePrice: 0,
    offlineDurationMinutes: 60,
    schedule: {
      timezone: MENTOR_SCHEDULE_TIMEZONE,
      slotUnitMinutes: 30,
      weekly: createEmptyWeeklySchedule(),
    },
    detailedDescription: '',
    interviewQuestions: [],
    preNotice: '',
    updatedAt: '',
  };
};

const TIME_SLOT_WEEKDAY_PREFIX_REGEX = /^(MON|TUE|WED|THU|FRI|SAT|SUN)\s+(.+)$/;

const stripWeekdayPrefixFromTimeSlot = (timeSlot: string) => {
  const trimmed = timeSlot.trim();
  const match = trimmed.match(TIME_SLOT_WEEKDAY_PREFIX_REGEX);

  return match?.[2]?.trim() ?? trimmed;
};

export const getWeekdayKeyFromDate = (date: Date): WeekdayKey => {
  const day = date.getDay();
  const map: WeekdayKey[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return map[day] ?? 'MON';
};

export const createHalfHourTimeSlots = (): string[] => {
  const slots: string[] = [];

  for (let hour = 0; hour < 24; hour += 1) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    slots.push(`${String(hour).padStart(2, '0')}:30`);
  }

  return slots;
};

export const sortMentorScheduleSlots = (slots: string[]) => {
  return [...slots].sort((first, second) => first.localeCompare(second));
};

export const addMinutesToTime = (time: string, minutes: number): string => {
  const [hour, minute] = time.split(':').map(Number);
  const baseMinutes = hour * 60 + minute + minutes;
  const normalizedMinutes = ((baseMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const nextHour = Math.floor(normalizedMinutes / 60);
  const nextMinute = normalizedMinutes % 60;

  return `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;
};

export const toMentorScheduleTextRanges = (slots: string[]): string[] => {
  if (slots.length === 0) {
    return [];
  }

  const sorted = sortMentorScheduleSlots(slots);
  const ranges: string[] = [];
  let start = sorted[0];
  let previous = sorted[0];

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index];
    if (addMinutesToTime(previous, MINUTES_PER_SLOT) === current) {
      previous = current;
      continue;
    }

    ranges.push(`${start}~${addMinutesToTime(previous, MINUTES_PER_SLOT)}`);
    start = current;
    previous = current;
  }

  ranges.push(`${start}~${addMinutesToTime(previous, MINUTES_PER_SLOT)}`);

  return ranges;
};

export const createMentorScheduleTextDrafts = (
  schedule: MentorWeeklySchedule,
): MentorScheduleTextDrafts => {
  return createWeekdayRecord((day) =>
    toMentorScheduleTextRanges(schedule.weekly[day]),
  );
};

export const normalizeMentorScheduleTextDrafts = (
  value: unknown,
  fallbackSchedule: MentorWeeklySchedule,
): MentorScheduleTextDrafts => {
  const fallbackDrafts = createMentorScheduleTextDrafts(fallbackSchedule);

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fallbackDrafts;
  }

  return createWeekdayRecord((day) => {
    const drafts = (value as Record<string, unknown>)[day];

    if (!Array.isArray(drafts)) {
      return fallbackDrafts[day];
    }

    return drafts.filter((draft): draft is string => typeof draft === 'string');
  });
};

export const createEmptyMentorScheduleDraftErrors = (): Record<
  WeekdayKey,
  string
> => {
  return createWeekdayRecord(() => '');
};

const parseScheduleTimeTextToMinutes = (
  timeText: string,
): number | undefined => {
  if (timeText === '24:00') {
    return DAY_END_MINUTES;
  }

  if (!SCHEDULE_TIME_TEXT_REGEX.test(timeText)) {
    return undefined;
  }

  const [hourText, minuteText] = timeText.split(':');

  return Number(hourText) * 60 + Number(minuteText);
};

const normalizeScheduleRangeEndText = ({
  startText,
  endText,
}: {
  startText: string;
  endText: string;
}) => {
  if (endText === '00:00' && startText !== '00:00') {
    return '24:00';
  }

  return endText;
};

const toScheduleSlotText = (minutes: number): string => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

export const parseMentorScheduleTimeRangeText = (
  rawValue: string,
):
  | { slots: string[]; normalizedText: string }
  | { error: string; slots?: never; normalizedText?: never } => {
  const trimmed = rawValue.trim();

  if (trimmed.length === 0) {
    return { slots: [], normalizedText: '' };
  }

  if (trimmed.length > MENTOR_SCHEDULE_DRAFT_MAX_LENGTH) {
    return {
      error: `스케줄 입력은 ${MENTOR_SCHEDULE_DRAFT_MAX_LENGTH}자 이하로 입력해주세요.`,
    };
  }

  const tokens = trimmed
    .split(SCHEDULE_RANGE_TOKEN_SPLIT_REGEX)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  if (tokens.length === 0) {
    return { slots: [], normalizedText: '' };
  }

  const slotSet = new Set<string>();

  for (const token of tokens) {
    const match = token.match(SCHEDULE_RANGE_TEXT_REGEX);

    if (!match) {
      return {
        error: `시간 형식이 올바르지 않아요. ${SCHEDULE_RANGE_PLACEHOLDER}`,
      };
    }

    const [, startText, endText] = match;
    const startMinutes = parseScheduleTimeTextToMinutes(startText);
    const normalizedEndText = normalizeScheduleRangeEndText({
      startText,
      endText,
    });
    const endMinutes = parseScheduleTimeTextToMinutes(normalizedEndText);

    if (startMinutes === undefined || endMinutes === undefined) {
      return {
        error: `시간은 HH:mm 형식으로 입력해주세요. ${SCHEDULE_RANGE_PLACEHOLDER}`,
      };
    }

    if (startMinutes >= DAY_END_MINUTES || endMinutes > DAY_END_MINUTES) {
      return { error: '시간은 00:00~24:00 범위에서 입력해주세요.' };
    }

    if (
      startMinutes % MINUTES_PER_SLOT !== 0 ||
      endMinutes % MINUTES_PER_SLOT !== 0
    ) {
      return { error: '시간은 30분 단위(00, 30)로 입력해주세요.' };
    }

    if (startMinutes >= endMinutes) {
      return { error: '종료 시간은 시작 시간보다 늦어야 합니다.' };
    }

    for (
      let cursor = startMinutes;
      cursor < endMinutes;
      cursor += MINUTES_PER_SLOT
    ) {
      slotSet.add(toScheduleSlotText(cursor));
    }
  }

  const slots = sortMentorScheduleSlots(Array.from(slotSet));

  return {
    slots,
    normalizedText: toMentorScheduleTextRanges(slots).join(
      SCHEDULE_RANGE_DELIMITER,
    ),
  };
};

export const parseMentorScheduleTextDraft = parseMentorScheduleTimeRangeText;

export const getMentorScheduleDraftError = (drafts: string[]): string => {
  if (drafts.some((draft) => draft.trim().length === 0)) {
    return EMPTY_MENTOR_SCHEDULE_DRAFT_MESSAGE;
  }

  const parsed = parseMentorScheduleTimeRangeText(
    drafts
      .map((draft) => draft.trim())
      .filter((draft) => draft.length > 0)
      .join(SCHEDULE_RANGE_DELIMITER),
  );

  return 'error' in parsed ? parsed.error : '';
};

export const getMentorScheduleDraftErrors = (
  drafts: MentorScheduleTextDrafts,
): Record<WeekdayKey, string> => {
  return createWeekdayRecord((day) => getMentorScheduleDraftError(drafts[day]));
};

export const validateMentorScheduleTextDrafts = getMentorScheduleDraftErrors;

export const applyMentorScheduleTextDrafts = ({
  schedule,
  drafts,
}: {
  schedule: MentorWeeklySchedule;
  drafts: MentorScheduleTextDrafts;
}) => {
  const nextWeekly = createEmptyWeeklySchedule();
  const errors = createEmptyMentorScheduleDraftErrors();

  WEEKDAY_KEYS.forEach((day) => {
    if (drafts[day].some((draft) => draft.trim().length === 0)) {
      nextWeekly[day] = sortMentorScheduleSlots(schedule.weekly[day]);
      errors[day] = EMPTY_MENTOR_SCHEDULE_DRAFT_MESSAGE;

      return;
    }

    const parsed = parseMentorScheduleTimeRangeText(
      drafts[day]
        .map((draft) => draft.trim())
        .filter((draft) => draft.length > 0)
        .join(SCHEDULE_RANGE_DELIMITER),
    );

    if ('error' in parsed) {
      nextWeekly[day] = sortMentorScheduleSlots(schedule.weekly[day]);
      errors[day] = parsed.error;

      return;
    }

    nextWeekly[day] = parsed.slots;
  });

  return {
    schedule: {
      ...schedule,
      weekly: nextWeekly,
    },
    errors,
    hasInvalidDrafts: WEEKDAY_KEYS.some((day) => errors[day].length > 0),
  };
};

export const toReadableDuration = (
  minutes: ConsultingDurationMinutes,
): string => {
  return `${minutes}분`;
};

export const toTimeRangeLabel = (
  startTime: string,
  durationMinutes: number,
): string => {
  return `${startTime}~${addMinutesToTime(startTime, durationMinutes)}`;
};

export const parseWeekdayFromTimeSlot = (
  timeSlot: string,
): WeekdayKey | undefined => {
  const match = timeSlot.trim().match(TIME_SLOT_WEEKDAY_PREFIX_REGEX);

  return match?.[1] as WeekdayKey | undefined;
};

export const normalizeMentoringTimeSlotLabel = ({
  timeSlot,
  durationMinutes,
}: {
  timeSlot: string;
  durationMinutes: number;
}) => {
  const normalized = stripWeekdayPrefixFromTimeSlot(timeSlot).replace(
    /\s*~\s*/g,
    '~',
  );

  if (/^\d{2}:\d{2}$/.test(normalized)) {
    return toTimeRangeLabel(normalized, durationMinutes);
  }

  return normalized;
};

export const extractMentoringTimeSlotStart = (timeSlot: string) => {
  return stripWeekdayPrefixFromTimeSlot(timeSlot).split('~')[0]?.trim() ?? '';
};

export const filterMentoringTimeSlotsByWeekday = ({
  timeSlots,
  weekday,
  durationMinutes,
}: {
  timeSlots: string[];
  weekday: WeekdayKey;
  durationMinutes: number;
}) => {
  const normalizedSlots = timeSlots.flatMap((timeSlot) => {
    const slotWeekday = parseWeekdayFromTimeSlot(timeSlot);

    if (slotWeekday && slotWeekday !== weekday) {
      return [];
    }

    const normalizedLabel = normalizeMentoringTimeSlotLabel({
      timeSlot,
      durationMinutes,
    });

    return normalizedLabel ? [normalizedLabel] : [];
  });

  return Array.from(new Set(normalizedSlots));
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
