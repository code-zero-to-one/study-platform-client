import {
  createDefaultMentorSettings,
  parseDurationLabelToMinutes,
} from '@/features/mentoring/model/mentor-settings';
import {
  MENTORING_METHOD_DEFAULT_DURATION_LABEL_MAP,
  MENTORING_METHOD_LABEL_MAP,
  MENTORING_METHOD_ORDER,
} from '@/features/mentoring/model/mentoring-method';
import type {
  MentorProfile,
  MentorSortOption,
  MentoringMethodOption,
  MentoringMethodType,
} from '@/types/mentoring/domain';
import type { MentorSettings } from '@/types/mentoring/settings';

const normalizeConsultingDuration = (minutes: number) => {
  if (minutes <= 30) {
    return 30 as const;
  }
  if (minutes <= 60) {
    return 60 as const;
  }

  return 90 as const;
};

const createEmptyMethodOption = (
  type: MentoringMethodType,
): MentoringMethodOption => {
  return {
    type,
    label: MENTORING_METHOD_LABEL_MAP[type],
    durationLabel: MENTORING_METHOD_DEFAULT_DURATION_LABEL_MAP[type],
    price: 0,
    description: '',
    enabled: false,
    requiresSchedule: type !== 'note',
    timeSlots: [],
  };
};

const normalizeMethodOption = ({
  type,
  source,
}: {
  type: MentoringMethodType;
  source?: MentoringMethodOption;
}): MentoringMethodOption => {
  const fallback = createEmptyMethodOption(type);

  if (!source) {
    return fallback;
  }

  const durationLabel =
    type === 'note'
      ? '비동기'
      : source.durationLabel?.trim() ||
        MENTORING_METHOD_DEFAULT_DURATION_LABEL_MAP[type];

  return {
    ...fallback,
    ...source,
    type,
    label: source.label?.trim() || MENTORING_METHOD_LABEL_MAP[type],
    durationLabel,
    price:
      typeof source.price === 'number' && Number.isFinite(source.price)
        ? source.price
        : 0,
    enabled: source.enabled === true,
    requiresSchedule: type !== 'note',
    timeSlots: source.timeSlots ?? [],
  };
};

const getNormalizedMethods = (
  mentor: MentorProfile,
): Record<MentoringMethodType, MentoringMethodOption> => {
  return {
    note: normalizeMethodOption({
      type: 'note',
      source: mentor.methods?.note,
    }),
    simple: normalizeMethodOption({
      type: 'simple',
      source: mentor.methods?.simple,
    }),
    deep: normalizeMethodOption({
      type: 'deep',
      source: mentor.methods?.deep,
    }),
    offline: normalizeMethodOption({
      type: 'offline',
      source: mentor.methods?.offline,
    }),
  };
};

const getNormalizedSettings = (mentor: MentorProfile): MentorSettings => {
  const defaults = createDefaultMentorSettings();
  const source = mentor.mentorSettings as MentorSettings | undefined;
  const methods = getNormalizedMethods(mentor);
  const normalizedDeepDuration = normalizeConsultingDuration(
    parseDurationLabelToMinutes(methods.deep.durationLabel) ??
      defaults.deepDurationMinutes,
  );
  const normalizedOfflineDuration = normalizeConsultingDuration(
    parseDurationLabelToMinutes(methods.offline.durationLabel) ??
      defaults.offlineDurationMinutes,
  );

  return {
    ...defaults,
    ...source,
    jobGroup: source?.jobGroup?.trim() ?? '',
    jobTitle: source?.jobTitle?.trim() ?? '',
    careerYears: source?.careerYears?.trim() ?? '',
    mentoringTitle: source?.mentoringTitle?.trim() ?? '',
    appealLine: source?.appealLine?.trim() ?? '',
    companyName: source?.companyName?.trim() ?? '',
    skillTags: source?.skillTags ?? mentor.tags ?? [],
    noteEnabled: source?.noteEnabled ?? methods.note.enabled === true,
    notePrice: source?.notePrice ?? methods.note.price,
    simpleEnabled: source?.simpleEnabled ?? methods.simple.enabled === true,
    simplePrice: source?.simplePrice ?? methods.simple.price,
    deepEnabled: source?.deepEnabled ?? methods.deep.enabled === true,
    deepPrice: source?.deepPrice ?? methods.deep.price,
    deepDurationMinutes: source?.deepDurationMinutes ?? normalizedDeepDuration,
    offlineEnabled: source?.offlineEnabled ?? methods.offline.enabled === true,
    offlinePrice: source?.offlinePrice ?? methods.offline.price,
    offlineDurationMinutes:
      source?.offlineDurationMinutes ?? normalizedOfflineDuration,
  };
};

export const sortOptions = [
  { value: 'default', label: '기본순' },
  { value: 'rating', label: '평점순' },
  { value: 'review', label: '리뷰순' },
  { value: 'low-price', label: '낮은 가격순' },
] as const satisfies readonly MentorSortOption[];

export const getEnabledMentoringMethods = (mentor: MentorProfile) => {
  const methods = getNormalizedMethods(mentor);

  return MENTORING_METHOD_ORDER.filter((method) => methods[method].enabled === true);
};

export const getLowestPriceOption = (mentor: MentorProfile) => {
  const methods = getEnabledMentoringMethods(mentor);
  const normalizedMethods = getNormalizedMethods(mentor);
  const enabledOptions = methods
    .map((method) => normalizedMethods[method])
    .filter((option) => option.price > 0);

  if (enabledOptions.length === 0) {
    return null;
  }

  return enabledOptions.sort((a, b) => a.price - b.price)[0];
};

export const formatWon = (price: number) => `₩${price.toLocaleString('ko-KR')}`;

export const getMethodLabel = (method: MentoringMethodType) => {
  return MENTORING_METHOD_LABEL_MAP[method];
};

export const getMentorSettings = (mentor: MentorProfile): MentorSettings => {
  return getNormalizedSettings(mentor);
};

export const getMentorDisplayTitle = (mentor: MentorProfile): string => {
  const title = getMentorSettings(mentor).mentoringTitle.trim();

  return title.length > 0 ? title : '-';
};
