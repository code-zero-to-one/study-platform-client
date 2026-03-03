import { ApiError } from '@/api/client/api-error';
import { axiosInstance } from '@/api/client/axios';
import { createDefaultMentorSettings } from '@/features/mentoring/model/mentor-settings';
import type {
  MentorProfile,
  MentorSortType,
  MentoringMethodOption,
  MentoringMethodType,
} from '@/types/mentoring/domain';
import type { MentorRegistrationOptions } from '@/types/mentoring/registration-options';
import type { MentorSettings } from '@/types/mentoring/settings';
import type { MentorRegistrationFormValues } from '@/types/schemas/mentor-registration-schema';

interface ApiResponse<T> {
  statusCode?: number;
  timestamp?: string;
  content?: T;
  message?: string;
}

interface MentorMethodOptionResponseDto {
  type?: string;
  label?: string;
  durationLabel?: string;
  price?: number;
  description?: string;
  enabled?: boolean;
  requiresSchedule?: boolean;
  timeSlots?: string[];
}

interface MentorMethodsResponseDto {
  note?: MentorMethodOptionResponseDto;
  simple?: MentorMethodOptionResponseDto;
  inDepth?: MentorMethodOptionResponseDto;
  offline?: MentorMethodOptionResponseDto;
}

interface CodeLabelResponseDto {
  code?: string;
  label?: string;
}

interface CareerCodeLabelResponseDto extends CodeLabelResponseDto {
  minYears?: number;
  maxYears?: number;
}

interface CoreKeywordResponseDto extends CodeLabelResponseDto {
  jobGroupCodes?: string[];
  jobTitleCodes?: string[];
  displayOrder?: number;
  active?: boolean;
}

interface RegistrationOptionsJobGroupResponseDto extends CodeLabelResponseDto {
  displayOrder?: number;
  active?: boolean;
}

interface RegistrationOptionsJobTitleResponseDto extends CodeLabelResponseDto {
  jobGroupCode?: string;
  displayOrder?: number;
  active?: boolean;
}

interface RegistrationOptionsCareerResponseDto
  extends CareerCodeLabelResponseDto {
  displayOrder?: number;
  active?: boolean;
}

interface RegistrationOptionsResponseDto {
  maxCoreKeywordCount?: number;
  jobGroups?: RegistrationOptionsJobGroupResponseDto[];
  jobTitles?: RegistrationOptionsJobTitleResponseDto[];
  careers?: RegistrationOptionsCareerResponseDto[];
  coreKeywords?: CoreKeywordResponseDto[];
}

interface IdentityResponseDto {
  nickname?: string;
  career?: string;
  company?: string;
  imageUrl?: string;
}

interface StatsResponseDto {
  rating?: number;
  reviewCount?: number;
  mentoringCount?: number;
  menteeCount?: number;
}

interface IntroductionResponseDto {
  tags?: string[];
  careerHistory?: string[];
  strengths?: string[];
}

interface CompanyResponseDto {
  category?: string;
  name?: string;
  hideCompanyName?: boolean;
}

interface ProfileResponseDto {
  categories?: string[];
  mentoringTitle?: string;
  appealLine?: string;
  jobGroup?: string | CodeLabelResponseDto;
  jobGroupCode?: string;
  jobTitle?: string | CodeLabelResponseDto;
  jobTitleCode?: string;
  career?: string | CareerCodeLabelResponseDto;
  careerCode?: string;
  careerYears?: string;
  coreKeywords?: Array<string | CodeLabelResponseDto>;
  coreKeywordCodes?: string[];
  skillTags?: string[];
  company?: CompanyResponseDto;
}

interface ContentResponseDto {
  detailedDescription?: string;
  interviewQuestions?: string[];
  preNotice?: string;
}

interface MentorSettingsBoundaryResponseDto {
  mentoringTitle?: string;
  profile?: ProfileResponseDto;
  content?: ContentResponseDto;
  metadata?: MetadataResponseDto;
}

interface MentorReviewResponseDto {
  id?: number | string;
  authorName?: string;
  rating?: number;
  createdAt?: string;
  content?: string;
  method?: string;
}

