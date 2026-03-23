import {
  createDefaultMentorSettings,
  normalizeMentorCareerEntries,
} from '@/features/mentoring/model/mentor-settings';
import { parseMentoringMethodType } from '@/features/mentoring/model/mentoring-method';
import type {
  MentorProfile,
  MentoringMethodOption,
  MentoringMethodType,
} from '@/types/mentoring/domain';
import { normalizeMentorMarkdownContent } from '@/types/mentoring/markdown';
import type { MentorSettings } from '@/types/mentoring/settings';
import {
  type MentorApiContractScope,
  requireInteger,
  requireNonEmptyString,
  requireObject,
  toContractError,
} from './mentor-api-contract';
import {
  type CodeLabelResponseDto,
  type MentorMethodsResponseDto,
  type MentorProfileResponseDto,
  type MentorReviewResponseDto,
  type MentorSettingsBoundaryResponseDto,
  type IdentityResponseDto,
  type ProfileResponseDto,
} from './mentor-api.types';
import { requireMentorCoreKeywordLabels } from './mentor-core-keyword-contract';

const COMPANY_CATEGORY_SET = new Set([
  '네카라쿠배',
  'IT 유니콘',
  '창업',
  '기타',
]);

const MENTOR_ASSET_BASE_URL = (
  process.env.NEXT_PUBLIC_API_PROD_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  ''
).replace(/\/api\/v1\/?$/, '');

const toTrimmedString = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const toMentorImageUrl = (value: unknown): string | undefined => {
  const imageUrl = toTrimmedString(value);

  if (!imageUrl || imageUrl.toUpperCase() === 'LOCAL') {
    return undefined;
  }

  if (
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://') ||
    imageUrl.startsWith('blob:') ||
    imageUrl.startsWith('data:')
  ) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/images/') && MENTOR_ASSET_BASE_URL) {
    return `${MENTOR_ASSET_BASE_URL}${imageUrl}`;
  }

  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  if (MENTOR_ASSET_BASE_URL) {
    return `${MENTOR_ASSET_BASE_URL}/${imageUrl.replace(/^\/+/, '')}`;
  }

  return imageUrl;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(toTrimmedString).filter((item) => item.length > 0);
};

const toOptionalObject = <T extends object>(value: unknown): T | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  return value as T;
};

const requireCodeLabel = ({
  value,
  scope,
  field,
}: {
  value: unknown;
  scope: Extract<
    MentorApiContractScope,
    'mentor-list-response' | 'mentor-detail-response'
  >;
  field: string;
}) => {
  const codeLabel = requireObject<CodeLabelResponseDto>({
    value,
    scope,
    field,
  });

  return {
    code: requireNonEmptyString({
      value: codeLabel.code,
      scope,
      field: `${field}.code`,
    }),
    label: requireNonEmptyString({
      value: codeLabel.label,
      scope,
      field: `${field}.label`,
    }),
  };
};

const requireBooleanValue = ({
  value,
  scope,
  field,
}: {
  value: unknown;
  scope: Extract<
    MentorApiContractScope,
    'mentor-list-response' | 'mentor-detail-response'
  >;
  field: string;
}) => {
  if (typeof value !== 'boolean') {
    throw toContractError({
      scope,
      field,
      causeData: value,
    });
  }

  return value;
};

const requireNonNegativePrice = ({
  value,
  scope,
  field,
}: {
  value: unknown;
  scope: Extract<
    MentorApiContractScope,
    'mentor-list-response' | 'mentor-detail-response'
  >;
  field: string;
}) => {
  const price = requireInteger({
    value,
    scope,
    field,
  });

  if (price < 0) {
    throw toContractError({
      scope,
      field,
      causeData: value,
    });
  }

  return price;
};

const normalizeCompanyCategory = (
  value: unknown,
): MentorSettings['companyCategory'] => {
  if (typeof value !== 'string') {
    return '기타';
  }

  return COMPANY_CATEGORY_SET.has(value)
    ? (value as MentorSettings['companyCategory'])
    : '기타';
};

const normalizePublicReadinessStage = (
  value: unknown,
): MentorProfile['publicReadinessStage'] => {
  return value === 'DETAIL_PREPARING' ||
    value === 'APPLY_PREPARING' ||
    value === 'APPLY_READY'
    ? value
    : undefined;
};

