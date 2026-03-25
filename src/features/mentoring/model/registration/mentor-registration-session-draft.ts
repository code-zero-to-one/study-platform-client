import {
  createDefaultMentorSettings,
  normalizeMentorCareerEntries,
} from '@/features/mentoring/model/mentor-settings';
import { getMentorRegistrationDraftStorageKey } from '@/features/mentoring/model/registration/mentor-registration-draft-storage';
import { normalizeMentorMarkdownContent } from '@/types/mentoring/markdown';
import {
  type MentorRegistrationPersistedStepId,
  type MentorRegistrationStepId,
  MENTOR_REGISTRATION_STEP_IDS,
  isMentorRegistrationPersistedStepId,
} from '@/types/mentoring/registration-view';
import {
  CONSULTING_DURATION_OPTIONS,
  WEEKDAY_KEYS,
} from '@/types/mentoring/settings';
import {
  createEmptyMentorScheduleDrafts,
  type MentorRegistrationFormInputValues,
} from '@/types/schemas/mentor-registration-schema';

export const createDefaultMentorRegistrationFormValues =
  (): MentorRegistrationFormInputValues => ({
    ...createDefaultMentorSettings(),
    scheduleDrafts: createEmptyMentorScheduleDrafts(),
  });

export const DEFAULT_MENTOR_REGISTRATION_FORM_VALUES =
  createDefaultMentorRegistrationFormValues();

export const DEFAULT_MENTOR_REGISTRATION_STEP_ID =
  MENTOR_REGISTRATION_STEP_IDS.basicInformation;

type MentorRegistrationSessionDraft = MentorRegistrationFormInputValues;

export interface MentorRegistrationSessionDraftEnvelope {
  version: 2;
  values: MentorRegistrationSessionDraft;
  currentStepId?: MentorRegistrationPersistedStepId;
  sourceUpdatedAt?: string;
}

const MENTOR_REGISTRATION_DRAFT_FIELD_KEYS = Object.keys(
  DEFAULT_MENTOR_REGISTRATION_FORM_VALUES,
) as Array<keyof MentorRegistrationFormInputValues>;

const isRecordObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const isStringArray = (value: unknown): value is string[] => {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
};

const normalizeDraftString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined;
};

const normalizeDraftBoolean = (value: unknown): boolean | undefined => {
  return typeof value === 'boolean' ? value : undefined;
};

const normalizeDraftNumber = (value: unknown): number | undefined => {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
};

const normalizeDraftCompanyCategory = (
  value: unknown,
): MentorRegistrationFormInputValues['companyCategory'] | undefined => {
  if (
    value !== '네카라쿠배' &&
    value !== 'IT 유니콘' &&
    value !== '창업' &&
    value !== '기타'
  ) {
    return undefined;
  }

  return value;
};

const normalizeDraftConsultingDuration = (
  value: unknown,
): MentorRegistrationFormInputValues['deepDurationMinutes'] | undefined => {
  if (
    typeof value !== 'number' ||
    !CONSULTING_DURATION_OPTIONS.includes(
      value as MentorRegistrationFormInputValues['deepDurationMinutes'],
    )
  ) {
    return undefined;
  }

  return value as MentorRegistrationFormInputValues['deepDurationMinutes'];
};

const normalizeDraftStringArray = (value: unknown): string[] | undefined => {
  if (!isStringArray(value)) {
    return undefined;
  }

  return value;
};

const normalizeDraftCareerEntries = (
  value: unknown,
): MentorRegistrationFormInputValues['careerEntries'] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return normalizeMentorCareerEntries(value, {
    preserveDisabledPeriodValues: true,
  });
};

const normalizeDraftScheduleTextDrafts = (
  value: unknown,
): MentorRegistrationFormInputValues['scheduleDrafts'] | undefined => {
  if (!isRecordObject(value)) {
    return undefined;
  }

  return Object.fromEntries(
    WEEKDAY_KEYS.map((day) => [
      day,
      normalizeDraftStringArray(value[day]) ?? [],
    ]),
  ) as MentorRegistrationFormInputValues['scheduleDrafts'];
};

const normalizeDraftSchedule = (
  value: unknown,
  fallback: MentorRegistrationFormInputValues['schedule'],
): MentorRegistrationFormInputValues['schedule'] => {
  if (!isRecordObject(value)) {
    return fallback;
  }

  const weeklySource = isRecordObject(value.weekly) ? value.weekly : undefined;

  return {
    timezone:
      value.timezone === 'Asia/Seoul' ? 'Asia/Seoul' : fallback.timezone,
    slotUnitMinutes:
      value.slotUnitMinutes === 30 ? 30 : fallback.slotUnitMinutes,
    weekly: Object.fromEntries(
      WEEKDAY_KEYS.map((day) => [
        day,
        normalizeDraftStringArray(weeklySource?.[day]) ?? fallback.weekly[day],
      ]),
    ) as MentorRegistrationFormInputValues['schedule']['weekly'],
  };
};