interface MentorProfileResponseDto {
  id?: number;
  summary?: string;
  role?: string;
  career?: string;
  company?: string;
  identity?: IdentityResponseDto;
  stats?: StatsResponseDto;
  introduction?: IntroductionResponseDto;
  profile?: ProfileResponseDto;
  methods?: MentorMethodsResponseDto;
  reviews?: MentorReviewResponseDto[];
  mentorSettings?: MentorSettingsBoundaryResponseDto;
}

interface MentorListResponseDto {
  mentors?: MentorProfileResponseDto[];
}

interface MentorDetailResponseDto {
  mentor?: MentorProfileResponseDto;
}

interface ContactResponseDto {
  email?: string;
}

interface MethodResponseDto {
  type?: string;
  enabled?: boolean;
  price?: number;
  durationMinutes?: number;
}

interface WeeklyResponseDto {
  MON?: string[];
  TUE?: string[];
  WED?: string[];
  THU?: string[];
  FRI?: string[];
  SAT?: string[];
  SUN?: string[];
  mon?: string[];
  tue?: string[];
  wed?: string[];
  thu?: string[];
  fri?: string[];
  sat?: string[];
  sun?: string[];
}

interface ScheduleResponseDto {
  timezone?: string;
  slotUnitMinutes?: number;
  weekly?: WeeklyResponseDto;
}

interface MetadataResponseDto {
  updatedAt?: string;
}

interface MentoringPolicyResponseDto {
  maxParticipants?: number;
}

interface MentorSettingsResponseDto {
  contact?: ContactResponseDto;
  profile?: ProfileResponseDto;
  policy?: MentoringPolicyResponseDto;
  methods?: MethodResponseDto[];
  schedule?: ScheduleResponseDto;
  content?: ContentResponseDto;
  metadata?: MetadataResponseDto;
}

interface MyMentorSettingsResponseDto {
  mentorId?: number;
  settings?: MentorSettingsResponseDto;
}

interface MentorUpsertResponseDto {
  mentorId?: number;
  created?: boolean;
  updatedAt?: string;
}

interface MentorIntroImageUploadUrlResponseDto {
  uploadUrl?: string;
  publicUrl?: string;
}

interface MentorMethodRequestDto {
  type: 'NOTE' | 'SIMPLE' | 'IN_DEPTH' | 'OFFLINE';
  enabled: boolean;
  price: number;
  durationMinutes?: number;
}

interface MentorWeeklyRequestDto {
  mon: string[];
  tue: string[];
  wed: string[];
  thu: string[];
  fri: string[];
  sat: string[];
  sun: string[];
}

interface MentorSettingsUpsertRequestDto {
  contactEmail: string;
  categories: string[];
  mentoringTitle: string;
  appealLine: string;
  jobGroupCode: string;
  jobTitleCode: string;
  careerCode: string;
  coreKeywordCodes: string[];
  companyCategory: string;
  companyName: string;
  hideCompanyName: boolean;
  maxParticipants: number;
  methods: MentorMethodRequestDto[];
  schedule: {
    timezone: string;
    slotUnitMinutes: number;
    weekly: MentorWeeklyRequestDto;
  };
  detailedDescription: string;
  interviewQuestions: string[];
  preNotice: string;
}

type MentorApiContractScope =
  | 'mentor-registration-options-response'
  | 'mentor-list-response'
  | 'mentor-detail-response'
  | 'my-mentor-settings-response';

export class MentorApiContractError extends Error {
  public readonly code = 'MENTOR_API_CONTRACT_ERROR';
  public readonly scope: MentorApiContractScope;
  public readonly causeData?: unknown;

  public constructor({
    scope,
    message,
    causeData,
  }: {
    scope: MentorApiContractScope;
    message: string;
    causeData?: unknown;
  }) {
    super(message);
    this.name = 'MentorApiContractError';
    this.scope = scope;
    this.causeData = causeData;
  }
}

const toContractError = ({
  scope,
  field,
  causeData,
}: {
  scope: MentorApiContractScope;
  field: string;
  causeData?: unknown;
}) => {
  return new MentorApiContractError({
    scope,
    message: `멘토 API 응답 계약이 올바르지 않습니다. (${field})`,
    causeData,
  });
};

const requireObject = <T extends object>({
  value,
  scope,
  field,
}: {
  value: unknown;
  scope: MentorApiContractScope;
  field: string;
}): T => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw toContractError({
      scope,
      field,
      causeData: value,
    });
  }

  return value as T;
};

