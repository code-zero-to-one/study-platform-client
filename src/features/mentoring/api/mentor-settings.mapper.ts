import {
  createMentorScheduleTextDrafts,
  createDefaultMentorSettings,
  normalizeMentorCareerEntries,
  WEEKDAY_KEYS,
} from '@/features/mentoring/model/mentor-settings';
import {
  MENTORING_METHOD_LABEL_MAP,
  MENTORING_METHOD_ORDER,
  MENTORING_METHOD_REQUEST_TYPE_MAP,
  parseMentoringMethodType,
} from '@/features/mentoring/model/mentoring-method';
import type {
  MentorProfile,
  MentoringMethodType,
} from '@/types/mentoring/domain';
import { normalizeMentorMarkdownContent } from '@/types/mentoring/markdown';
import type {
  MentorRegistrationOptions,
  MentorRegistrationCareerOption,
  MentorRegistrationJobGroupOption,
  MentorRegistrationJobTitleOption,
  MentorRegistrationSelectableCoreKeywordOption,
} from '@/types/mentoring/registration-options';
import type { MentorRegistrationFormValues } from '@/types/schemas/mentor-registration-schema';
import {
  requireArray,
  requireInteger,
  requireNonEmptyString,
  requireObject,
  toContractError,
} from './mentor-api-contract';
import type {
  CodeLabelResponseDto,
  CoreKeywordResponseDto,
  MethodResponseDto,
  MyMentorSettingsResponseDto,
  ProfileResponseDto,
  RegistrationOptionsCareerResponseDto,
  RegistrationOptionsJobGroupResponseDto,
  RegistrationOptionsJobTitleResponseDto,
  RegistrationOptionsResponseDto,
  ScheduleResponseDto,
  WeeklyResponseDto,
  WeeklyRangesResponseDto,
  WeeklyRangeResponseDto,
  MentorSettingsResponseDto,
  MentorSettingsUpsertRequestDto,
} from './mentor-api.types';
import {
  buildMentorCoreKeywordRequests,
  requireMentorCoreKeywordSnapshots,
  requireMentorCoreKeywordFormValues,
  type MentorCoreKeywordSnapshot,
} from './mentor-core-keyword-contract';
import {
  mapMentorPublicReadiness,
  normalizePublicReadinessStage,
  toPublicReadinessStage,
} from './mentor-public-readiness.mapper';

export interface MyMentorSettingsFoundResult {
  kind: 'found';
  mentorId: number;
  settings: MentorRegistrationFormValues;
  savedCoreKeywords: MentorCoreKeywordSnapshot[];
  publicReadinessStage?: MentorProfile['publicReadinessStage'];
  publicReadiness?: MentorProfile['publicReadiness'];
}

export interface MyMentorSettingsNotFoundResult {
  kind: 'not_found';
}

export type MyMentorSettingsResult =
  | MyMentorSettingsFoundResult
  | MyMentorSettingsNotFoundResult;

const COMPANY_CATEGORY_SET = new Set([
  '네카라쿠배',
  'IT 유니콘',
  '창업',
  '기타',
]);

const toTrimmedString = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(toTrimmedString).filter((item) => item.length > 0);
};

const requireBoolean = ({
  value,
  field,
}: {
  value: unknown;
  field: string;
}) => {
  if (typeof value !== 'boolean') {
    throw toContractError({
      scope: 'my-mentor-settings-response',
      field,
      causeData: value,
    });
  }

  return value;
};

const requireCodeFromCodeLabel = ({
  value,
  field,
}: {
  value: unknown;
  field: string;
}) => {
  const codeLabel = requireObject<CodeLabelResponseDto>({
    value,
    scope: 'my-mentor-settings-response',
    field,
  });

  return requireNonEmptyString({
    value: codeLabel.code,
    scope: 'my-mentor-settings-response',
    field: `${field}.code`,
  });
};

const toDurationMinutes = (
  value: unknown,
  fallback: 30 | 60 | 90,
): 30 | 60 | 90 => {
  if (value === 30 || value === 60 || value === 90) {
    return value;
  }

  return fallback;
};

const normalizeCompanyCategory = (
  value: unknown,
): MentorRegistrationFormValues['companyCategory'] => {
  if (typeof value !== 'string') {
    return '기타';
  }

  return COMPANY_CATEGORY_SET.has(value)
    ? (value as MentorRegistrationFormValues['companyCategory'])
    : '기타';
};