const toMentorRegistrationSessionDraft = (
  values: MentorRegistrationFormInputValues,
): MentorRegistrationSessionDraft => {
  return Object.fromEntries(
    MENTOR_REGISTRATION_DRAFT_FIELD_KEYS.map((key) => [key, values[key]]),
  ) as MentorRegistrationSessionDraft;
};

const isMentorRegistrationSessionDraftEnvelope = (
  value: unknown,
): value is MentorRegistrationSessionDraftEnvelope => {
  return (
    isRecordObject(value) && value.version === 2 && isRecordObject(value.values)
  );
};

const parseMentorRegistrationSessionDraft = (
  value: string,
): MentorRegistrationSessionDraftEnvelope | undefined => {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (isMentorRegistrationSessionDraftEnvelope(parsed)) {
      return {
        version: 2,
        values: Object.fromEntries(
          MENTOR_REGISTRATION_DRAFT_FIELD_KEYS.flatMap((key) =>
            key in parsed.values ? [[key, parsed.values[key]]] : [],
          ),
        ) as MentorRegistrationSessionDraft,
        currentStepId: isMentorRegistrationPersistedStepId(parsed.currentStepId)
          ? parsed.currentStepId
          : undefined,
        sourceUpdatedAt:
          typeof parsed.sourceUpdatedAt === 'string'
            ? parsed.sourceUpdatedAt
            : undefined,
      };
    }

    if (!isRecordObject(parsed)) {
      return undefined;
    }

    return {
      version: 2,
      values: Object.fromEntries(
        MENTOR_REGISTRATION_DRAFT_FIELD_KEYS.flatMap((key) =>
          key in parsed ? [[key, parsed[key]]] : [],
        ),
      ) as MentorRegistrationSessionDraft,
    };
  } catch {
    return undefined;
  }
};

export const readMentorRegistrationSessionDraft = (
  memberId: number,
): MentorRegistrationSessionDraftEnvelope | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const key = getMentorRegistrationDraftStorageKey(memberId);
  const rawValue = window.sessionStorage.getItem(key);

  if (!rawValue) {
    return undefined;
  }

  const parsedDraft = parseMentorRegistrationSessionDraft(rawValue);

  if (!parsedDraft) {
    window.sessionStorage.removeItem(key);
  }

  return parsedDraft;
};

export const writeMentorRegistrationSessionDraft = ({
  memberId,
  values,
  currentStepId,
}: {
  memberId: number;
  values: MentorRegistrationFormInputValues;
  currentStepId: MentorRegistrationStepId;
}) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(
    getMentorRegistrationDraftStorageKey(memberId),
    JSON.stringify({
      version: 2,
      values: toMentorRegistrationSessionDraft(values),
      currentStepId,
      sourceUpdatedAt: values.updatedAt,
    } satisfies MentorRegistrationSessionDraftEnvelope),
  );
};

export const clearMentorRegistrationSessionDraft = (memberId: number) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(
    getMentorRegistrationDraftStorageKey(memberId),
  );
};