const requireArray = <T>({
  value,
  scope,
  field,
}: {
  value: unknown;
  scope: MentorApiContractScope;
  field: string;
}): T[] => {
  if (!Array.isArray(value)) {
    throw toContractError({
      scope,
      field,
      causeData: value,
    });
  }

  return value as T[];
};

const requireInteger = ({
  value,
  scope,
  field,
}: {
  value: unknown;
  scope: MentorApiContractScope;
  field: string;
}) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw toContractError({
      scope,
      field,
      causeData: value,
    });
  }

  return Math.trunc(value);
};

const requireNonEmptyString = ({
  value,
  scope,
  field,
}: {
  value: unknown;
  scope: MentorApiContractScope;
  field: string;
}) => {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized) {
    throw toContractError({
      scope,
      field,
      causeData: value,
    });
  }

  return normalized;
};

export interface MyMentorSettingsFoundResult {
  kind: 'found';
  mentorId: number;
  settings: MentorRegistrationFormValues;
}

export interface MyMentorSettingsNotFoundResult {
  kind: 'not_found';
}

export type MyMentorSettingsResult =
  | MyMentorSettingsFoundResult
  | MyMentorSettingsNotFoundResult;

const METHOD_ORDER: MentoringMethodType[] = [
  'note',
  'simple',
  'deep',
  'offline',
];

const METHOD_LABEL_MAP: Record<MentoringMethodType, string> = {
  note: '쪽지상담',
  simple: '간편상담',
  deep: '심층상담',
  offline: '대면상담',
};

const METHOD_DEFAULT_DURATION: Record<MentoringMethodType, number> = {
  note: 0,
  simple: 15,
  deep: 60,
  offline: 60,
};

const METHOD_REQUEST_TYPE_MAP: Record<
  MentoringMethodType,
  MentorMethodRequestDto['type']
> = {
  note: 'NOTE',
  simple: 'SIMPLE',
  deep: 'IN_DEPTH',
  offline: 'OFFLINE',
};

const METHOD_RESPONSE_TYPE_MAP: Record<string, MentoringMethodType> = {
  NOTE: 'note',
  SIMPLE: 'simple',
  IN_DEPTH: 'deep',
  OFFLINE: 'offline',
  DEEP: 'deep',
  note: 'note',
  simple: 'simple',
  in_depth: 'deep',
  inDepth: 'deep',
  deep: 'deep',
  offline: 'offline',
};

const COMPANY_CATEGORY_SET = new Set(['네카라쿠배', 'IT 유니콘', '창업', '기타']);

const IMAGE_EXTENSION_MAP: Record<string, string> = {
  jpg: 'JPG',
  jpeg: 'JPEG',
  png: 'PNG',
  gif: 'GIF',
  webp: 'WEBP',
  svg: 'SVG',
};

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

  return value
    .map(toTrimmedString)
    .filter((item) => item.length > 0);
};

const toCodeFromCodeLabel = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (value && typeof value === 'object') {
    return toTrimmedString((value as CodeLabelResponseDto).code);
  }

  return '';
};

const toLabelFromCodeLabel = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (value && typeof value === 'object') {
    return (
      toTrimmedString((value as CodeLabelResponseDto).label) ||
      toTrimmedString((value as CodeLabelResponseDto).code)
    );
  }

  return '';
};

const toCodeLabelCodeArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => toCodeFromCodeLabel(item))
    .filter((item) => item.length > 0);
};

const toCodeLabelLabelArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => toLabelFromCodeLabel(item))
    .filter((item) => item.length > 0);
};

const toCareerLabel = (profile: ProfileResponseDto | undefined): string => {
  const careerFromObject = toLabelFromCodeLabel(profile?.career);
  if (careerFromObject) {
    return careerFromObject;
  }

  return toTrimmedString(profile?.careerYears);
};

const toCareerCode = (profile: ProfileResponseDto | undefined): string => {
  const careerCode = toCodeFromCodeLabel(profile?.career);
  if (careerCode) {
    return careerCode;
  }

  return toTrimmedString(profile?.careerCode);
};

const toMethodType = (value: unknown): MentoringMethodType | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  return METHOD_RESPONSE_TYPE_MAP[value] ?? METHOD_RESPONSE_TYPE_MAP[value.toUpperCase()];
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