const toSortedByDisplayOrder = <
  T extends { displayOrder: number; code: string; active: boolean },
>(
  values: T[],
) => {
  return [...values].sort((first, second) => {
    if (first.displayOrder !== second.displayOrder) {
      return first.displayOrder - second.displayOrder;
    }

    return first.code.localeCompare(second.code, 'en');
  });
};

const toTimeMinutes = ({ value, field }: { value: unknown; field: string }) => {
  const time = requireNonEmptyString({
    value,
    scope: 'my-mentor-settings-response',
    field,
  });
  if (time === '24:00') {
    return 24 * 60;
  }

  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);

  if (!match) {
    throw toContractError({
      scope: 'my-mentor-settings-response',
      field,
      causeData: value,
    });
  }

  return Number(match[1]) * 60 + Number(match[2]);
};

const toTimeString = (minutes: number) => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const toWeeklySlotsFromWeeklyObject = (
  source: WeeklyResponseDto | undefined,
) => {
  return {
    MON: toStringArray(source?.MON ?? source?.mon),
    TUE: toStringArray(source?.TUE ?? source?.tue),
    WED: toStringArray(source?.WED ?? source?.wed),
    THU: toStringArray(source?.THU ?? source?.thu),
    FRI: toStringArray(source?.FRI ?? source?.fri),
    SAT: toStringArray(source?.SAT ?? source?.sat),
    SUN: toStringArray(source?.SUN ?? source?.sun),
  };
};

const toSlotsFromRanges = ({
  ranges,
  day,
}: {
  ranges: WeeklyRangeResponseDto[] | undefined;
  day: (typeof WEEKDAY_KEYS)[number];
}) => {
  if (!ranges || ranges.length === 0) {
    return [];
  }

  const slots = new Set<string>();

  ranges.forEach((range, index) => {
    const start = toTimeMinutes({
      value: range.start,
      field: `content.settings.schedule.weeklyRanges.${day}[${index}].start`,
    });
    const end = toTimeMinutes({
      value: range.end,
      field: `content.settings.schedule.weeklyRanges.${day}[${index}].end`,
    });

    if (start >= end || start % 30 !== 0 || end % 30 !== 0) {
      throw toContractError({
        scope: 'my-mentor-settings-response',
        field: `content.settings.schedule.weeklyRanges.${day}[${index}]`,
        causeData: range,
      });
    }

    for (let cursor = start; cursor < end; cursor += 30) {
      slots.add(toTimeString(cursor));
    }
  });

  return Array.from(slots).sort();
};

const toWeeklySlotsFromRangesObject = (
  source: WeeklyRangesResponseDto | undefined,
) => {
  return {
    MON: toSlotsFromRanges({
      ranges: source?.MON ?? source?.mon,
      day: 'MON',
    }),
    TUE: toSlotsFromRanges({
      ranges: source?.TUE ?? source?.tue,
      day: 'TUE',
    }),
    WED: toSlotsFromRanges({
      ranges: source?.WED ?? source?.wed,
      day: 'WED',
    }),
    THU: toSlotsFromRanges({
      ranges: source?.THU ?? source?.thu,
      day: 'THU',
    }),
    FRI: toSlotsFromRanges({
      ranges: source?.FRI ?? source?.fri,
      day: 'FRI',
    }),
    SAT: toSlotsFromRanges({
      ranges: source?.SAT ?? source?.sat,
      day: 'SAT',
    }),
    SUN: toSlotsFromRanges({
      ranges: source?.SUN ?? source?.sun,
      day: 'SUN',
    }),
  };
};

const hasAnyWeeklySlot = (
  weekly: Record<(typeof WEEKDAY_KEYS)[number], string[]>,
) => {
  return WEEKDAY_KEYS.some((day) => weekly[day].length > 0);
};

const toWeeklySchedule = (source: ScheduleResponseDto | undefined) => {
  try {
    const weeklyFromRanges = toWeeklySlotsFromRangesObject(
      source?.weeklyRanges,
    );
    if (hasAnyWeeklySlot(weeklyFromRanges)) {
      return weeklyFromRanges;
    }
  } catch {
    // Fallback to weekly slots when weeklyRanges shape is not compatible.
  }

  return toWeeklySlotsFromWeeklyObject(source?.weekly);
};