export const mergeMentorRegistrationFormValuesWithSessionDraft = ({
  baseValues,
  sessionDraftValues,
}: {
  baseValues: MentorRegistrationFormInputValues;
  sessionDraftValues: MentorRegistrationSessionDraft | undefined;
}): MentorRegistrationFormInputValues => {
  if (!sessionDraftValues) {
    return baseValues;
  }

  return {
    categories:
      normalizeDraftStringArray(sessionDraftValues.categories) ??
      baseValues.categories,
    mentoringTitle:
      normalizeDraftString(sessionDraftValues.mentoringTitle) ??
      baseValues.mentoringTitle,
    appealLine:
      normalizeDraftString(sessionDraftValues.appealLine) ??
      baseValues.appealLine,
    jobGroup:
      normalizeDraftString(sessionDraftValues.jobGroup) ?? baseValues.jobGroup,
    jobTitle:
      normalizeDraftString(sessionDraftValues.jobTitle) ?? baseValues.jobTitle,
    careerYears:
      normalizeDraftString(sessionDraftValues.careerYears) ??
      baseValues.careerYears,
    careerEntries:
      normalizeDraftCareerEntries(sessionDraftValues.careerEntries) ??
      baseValues.careerEntries,
    skillTags:
      normalizeDraftStringArray(sessionDraftValues.skillTags) ??
      baseValues.skillTags,
    companyCategory:
      normalizeDraftCompanyCategory(sessionDraftValues.companyCategory) ??
      baseValues.companyCategory,
    companyName:
      normalizeDraftString(sessionDraftValues.companyName) ??
      baseValues.companyName,
    hideCompanyName:
      normalizeDraftBoolean(sessionDraftValues.hideCompanyName) ??
      baseValues.hideCompanyName,
    listVisible:
      normalizeDraftBoolean(sessionDraftValues.listVisible) ??
      baseValues.listVisible,
    maxParticipants:
      normalizeDraftNumber(sessionDraftValues.maxParticipants) ??
      baseValues.maxParticipants,
    noteEnabled:
      normalizeDraftBoolean(sessionDraftValues.noteEnabled) ??
      baseValues.noteEnabled,
    notePrice:
      normalizeDraftNumber(sessionDraftValues.notePrice) ??
      baseValues.notePrice,
    simpleEnabled:
      normalizeDraftBoolean(sessionDraftValues.simpleEnabled) ??
      baseValues.simpleEnabled,
    simplePrice:
      normalizeDraftNumber(sessionDraftValues.simplePrice) ??
      baseValues.simplePrice,
    deepEnabled:
      normalizeDraftBoolean(sessionDraftValues.deepEnabled) ??
      baseValues.deepEnabled,
    deepPrice:
      normalizeDraftNumber(sessionDraftValues.deepPrice) ??
      baseValues.deepPrice,
    deepDurationMinutes:
      normalizeDraftConsultingDuration(
        sessionDraftValues.deepDurationMinutes,
      ) ?? baseValues.deepDurationMinutes,
    offlineEnabled:
      normalizeDraftBoolean(sessionDraftValues.offlineEnabled) ??
      baseValues.offlineEnabled,
    offlinePrice:
      normalizeDraftNumber(sessionDraftValues.offlinePrice) ??
      baseValues.offlinePrice,
    offlineDurationMinutes:
      normalizeDraftConsultingDuration(
        sessionDraftValues.offlineDurationMinutes,
      ) ?? baseValues.offlineDurationMinutes,
    interviewQuestions:
      normalizeDraftStringArray(sessionDraftValues.interviewQuestions) ??
      baseValues.interviewQuestions,
    schedule: normalizeDraftSchedule(
      sessionDraftValues.schedule,
      baseValues.schedule,
    ),
    scheduleDrafts:
      normalizeDraftScheduleTextDrafts(sessionDraftValues.scheduleDrafts) ??
      baseValues.scheduleDrafts,
    detailedDescription:
      normalizeDraftString(sessionDraftValues.detailedDescription) !== undefined
        ? normalizeMentorMarkdownContent(sessionDraftValues.detailedDescription)
        : baseValues.detailedDescription,
    preNotice:
      normalizeDraftString(sessionDraftValues.preNotice) ??
      baseValues.preNotice,
    updatedAt:
      normalizeDraftString(sessionDraftValues.updatedAt) ??
      baseValues.updatedAt,
  };
};

export const shouldRestoreSessionDraft = ({
  sessionDraft,
  sourceUpdatedAt,
}: {
  sessionDraft: MentorRegistrationSessionDraftEnvelope | undefined;
  sourceUpdatedAt: string;
}) => {
  if (!sessionDraft) {
    return false;
  }

  if (!sourceUpdatedAt.trim()) {
    return false;
  }

  return sessionDraft.sourceUpdatedAt === sourceUpdatedAt;
};

const serializeMentorRegistrationSessionDraft = (
  values: MentorRegistrationFormInputValues,
) => {
  return JSON.stringify(toMentorRegistrationSessionDraft(values));
};

export const hasPersistableDraftChanges = ({
  baseValues,
  nextValues,
}: {
  baseValues: MentorRegistrationFormInputValues;
  nextValues: MentorRegistrationFormInputValues;
}) => {
  return (
    serializeMentorRegistrationSessionDraft(baseValues) !==
    serializeMentorRegistrationSessionDraft(nextValues)
  );
};

export const shouldPersistSessionDraftState = ({
  baseValues,
  nextValues,
  currentStepId,
}: {
  baseValues: MentorRegistrationFormInputValues;
  nextValues: MentorRegistrationFormInputValues;
  currentStepId: MentorRegistrationStepId;
}) => {
  return (
    hasPersistableDraftChanges({
      baseValues,
      nextValues,
    }) || currentStepId !== DEFAULT_MENTOR_REGISTRATION_STEP_ID
  );
};

export const getMentorRegistrationServerSnapshotKey = ({
  mentorId,
  updatedAt,
}: {
  mentorId: number;
  updatedAt: string;
}) => {
  return `${mentorId}:${updatedAt.trim()}`;
};