const normalizeMethodOption = ({
  methodType,
  source,
  scope,
  field,
}: {
  methodType: MentoringMethodType;
  source: MentorMethodsResponseDto[keyof MentorMethodsResponseDto];
  scope: Extract<
    MentorApiContractScope,
    'mentor-list-response' | 'mentor-detail-response'
  >;
  field: string;
}): MentoringMethodOption => {
  const methodSource = requireObject<NonNullable<typeof source>>({
    value: source,
    scope,
    field,
  });
  const durationLabel = (() => {
    if (methodType === 'note') {
      return '비동기';
    }

    const sourceDurationLabel = requireNonEmptyString({
      value: methodSource.durationLabel,
      scope,
      field: `${field}.durationLabel`,
    });
    const durationMinutes = Number(sourceDurationLabel.replace(/\D/g, ''));
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      throw toContractError({
        scope,
        field: `${field}.durationLabel`,
        causeData: methodSource.durationLabel,
      });
    }

    return `${durationMinutes}분`;
  })();

  return {
    type: methodType,
    label: requireNonEmptyString({
      value: methodSource.label,
      scope,
      field: `${field}.label`,
    }),
    durationLabel,
    price: requireNonNegativePrice({
      value: methodSource.price,
      scope,
      field: `${field}.price`,
    }),
    description: toTrimmedString(methodSource.description),
    enabled: requireBooleanValue({
      value: methodSource.enabled,
      scope,
      field: `${field}.enabled`,
    }),
    requiresSchedule: methodType !== 'note',
    timeSlots:
      methodType === 'note' ? [] : toStringArray(methodSource.timeSlots),
  };
};

const toMentorMethodsFromObject = (
  source: MentorMethodsResponseDto,
  scope: Extract<
    MentorApiContractScope,
    'mentor-list-response' | 'mentor-detail-response'
  >,
) => {
  return {
    note: normalizeMethodOption({
      methodType: 'note',
      source: source.note,
      scope,
      field: 'mentor.methods.note',
    }),
    simple: normalizeMethodOption({
      methodType: 'simple',
      source: source.simple,
      scope,
      field: 'mentor.methods.simple',
    }),
    deep: normalizeMethodOption({
      methodType: 'deep',
      source: source.inDepth,
      scope,
      field: 'mentor.methods.inDepth',
    }),
    offline: normalizeMethodOption({
      methodType: 'offline',
      source: source.offline,
      scope,
      field: 'mentor.methods.offline',
    }),
  } satisfies Record<MentoringMethodType, MentoringMethodOption>;
};

const toMentorSettingsFromBoundary = ({
  boundary,
  profile,
  methods,
  scope,
}: {
  boundary: MentorSettingsBoundaryResponseDto | undefined;
  profile: ProfileResponseDto;
  methods: Record<MentoringMethodType, MentoringMethodOption>;
  scope: Extract<
    MentorApiContractScope,
    'mentor-list-response' | 'mentor-detail-response'
  >;
}): MentorSettings => {
  const defaults = createDefaultMentorSettings();
  const content = boundary?.content;
  const boundaryProfile = toOptionalObject<ProfileResponseDto>(
    boundary?.profile,
  );
  const company = boundaryProfile?.company ?? profile?.company;
  const companyVisible = company?.visible === true;
  const companyName = toTrimmedString(company?.name);
  // Public payloads fail closed. Company exposure now trusts only the
  // structured company object and ignores legacy top-level fallbacks.
  const exposeCompanyName =
    companyName.length > 0 &&
    companyVisible === true &&
    company?.hideCompanyName !== true;
  const hideCompanyName = !exposeCompanyName;
  const jobGroup = requireCodeLabel({
    value: boundaryProfile?.jobGroup ?? profile.jobGroup,
    scope,
    field: 'mentor.profile.jobGroup',
  });
  const jobTitle = requireCodeLabel({
    value: boundaryProfile?.jobTitle ?? profile.jobTitle,
    scope,
    field: 'mentor.profile.jobTitle',
  });
  const career = requireCodeLabel({
    value: boundaryProfile?.career ?? profile.career,
    scope,
    field: 'mentor.profile.career',
  });
  const keywordLabels = requireMentorCoreKeywordLabels({
    value: boundaryProfile?.coreKeywords ?? profile.coreKeywords,
    scope,
    field: 'mentor.profile.coreKeywords',
  });
  const parseDurationFromMethodLabel = (
    methodType: 'deep' | 'offline',
    durationLabel: string,
  ): 30 | 60 | 90 => {
    const durationMinutes = Number(durationLabel.replace(/\D/g, ''));
    if (
      durationMinutes !== 30 &&
      durationMinutes !== 60 &&
      durationMinutes !== 90
    ) {
      throw toContractError({
        scope,
        field: `mentor.methods.${methodType}.durationLabel`,
        causeData: durationLabel,
      });
    }

    return durationMinutes;
  };

  return {
    ...defaults,
    categories: toStringArray(
      boundaryProfile?.categories ?? profile?.categories,
    ),
    mentoringTitle:
      toTrimmedString(boundaryProfile?.mentoringTitle) ||
      toTrimmedString(profile?.mentoringTitle) ||
      toTrimmedString(boundary?.mentoringTitle),
    appealLine:
      toTrimmedString(boundaryProfile?.appealLine) ||
      toTrimmedString(profile?.appealLine),
    jobGroup: jobGroup.label,
    jobTitle: jobTitle.label,
    careerYears: career.label,
    // Structured major-history entries are independent from legacy company
    // visibility and should render whenever the backend provides them.
    careerEntries: normalizeMentorCareerEntries(
      boundaryProfile?.careerEntries ?? profile.careerEntries,
    ),
    skillTags: keywordLabels,
    companyCategory: normalizeCompanyCategory(company?.category),
    companyName: exposeCompanyName ? companyName : '',
    hideCompanyName,
    noteEnabled: methods.note.enabled === true,
    notePrice: methods.note.price,
    simpleEnabled: methods.simple.enabled === true,
    simplePrice: methods.simple.price,
    deepEnabled: methods.deep.enabled === true,
    deepPrice: methods.deep.price,
    deepDurationMinutes: parseDurationFromMethodLabel(
      'deep',
      methods.deep.durationLabel,
    ),
    offlineEnabled: methods.offline.enabled === true,
    offlinePrice: methods.offline.price,
    offlineDurationMinutes: parseDurationFromMethodLabel(
      'offline',
      methods.offline.durationLabel,
    ),
    detailedDescription: normalizeMentorMarkdownContent(
      content?.detailedDescription,
    ),
    interviewQuestions: toStringArray(content?.interviewQuestions),
    preNotice: toTrimmedString(content?.preNotice),
    updatedAt: toTrimmedString(boundary?.metadata?.updatedAt),
  };
};