const toMentorMethodsFromArray = (source: MethodResponseDto[] | undefined) => {
  const methodMap = new Map<MentoringMethodType, MethodResponseDto>();

  source?.forEach((method) => {
    const methodType = parseMentoringMethodType(method.type);
    if (!methodType) {
      return;
    }

    methodMap.set(methodType, method);
  });

  return MENTORING_METHOD_ORDER.reduce<
    Record<
      MentoringMethodType,
      {
        type: MentoringMethodType;
        label: string;
        durationLabel: string;
        price: number;
        enabled: boolean;
      }
    >
  >(
    (accumulator, methodType) => {
      const method = methodMap.get(methodType);
      const durationMinutes =
        methodType === 'simple'
          ? 15
          : toDurationMinutes(method?.durationMinutes, 60);

      accumulator[methodType] = {
        type: methodType,
        label: MENTORING_METHOD_LABEL_MAP[methodType],
        durationLabel:
          methodType === 'note' ? '비동기' : `${durationMinutes}분`,
        price:
          typeof method?.price === 'number' && Number.isFinite(method.price)
            ? method.price
            : 0,
        enabled: method?.enabled === true,
      };

      return accumulator;
    },
    {
      note: {
        type: 'note',
        label: MENTORING_METHOD_LABEL_MAP.note,
        durationLabel: '비동기',
        price: 0,
        enabled: false,
      },
      simple: {
        type: 'simple',
        label: MENTORING_METHOD_LABEL_MAP.simple,
        durationLabel: '15분',
        price: 0,
        enabled: false,
      },
      deep: {
        type: 'deep',
        label: MENTORING_METHOD_LABEL_MAP.deep,
        durationLabel: '60분',
        price: 0,
        enabled: false,
      },
      offline: {
        type: 'offline',
        label: MENTORING_METHOD_LABEL_MAP.offline,
        durationLabel: '60분',
        price: 0,
        enabled: false,
      },
    },
  );
};

const toMentorSettingsFormValues = (
  source: MentorSettingsResponseDto,
  listVisibleFromRoot?: boolean,
): MentorRegistrationFormValues => {
  const defaults = createDefaultMentorSettings();
  const methods = toMentorMethodsFromArray(source.methods);
  const profile = requireObject<ProfileResponseDto>({
    value: source.profile,
    scope: 'my-mentor-settings-response',
    field: 'content.settings.profile',
  });
  const company = profile?.company;
  const companyVisible =
    typeof company?.visible === 'boolean' ? company.visible : undefined;
  const listVisible = listVisibleFromRoot ?? defaults.listVisible;
  const content = source.content;
  const coreKeywordValues = requireMentorCoreKeywordFormValues({
    value: profile.coreKeywords,
    scope: 'my-mentor-settings-response',
    field: 'content.settings.profile.coreKeywords',
  });
  const schedule = {
    timezone: 'Asia/Seoul' as const,
    slotUnitMinutes: 30 as const,
    weekly: toWeeklySchedule(source.schedule),
  };

  return {
    ...defaults,
    categories: toStringArray(profile.categories),
    mentoringTitle: toTrimmedString(profile.mentoringTitle),
    appealLine: toTrimmedString(profile.appealLine),
    jobGroup: requireCodeFromCodeLabel({
      value: profile.jobGroup,
      field: 'content.settings.profile.jobGroup',
    }),
    jobTitle: requireCodeFromCodeLabel({
      value: profile.jobTitle,
      field: 'content.settings.profile.jobTitle',
    }),
    careerYears: requireCodeFromCodeLabel({
      value: profile.career,
      field: 'content.settings.profile.career',
    }),
    careerEntries: normalizeMentorCareerEntries(profile.careerEntries),
    skillTags: coreKeywordValues,
    companyCategory: normalizeCompanyCategory(company?.category),
    companyName: toTrimmedString(company?.name),
    hideCompanyName:
      companyVisible !== undefined ? !companyVisible : defaults.hideCompanyName,
    listVisible,
    maxParticipants:
      typeof source.policy?.maxParticipants === 'number'
        ? source.policy.maxParticipants
        : defaults.maxParticipants,
    noteEnabled: methods.note.enabled,
    notePrice: methods.note.price,
    simpleEnabled: methods.simple.enabled,
    simplePrice: methods.simple.price,
    deepEnabled: methods.deep.enabled,
    deepPrice: methods.deep.price,
    deepDurationMinutes: toDurationMinutes(
      Number(methods.deep.durationLabel.replace(/\D/g, '')) || 60,
      60,
    ),
    offlineEnabled: methods.offline.enabled,
    offlinePrice: methods.offline.price,
    offlineDurationMinutes: toDurationMinutes(
      Number(methods.offline.durationLabel.replace(/\D/g, '')) || 60,
      60,
    ),
    schedule,
    scheduleDrafts: createMentorScheduleTextDrafts(schedule),
    detailedDescription: normalizeMentorMarkdownContent(
      content?.detailedDescription,
    ),
    interviewQuestions: toStringArray(content?.interviewQuestions),
    preNotice: toTrimmedString(content?.preNotice),
    updatedAt: toTrimmedString(source.metadata?.updatedAt),
  };
};