const normalizeCompanyCategory = (value: unknown): MentorSettings['companyCategory'] => {
  if (typeof value !== 'string') {
    return '기타';
  }

  return COMPANY_CATEGORY_SET.has(value)
    ? (value as MentorSettings['companyCategory'])
    : '기타';
};

const normalizeMethodOption = ({
  methodType,
  source,
}: {
  methodType: MentoringMethodType;
  source?: MentorMethodOptionResponseDto;
}): MentoringMethodOption => {
  const rawDurationMinutes =
    typeof source?.durationLabel === 'string'
      ? Number(source.durationLabel.replace(/\D/g, ''))
      : undefined;
  const durationMinutes =
    rawDurationMinutes && Number.isFinite(rawDurationMinutes)
      ? rawDurationMinutes
      : METHOD_DEFAULT_DURATION[methodType];
  const durationLabel =
    methodType === 'note' ? '비동기' : `${durationMinutes}분`;

  return {
    type: methodType,
    label: toTrimmedString(source?.label) || METHOD_LABEL_MAP[methodType],
    durationLabel,
    price:
      typeof source?.price === 'number' && Number.isFinite(source.price)
        ? source.price
        : 0,
    description: toTrimmedString(source?.description),
    enabled: source?.enabled === true,
    requiresSchedule:
      methodType !== 'note'
        ? true
        : source?.requiresSchedule === true,
    timeSlots: methodType === 'note' ? [] : toStringArray(source?.timeSlots),
  };
};

const toMentorMethodsFromObject = (source: MentorMethodsResponseDto | undefined) => {
  return {
    note: normalizeMethodOption({
      methodType: 'note',
      source: source?.note,
    }),
    simple: normalizeMethodOption({
      methodType: 'simple',
      source: source?.simple,
    }),
    deep: normalizeMethodOption({
      methodType: 'deep',
      source: source?.inDepth,
    }),
    offline: normalizeMethodOption({
      methodType: 'offline',
      source: source?.offline,
    }),
  } satisfies Record<MentoringMethodType, MentoringMethodOption>;
};

const toMentorMethodsFromArray = (
  source: MethodResponseDto[] | undefined,
) => {
  const methodMap = new Map<MentoringMethodType, MethodResponseDto>();

  source?.forEach((method) => {
    const methodType = toMethodType(method.type);
    if (!methodType) {
      return;
    }

    methodMap.set(methodType, method);
  });

  return METHOD_ORDER.reduce<Record<MentoringMethodType, MentoringMethodOption>>(
    (accumulator, methodType) => {
      const method = methodMap.get(methodType);
      const durationMinutes =
        methodType === 'simple'
          ? 15
          : toDurationMinutes(method?.durationMinutes, methodType === 'offline' ? 60 : 60);

      accumulator[methodType] = {
        type: methodType,
        label: METHOD_LABEL_MAP[methodType],
        durationLabel: methodType === 'note' ? '비동기' : `${durationMinutes}분`,
        price:
          typeof method?.price === 'number' && Number.isFinite(method.price)
            ? method.price
            : 0,
        description: '',
        enabled: method?.enabled === true,
        requiresSchedule: methodType !== 'note',
        timeSlots: [],
      };

      return accumulator;
    },
    {
      note: {} as MentoringMethodOption,
      simple: {} as MentoringMethodOption,
      deep: {} as MentoringMethodOption,
      offline: {} as MentoringMethodOption,
    },
  );
};