const toMentorReview = ({
  review,
  scope,
  index,
}: {
  review: MentorReviewResponseDto;
  scope: Extract<
    MentorApiContractScope,
    'mentor-list-response' | 'mentor-detail-response'
  >;
  index: number;
}) => {
  const methodType = parseMentoringMethodType(review.method);
  if (!methodType) {
    throw toContractError({
      scope,
      field: `mentor.reviews[${index}].method`,
      causeData: review.method,
    });
  }

  return {
    id: review.id ?? '',
    authorName: toTrimmedString(review.authorName) || '익명',
    rating: typeof review.rating === 'number' ? review.rating : 0,
    createdAt: toTrimmedString(review.createdAt),
    content: toTrimmedString(review.content),
    method: methodType,
  };
};

export const mapMentorProfile = ({
  source,
  scope,
}: {
  source: MentorProfileResponseDto;
  scope: Extract<
    MentorApiContractScope,
    'mentor-list-response' | 'mentor-detail-response'
  >;
}): MentorProfile => {
  const mentorId = requireInteger({
    value: source.id,
    scope,
    field: 'mentor.id',
  });
  const identity = requireObject<IdentityResponseDto>({
    value: source.identity,
    scope,
    field: 'mentor.identity',
  });
  const methods = toMentorMethodsFromObject(
    requireObject<MentorMethodsResponseDto>({
      value: source.methods,
      scope,
      field: 'mentor.methods',
    }),
    scope,
  );
  const profile = requireObject<ProfileResponseDto>({
    value: source.profile,
    scope,
    field: 'mentor.profile',
  });
  const boundary = source.mentorSettings;
  const settings = toMentorSettingsFromBoundary({
    boundary,
    profile,
    methods,
    scope,
  });
  const tags = Array.from(
    new Set([
      ...settings.skillTags,
      ...toStringArray(source.introduction?.tags),
    ]),
  );
  const companyLabel = settings.hideCompanyName ? '' : settings.companyName;

  return {
    id: mentorId,
    nickname: requireNonEmptyString({
      value: identity.nickname,
      scope,
      field: 'mentor.identity.nickname',
    }),
    role: settings.jobTitle,
    career: settings.careerYears,
    company: companyLabel,
    publicReadinessStage: normalizePublicReadinessStage(
      source.publicReadinessStage,
    ),
    applicationReady:
      typeof source.applicationReady === 'boolean'
        ? source.applicationReady
        : undefined,
    rating: typeof source.stats?.rating === 'number' ? source.stats.rating : 0,
    reviewCount:
      typeof source.stats?.reviewCount === 'number'
        ? source.stats.reviewCount
        : 0,
    mentoringCount:
      typeof source.stats?.mentoringCount === 'number'
        ? source.stats.mentoringCount
        : 0,
    menteeCount:
      typeof source.stats?.menteeCount === 'number'
        ? source.stats.menteeCount
        : undefined,
    tags,
    summary: toTrimmedString(source.summary),
    bio: settings.detailedDescription,
    careerHistory: toStringArray(source.introduction?.careerHistory),
    strengths: toStringArray(source.introduction?.strengths),
    imageUrl: toMentorImageUrl(identity.imageUrl),
    methods,
    reviews: (source.reviews ?? []).map((review, index) =>
      toMentorReview({
        review,
        scope,
        index,
      }),
    ),
    mentorSettings: settings,
  };
};