const toMentorSavedCoreKeywordSnapshots = (
  source: MentorSettingsResponseDto,
): MentorCoreKeywordSnapshot[] => {
  const profile = requireObject<ProfileResponseDto>({
    value: source.profile,
    scope: 'my-mentor-settings-response',
    field: 'content.settings.profile',
  });

  return requireMentorCoreKeywordSnapshots({
    value: profile.coreKeywords,
    scope: 'my-mentor-settings-response',
    field: 'content.settings.profile.coreKeywords',
  });
};

const mapRegistrationJobGroups = (
  source: RegistrationOptionsJobGroupResponseDto[],
): MentorRegistrationJobGroupOption[] => {
  return source.map((item, index) => {
    const code = requireNonEmptyString({
      value: item.code,
      scope: 'mentor-registration-options-response',
      field: `content.jobGroups[${index}].code`,
    });
    const label = requireNonEmptyString({
      value: item.label,
      scope: 'mentor-registration-options-response',
      field: `content.jobGroups[${index}].label`,
    });
    const displayOrder = requireInteger({
      value: item.displayOrder,
      scope: 'mentor-registration-options-response',
      field: `content.jobGroups[${index}].displayOrder`,
    });

    return {
      code,
      label,
      displayOrder,
      active: item.active !== false,
    };
  });
};

const mapRegistrationJobTitles = (
  source: RegistrationOptionsJobTitleResponseDto[],
): MentorRegistrationJobTitleOption[] => {
  return source.map((item, index) => {
    const code = requireNonEmptyString({
      value: item.code,
      scope: 'mentor-registration-options-response',
      field: `content.jobTitles[${index}].code`,
    });
    const label = requireNonEmptyString({
      value: item.label,
      scope: 'mentor-registration-options-response',
      field: `content.jobTitles[${index}].label`,
    });
    const jobGroupCode = requireNonEmptyString({
      value: item.jobGroupCode,
      scope: 'mentor-registration-options-response',
      field: `content.jobTitles[${index}].jobGroupCode`,
    });
    const displayOrder = requireInteger({
      value: item.displayOrder,
      scope: 'mentor-registration-options-response',
      field: `content.jobTitles[${index}].displayOrder`,
    });

    return {
      code,
      label,
      jobGroupCode,
      displayOrder,
      active: item.active !== false,
    };
  });
};

const mapRegistrationCareers = (
  source: RegistrationOptionsCareerResponseDto[],
): MentorRegistrationCareerOption[] => {
  return source.map((item, index) => {
    const code = requireNonEmptyString({
      value: item.code,
      scope: 'mentor-registration-options-response',
      field: `content.careers[${index}].code`,
    });
    const label = requireNonEmptyString({
      value: item.label,
      scope: 'mentor-registration-options-response',
      field: `content.careers[${index}].label`,
    });
    const displayOrder = requireInteger({
      value: item.displayOrder,
      scope: 'mentor-registration-options-response',
      field: `content.careers[${index}].displayOrder`,
    });
    const minYears = requireInteger({
      value: item.minYears,
      scope: 'mentor-registration-options-response',
      field: `content.careers[${index}].minYears`,
    });
    const maxYears =
      item.maxYears === null || item.maxYears === undefined
        ? undefined
        : requireInteger({
            value: item.maxYears,
            scope: 'mentor-registration-options-response',
            field: `content.careers[${index}].maxYears`,
          });

    return {
      code,
      label,
      minYears,
      maxYears,
      displayOrder,
      active: item.active !== false,
    };
  });
};