const toWeeklySchedule = (source: WeeklyResponseDto | undefined) => {
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

const toMentorSettingsFromBoundary = ({
  boundary,
  methods,
}: {
  boundary: MentorSettingsBoundaryResponseDto | undefined;
  methods: Record<MentoringMethodType, MentoringMethodOption>;
}): MentorSettings => {
  const defaults = createDefaultMentorSettings();
  const profile = boundary?.profile;
  const content = boundary?.content;
  const company = profile?.company;
  const keywordLabels = toCodeLabelLabelArray(profile?.coreKeywords);

  return {
    ...defaults,
    categories: toStringArray(profile?.categories),
    mentoringTitle:
      toTrimmedString(profile?.mentoringTitle) ||
      toTrimmedString(boundary?.mentoringTitle),
    appealLine: toTrimmedString(profile?.appealLine),
    jobGroup: toLabelFromCodeLabel(profile?.jobGroup),
    jobTitle: toLabelFromCodeLabel(profile?.jobTitle),
    careerYears: toCareerLabel(profile),
    skillTags:
      keywordLabels.length > 0
        ? keywordLabels
        : toStringArray(profile?.skillTags),
    companyCategory: normalizeCompanyCategory(company?.category),
    companyName: toTrimmedString(company?.name),
    hideCompanyName: company?.hideCompanyName === true,
    noteEnabled: methods.note.enabled === true,
    notePrice: methods.note.price,
    simpleEnabled: methods.simple.enabled === true,
    simplePrice: methods.simple.price,
    deepEnabled: methods.deep.enabled === true,
    deepPrice: methods.deep.price,
    deepDurationMinutes: toDurationMinutes(
      Number(methods.deep.durationLabel.replace(/\D/g, '')) || 60,
      60,
    ),
    offlineEnabled: methods.offline.enabled === true,
    offlinePrice: methods.offline.price,
    offlineDurationMinutes: toDurationMinutes(
      Number(methods.offline.durationLabel.replace(/\D/g, '')) || 60,
      60,
    ),
    detailedDescription: toTrimmedString(content?.detailedDescription),
    interviewQuestions: toStringArray(content?.interviewQuestions),
    preNotice: toTrimmedString(content?.preNotice),
    updatedAt:
      toTrimmedString(boundary?.metadata?.updatedAt) || new Date().toISOString(),
  };
};

const toMentorReview = (review: MentorReviewResponseDto) => {
  return {
    id: review.id ?? '',
    authorName: toTrimmedString(review.authorName) || '익명',
    rating: typeof review.rating === 'number' ? review.rating : 0,
    createdAt: toTrimmedString(review.createdAt),
    content: toTrimmedString(review.content),
    method: toMethodType(review.method) ?? 'note',
  };
};

const toMentorProfile = ({
  source,
  scope,
}: {
  source: MentorProfileResponseDto;
  scope: 'mentor-list-response' | 'mentor-detail-response';
}): MentorProfile => {
  const mentorId = requireInteger({
    value: source.id,
    scope,
    field: 'mentor.id',
  });
  const methods = toMentorMethodsFromObject(source.methods);
  const profile = source.profile ?? source.mentorSettings?.profile;
  const boundary: MentorSettingsBoundaryResponseDto = {
    ...(source.mentorSettings ?? {}),
    profile,
  };
  const settings = toMentorSettingsFromBoundary({
    boundary,
    methods,
  });
  const keywordLabels = toCodeLabelLabelArray(profile?.coreKeywords);
  const tags = Array.from(
    new Set([
      ...keywordLabels,
      ...toStringArray(settings.skillTags),
      ...toStringArray(source.introduction?.tags),
    ]),
  );
  const companyLabel =
    settings.hideCompanyName
      ? '비공개'
      : settings.companyName || toTrimmedString(source.company);

  return {
    id: mentorId,
    nickname: toTrimmedString(source.identity?.nickname),
    role:
      toTrimmedString(source.role) ||
      [settings.jobGroup, settings.jobTitle]
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
        .join(' · '),
    career:
      toTrimmedString(source.career) ||
      settings.careerYears ||
      toCareerLabel(profile),
    company: companyLabel,
    rating:
      typeof source.stats?.rating === 'number' ? source.stats.rating : 0,
    reviewCount:
      typeof source.stats?.reviewCount === 'number' ? source.stats.reviewCount : 0,
    mentoringCount:
      typeof source.stats?.mentoringCount === 'number'
        ? source.stats.mentoringCount
        : 0,
    menteeCount:
      typeof source.stats?.menteeCount === 'number'
        ? source.stats.menteeCount
        : undefined,
    tags,
    summary: toTrimmedString(source.summary) || settings.appealLine,
    bio: settings.detailedDescription,
    careerHistory: toStringArray(source.introduction?.careerHistory),
    strengths: toStringArray(source.introduction?.strengths),
    imageUrl: toTrimmedString(source.identity?.imageUrl) || undefined,
    methods,
    reviews: (source.reviews ?? []).map(toMentorReview),
    mentorSettings: settings,
  };
};

const toMentorSettingsFormValues = (
  source: MentorSettingsResponseDto | undefined,
): MentorRegistrationFormValues => {
  const defaults = createDefaultMentorSettings();
  const methods = toMentorMethodsFromArray(source?.methods);
  const profile = source?.profile;
  const company = profile?.company;
  const content = source?.content;
  const coreKeywordCodeArray = toStringArray(profile?.coreKeywordCodes);
  const coreKeywordCodes =
    coreKeywordCodeArray.length > 0
      ? coreKeywordCodeArray
      : toCodeLabelCodeArray(profile?.coreKeywords);

  return {
    ...defaults,
    contactEmail: toTrimmedString(source?.contact?.email),
    categories: toStringArray(profile?.categories),
    mentoringTitle: toTrimmedString(profile?.mentoringTitle),
    appealLine: toTrimmedString(profile?.appealLine),
    jobGroup: toCodeFromCodeLabel(profile?.jobGroup) || toTrimmedString(profile?.jobGroupCode),
    jobTitle: toCodeFromCodeLabel(profile?.jobTitle) || toTrimmedString(profile?.jobTitleCode),
    careerYears: toCareerCode(profile),
    skillTags:
      coreKeywordCodes.length > 0
        ? coreKeywordCodes
        : toStringArray(profile?.skillTags),
    companyCategory: normalizeCompanyCategory(company?.category),
    companyName: toTrimmedString(company?.name),
    hideCompanyName: company?.hideCompanyName === true,
    maxParticipants:
      typeof source?.policy?.maxParticipants === 'number'
        ? source.policy.maxParticipants
        : defaults.maxParticipants,
    noteEnabled: methods.note.enabled === true,
    notePrice: methods.note.price,
    simpleEnabled: methods.simple.enabled === true,
    simplePrice: methods.simple.price,
    deepEnabled: methods.deep.enabled === true,
    deepPrice: methods.deep.price,
    deepDurationMinutes: toDurationMinutes(
      Number(methods.deep.durationLabel.replace(/\D/g, '')) || 60,
      60,
    ),
    offlineEnabled: methods.offline.enabled === true,
    offlinePrice: methods.offline.price,
    offlineDurationMinutes: toDurationMinutes(
      Number(methods.offline.durationLabel.replace(/\D/g, '')) || 60,
      60,
    ),
    schedule: {
      timezone: 'Asia/Seoul',
      slotUnitMinutes: 30,
      weekly: toWeeklySchedule(source?.schedule?.weekly),
    },
    detailedDescription: toTrimmedString(content?.detailedDescription),
    interviewQuestions: toStringArray(content?.interviewQuestions),
    preNotice: toTrimmedString(content?.preNotice),
    updatedAt:
      toTrimmedString(source?.metadata?.updatedAt) || new Date().toISOString(),
    settlementDraft: null,
  };
};

const toMentorSettingsUpsertRequest = (
  values: MentorRegistrationFormValues,
): MentorSettingsUpsertRequestDto => {
  const weekly = values.schedule.weekly;

  return {
    contactEmail: values.contactEmail,
    categories: values.categories,
    mentoringTitle: values.mentoringTitle,
    appealLine: values.appealLine,
    jobGroupCode: values.jobGroup,
    jobTitleCode: values.jobTitle,
    careerCode: values.careerYears,
    coreKeywordCodes: values.skillTags,
    companyCategory: values.companyCategory,
    companyName: values.companyName,
    hideCompanyName: values.hideCompanyName,
    maxParticipants: values.maxParticipants,
    methods: [
      {
        type: METHOD_REQUEST_TYPE_MAP.note,
        enabled: values.noteEnabled,
        price: values.notePrice,
      },
      {
        type: METHOD_REQUEST_TYPE_MAP.simple,
        enabled: values.simpleEnabled,
        price: values.simplePrice,
        durationMinutes: 15,
      },
      {
        type: METHOD_REQUEST_TYPE_MAP.deep,
        enabled: values.deepEnabled,
        price: values.deepPrice,
        durationMinutes: values.deepDurationMinutes,
      },
      {
        type: METHOD_REQUEST_TYPE_MAP.offline,
        enabled: values.offlineEnabled,
        price: values.offlinePrice,
        durationMinutes: values.offlineDurationMinutes,
      },
    ],
    schedule: {
      timezone: values.schedule.timezone,
      slotUnitMinutes: values.schedule.slotUnitMinutes,
      weekly: {
        mon: weekly.MON,
        tue: weekly.TUE,
        wed: weekly.WED,
        thu: weekly.THU,
        fri: weekly.FRI,
        sat: weekly.SAT,
        sun: weekly.SUN,
      },
    },
    detailedDescription: values.detailedDescription,
    interviewQuestions: values.interviewQuestions,
    preNotice: values.preNotice,
  };
};

const normalizeSortType = (sortType: MentorSortType | undefined) => {
  if (!sortType || sortType === 'default') {
    return undefined;
  }

  return sortType;
};

const toImageExtension = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase().trim();
  if (!extension) {
    return 'DEFAULT';
  }

  return IMAGE_EXTENSION_MAP[extension] ?? 'DEFAULT';
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

const toRegistrationOptions = (
  source: RegistrationOptionsResponseDto,
): MentorRegistrationOptions => {
  const scope: MentorApiContractScope = 'mentor-registration-options-response';
  const maxCoreKeywordCount = requireInteger({
    value: source.maxCoreKeywordCount,
    scope,
    field: 'content.maxCoreKeywordCount',
  });

  if (maxCoreKeywordCount <= 0) {
    throw toContractError({
      scope,
      field: 'content.maxCoreKeywordCount',
      causeData: source.maxCoreKeywordCount,
    });
  }

  const jobGroupsSource = requireArray<RegistrationOptionsJobGroupResponseDto>({
    value: source.jobGroups,
    scope,
    field: 'content.jobGroups',
  });
  const jobTitlesSource = requireArray<RegistrationOptionsJobTitleResponseDto>({
    value: source.jobTitles,
    scope,
    field: 'content.jobTitles',
  });
  const careersSource = requireArray<RegistrationOptionsCareerResponseDto>({
    value: source.careers,
    scope,
    field: 'content.careers',
  });
  const coreKeywordsSource = requireArray<CoreKeywordResponseDto>({
    value: source.coreKeywords,
    scope,
    field: 'content.coreKeywords',
  });

  const jobGroups = toSortedByDisplayOrder(
    jobGroupsSource.map((item, index) => {
      const code = requireNonEmptyString({
        value: item.code,
        scope,
        field: `content.jobGroups[${index}].code`,
      });
      const label = requireNonEmptyString({
        value: item.label,
        scope,
        field: `content.jobGroups[${index}].label`,
      });
      const displayOrder = requireInteger({
        value: item.displayOrder,
        scope,
        field: `content.jobGroups[${index}].displayOrder`,
      });

      return {
        code,
        label,
        displayOrder,
        active: item.active !== false,
      };
    }),
  );

  const jobTitles = toSortedByDisplayOrder(
    jobTitlesSource.map((item, index) => {
      const code = requireNonEmptyString({
        value: item.code,
        scope,
        field: `content.jobTitles[${index}].code`,
      });
      const label = requireNonEmptyString({
        value: item.label,
        scope,
        field: `content.jobTitles[${index}].label`,
      });
      const jobGroupCode = requireNonEmptyString({
        value: item.jobGroupCode,
        scope,
        field: `content.jobTitles[${index}].jobGroupCode`,
      });
      const displayOrder = requireInteger({
        value: item.displayOrder,
        scope,
        field: `content.jobTitles[${index}].displayOrder`,
      });

      return {
        code,
        label,
        jobGroupCode,
        displayOrder,
        active: item.active !== false,
      };
    }),
  );

  const careers = toSortedByDisplayOrder(
    careersSource.map((item, index) => {
      const code = requireNonEmptyString({
        value: item.code,
        scope,
        field: `content.careers[${index}].code`,
      });
      const label = requireNonEmptyString({
        value: item.label,
        scope,
        field: `content.careers[${index}].label`,
      });
      const displayOrder = requireInteger({
        value: item.displayOrder,
        scope,
        field: `content.careers[${index}].displayOrder`,
      });
      const minYears = requireInteger({
        value: item.minYears,
        scope,
        field: `content.careers[${index}].minYears`,
      });
      const maxYears =
        item.maxYears === undefined
          ? undefined
          : requireInteger({
              value: item.maxYears,
              scope,
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
    }),
  );

  const coreKeywords = toSortedByDisplayOrder(
    coreKeywordsSource.map((item, index) => {
      const code = requireNonEmptyString({
        value: item.code,
        scope,
        field: `content.coreKeywords[${index}].code`,
      });
      const label = requireNonEmptyString({
        value: item.label,
        scope,
        field: `content.coreKeywords[${index}].label`,
      });
      const displayOrder = requireInteger({
        value: item.displayOrder,
        scope,
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
    }),
  );

  return {
    maxCoreKeywordCount,
    jobGroups,
    jobTitles,
    careers,
    coreKeywords,
  };
};

export const getMentorRegistrationOptions = async () => {
  const response = await axiosInstance.get<ApiResponse<RegistrationOptionsResponseDto>>(
    '/mentors/registration/options',
  );
  const content = requireObject<RegistrationOptionsResponseDto>({
    value: response.data.content,
    scope: 'mentor-registration-options-response',
    field: 'content',
  });

  return toRegistrationOptions(content);
};

export const getMentorList = async ({
  keyword,
  sortType,
}: {
  keyword?: string;
  sortType?: MentorSortType;
} = {}) => {
  const response = await axiosInstance.get<ApiResponse<MentorListResponseDto>>(
    '/mentors',
    {
      params: {
        keyword: keyword?.trim() || undefined,
        sortType: normalizeSortType(sortType),
      },
    },
  );
  const content = requireObject<MentorListResponseDto>({
    value: response.data.content,
    scope: 'mentor-list-response',
    field: 'content',
  });
  const mentors = requireArray<MentorProfileResponseDto>({
    value: content.mentors,
    scope: 'mentor-list-response',
    field: 'content.mentors',
  });

  return mentors.map((mentor) =>
    toMentorProfile({
      source: mentor,
      scope: 'mentor-list-response',
    }),
  );
};

export const getMentorDetail = async (mentorId: number) => {
  const response = await axiosInstance.get<ApiResponse<MentorDetailResponseDto>>(
    `/mentors/${mentorId}`,
  );
  const content = requireObject<MentorDetailResponseDto>({
    value: response.data.content,
    scope: 'mentor-detail-response',
    field: 'content',
  });
  const mentor = requireObject<MentorProfileResponseDto>({
    value: content.mentor,
    scope: 'mentor-detail-response',
    field: 'content.mentor',
  });

  return toMentorProfile({
    source: mentor,
    scope: 'mentor-detail-response',
  });
};

export const getMyMentorSettings = async (): Promise<MyMentorSettingsResult> => {
  try {
    const response = await axiosInstance.get<ApiResponse<MyMentorSettingsResponseDto>>(
      '/mentors/me',
    );
    const content = requireObject<MyMentorSettingsResponseDto>({
      value: response.data.content,
      scope: 'my-mentor-settings-response',
      field: 'content',
    });
    const mentorId = requireInteger({
      value: content.mentorId,
      scope: 'my-mentor-settings-response',
      field: 'content.mentorId',
    });
    const settings = requireObject<MentorSettingsResponseDto>({
      value: content.settings,
      scope: 'my-mentor-settings-response',
      field: 'content.settings',
    });

    return {
      kind: 'found',
      mentorId,
      settings: toMentorSettingsFormValues(settings),
    };
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return {
        kind: 'not_found',
      };
    }

    throw error;
  }
};

export const upsertMyMentorSettings = async (
  values: MentorRegistrationFormValues,
) => {
  const payload = toMentorSettingsUpsertRequest(values);
  const response = await axiosInstance.put<ApiResponse<MentorUpsertResponseDto>>(
    '/mentors/me',
    payload,
  );
  const content = response.data.content;

  if (!content || typeof content.mentorId !== 'number') {
    throw new Error('멘토 설정 저장 응답이 올바르지 않습니다.');
  }

  return {
    mentorId: content.mentorId,
    created: content.created === true,
    updatedAt: toTrimmedString(content.updatedAt),
  };
};

export const getMentorIntroImageUploadTicket = async ({
  fileName,
}: {
  fileName: string;
}) => {
  const response = await axiosInstance.post<
    ApiResponse<MentorIntroImageUploadUrlResponseDto>
  >('/mentors/me/intro-images/upload-url', undefined, {
    params: {
      extension: toImageExtension(fileName),
    },
  });

  const uploadUrl = toTrimmedString(response.data.content?.uploadUrl);
  const publicUrl = toTrimmedString(response.data.content?.publicUrl);

  if (!uploadUrl || !publicUrl) {
    throw new Error('이미지 업로드 URL 응답 형식이 올바르지 않습니다.');
  }

  return {
    uploadUrl,
    publicUrl,
  };
};