const mapRegistrationCoreKeywords = (
  source: CoreKeywordResponseDto[],
): MentorRegistrationSelectableCoreKeywordOption[] => {
  return source.map((item, index) => {
    const code = requireNonEmptyString({
      value: item.code,
      scope: 'mentor-registration-options-response',
      field: `content.coreKeywords[${index}].code`,
    });
    const label = requireNonEmptyString({
      value: item.label,
      scope: 'mentor-registration-options-response',
      field: `content.coreKeywords[${index}].label`,
    });
    const displayOrder = requireInteger({
      value: item.displayOrder,
      scope: 'mentor-registration-options-response',
      field: `content.coreKeywords[${index}].displayOrder`,
    });

    return {
      code,
      label,
      jobGroupCodes: toStringArray(item.jobGroupCodes),
      jobTitleCodes: toStringArray(item.jobTitleCodes),
      displayOrder,
      active: item.active !== false,
    };
  });
};

export const mapRegistrationOptionsContent = (
  content: unknown,
): MentorRegistrationOptions => {
  const contentObject = requireObject<RegistrationOptionsResponseDto>({
    value: content,
    scope: 'mentor-registration-options-response',
    field: 'content',
  });
  const maxCoreKeywordCount = requireInteger({
    value: contentObject.maxCoreKeywordCount,
    scope: 'mentor-registration-options-response',
    field: 'content.maxCoreKeywordCount',
  });

  if (maxCoreKeywordCount <= 0) {
    throw toContractError({
      scope: 'mentor-registration-options-response',
      field: 'content.maxCoreKeywordCount',
      causeData: contentObject.maxCoreKeywordCount,
    });
  }

  const jobGroupsSource = requireArray<RegistrationOptionsJobGroupResponseDto>({
    value: contentObject.jobGroups,
    scope: 'mentor-registration-options-response',
    field: 'content.jobGroups',
  });
  const jobTitlesSource = requireArray<RegistrationOptionsJobTitleResponseDto>({
    value: contentObject.jobTitles,
    scope: 'mentor-registration-options-response',
    field: 'content.jobTitles',
  });
  const careersSource = requireArray<RegistrationOptionsCareerResponseDto>({
    value: contentObject.careers,
    scope: 'mentor-registration-options-response',
    field: 'content.careers',
  });
  const coreKeywordsSource = requireArray<CoreKeywordResponseDto>({
    value: contentObject.coreKeywords,
    scope: 'mentor-registration-options-response',
    field: 'content.coreKeywords',
  });

  return {
    maxCoreKeywordCount,
    jobGroups: toSortedByDisplayOrder(
      mapRegistrationJobGroups(jobGroupsSource),
    ),
    jobTitles: toSortedByDisplayOrder(
      mapRegistrationJobTitles(jobTitlesSource),
    ),
    careers: toSortedByDisplayOrder(mapRegistrationCareers(careersSource)),
    selectableCoreKeywords: toSortedByDisplayOrder(
      mapRegistrationCoreKeywords(coreKeywordsSource),
    ),
  };
};

export const mapMyMentorSettingsContent = (
  content: unknown,
): MyMentorSettingsResult => {
  const contentObject = requireObject<MyMentorSettingsResponseDto>({
    value: content,
    scope: 'my-mentor-settings-response',
    field: 'content',
  });
  const registered = requireBoolean({
    value: contentObject.registered,
    field: 'content.registered',
  });

  if (!registered) {
    return {
      kind: 'not_found',
    };
  }

  const mentorId = requireInteger({
    value: contentObject.mentorId,
    scope: 'my-mentor-settings-response',
    field: 'content.mentorId',
  });
  const settings = requireObject<MentorSettingsResponseDto>({
    value: contentObject.settings,
    scope: 'my-mentor-settings-response',
    field: 'content.settings',
  });
  const listVisibleFromRoot =
    contentObject.listVisible === null ||
    contentObject.listVisible === undefined
      ? undefined
      : requireBoolean({
          value: contentObject.listVisible,
          field: 'content.listVisible',
        });
  const publicReadiness =
    contentObject.publicReadiness === null ||
    contentObject.publicReadiness === undefined
      ? undefined
      : mapMentorPublicReadiness({
          value: contentObject.publicReadiness,
          scope: 'my-mentor-settings-response',
          field: 'content.publicReadiness',
        });
  const publicReadinessStage =
    normalizePublicReadinessStage(contentObject.publicReadinessStage) ??
    (publicReadiness ? toPublicReadinessStage(publicReadiness) : undefined);

  return {
    kind: 'found',
    mentorId,
    settings: toMentorSettingsFormValues(settings, listVisibleFromRoot),
    savedCoreKeywords: toMentorSavedCoreKeywordSnapshots(settings),
    publicReadinessStage,
    publicReadiness,
  };
};

const toSlotMinutes = (slot: string) => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(slot);
  if (!match) {
    return undefined;
  }

  return Number(match[1]) * 60 + Number(match[2]);
};

const toWeeklyRangesFromWeekly = (
  weekly: MentorRegistrationFormValues['schedule']['weekly'],
) => {
  const toRanges = (slots: string[]) => {
    const minutes = Array.from(
      new Set(
        slots
          .map((slot) => toSlotMinutes(slot))
          .filter((value): value is number => value !== undefined),
      ),
    ).sort((first, second) => first - second);

    if (minutes.length === 0) {
      return [];
    }

    const ranges: Array<{ start: string; end: string }> = [];
    let start = minutes[0];
    let previous = minutes[0];

    for (let index = 1; index < minutes.length; index += 1) {
      const current = minutes[index];
      if (current === previous + 30) {
        previous = current;
        continue;
      }

      ranges.push({
        start: toTimeString(start),
        end: toTimeString(previous + 30),
      });
      start = current;
      previous = current;
    }

    ranges.push({
      start: toTimeString(start),
      end: toTimeString(previous + 30),
    });

    return ranges;
  };

  return {
    mon: toRanges(weekly.MON),
    tue: toRanges(weekly.TUE),
    wed: toRanges(weekly.WED),
    thu: toRanges(weekly.THU),
    fri: toRanges(weekly.FRI),
    sat: toRanges(weekly.SAT),
    sun: toRanges(weekly.SUN),
  };
};

export const buildMentorSettingsUpsertRequest = ({
  values,
  registrationOptions,
  persistedPredefinedCoreKeywords = [],
}: {
  values: MentorRegistrationFormValues;
  registrationOptions: MentorRegistrationOptions;
  persistedPredefinedCoreKeywords?: ReadonlyArray<{
    code: string;
    label: string;
  }>;
}): MentorSettingsUpsertRequestDto => {
  const weekly = values.schedule.weekly;
  const weeklyRanges = toWeeklyRangesFromWeekly(weekly);
  const careerEntries = normalizeMentorCareerEntries(values.careerEntries);
  const preNotice = values.preNotice.trim();

  return {
    categories: values.categories,
    mentoringTitle: values.mentoringTitle,
    appealLine: values.appealLine,
    jobGroupCode: values.jobGroup,
    jobTitleCode: values.jobTitle,
    careerCode: values.careerYears,
    careerEntries: careerEntries.map((entry) => ({
      description: entry.description,
      isCurrent: entry.isCurrent,
      ...(entry.periodEnabled && entry.startMonth
        ? { startMonth: entry.startMonth }
        : {}),
      ...(entry.periodEnabled && entry.endMonth
        ? { endMonth: entry.endMonth }
        : {}),
    })),
    coreKeywords: buildMentorCoreKeywordRequests({
      profileKeywords: values.skillTags,
      registrationOptions,
      persistedPredefinedCoreKeywords,
    }),
    companyName: values.companyName.trim(),
    companyVisible: !values.hideCompanyName,
    listVisible: values.listVisible,
    methods: [
      {
        type: MENTORING_METHOD_REQUEST_TYPE_MAP.note,
        enabled: values.noteEnabled,
        price: values.notePrice,
      },
      {
        type: MENTORING_METHOD_REQUEST_TYPE_MAP.simple,
        enabled: values.simpleEnabled,
        price: values.simplePrice,
        durationMinutes: 15,
      },
      {
        type: MENTORING_METHOD_REQUEST_TYPE_MAP.deep,
        enabled: values.deepEnabled,
        price: values.deepPrice,
        durationMinutes: values.deepDurationMinutes,
      },
      {
        type: MENTORING_METHOD_REQUEST_TYPE_MAP.offline,
        enabled: values.offlineEnabled,
        price: values.offlinePrice,
        durationMinutes: values.offlineDurationMinutes,
      },
    ],
    schedule: {
      timezone: values.schedule.timezone,
      weekly: {
        mon: weekly.MON,
        tue: weekly.TUE,
        wed: weekly.WED,
        thu: weekly.THU,
        fri: weekly.FRI,
        sat: weekly.SAT,
        sun: weekly.SUN,
      },
      weeklyRanges,
    },
    detailedDescription: normalizeMentorMarkdownContent(
      values.detailedDescription,
    ),
    interviewQuestions: values.interviewQuestions,
    ...(preNotice.length > 0 ? { preNotice } : {}),
  };
};
