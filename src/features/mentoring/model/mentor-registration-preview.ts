import {
  createDefaultMentorSettings,
  toTimeRangeLabel,
  WEEKDAY_KEYS,
} from '@/features/mentoring/model/mentor-settings';
import type {
  MentorProfile,
  MentoringMethodType,
} from '@/types/mentoring/domain';
import type {
  MentorRegistrationPreviewHighlightSection,
  MentorRegistrationWelcomeChecklistItem,
} from '@/types/mentoring/registration-view';
import type { MentorRegistrationFormValues } from '@/types/schemas/mentor-registration-schema';

export const toSafeInteger = (value: unknown, fallback: number) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.round(parsed);
};

export const toDurationMinutes = (
  value: unknown,
  fallback: 30 | 60 | 90,
): 30 | 60 | 90 => {
  const parsed = Number(value);
  if (parsed === 30 || parsed === 60 || parsed === 90) {
    return parsed;
  }

  return fallback;
};

const countScheduleSlots = (values: MentorRegistrationFormValues) => {
  return Object.values(values.schedule.weekly).reduce(
    (count, slots) => count + slots.length,
    0,
  );
};

const collectScheduleSlots = (values: MentorRegistrationFormValues) => {
  const uniqueSlots = new Set<string>();

  Object.values(values.schedule.weekly).forEach((slots) => {
    slots.forEach((slot) => uniqueSlots.add(slot));
  });

  return Array.from(uniqueSlots).sort().slice(0, 8);
};

const isSameStringArray = (first: string[], second: string[]) => {
  if (first.length !== second.length) {
    return false;
  }

  return first.every((value, index) => value === second[index]);
};

const isSameWeeklySchedule = (
  first: MentorRegistrationFormValues['schedule'],
  second: MentorRegistrationFormValues['schedule'],
) => {
  if (
    first.timezone !== second.timezone ||
    first.slotUnitMinutes !== second.slotUnitMinutes
  ) {
    return false;
  }

  return WEEKDAY_KEYS.every((weekdayKey) =>
    isSameStringArray(first.weekly[weekdayKey], second.weekly[weekdayKey]),
  );
};

const buildMethod = ({
  type,
  enabled,
  price,
  durationMinutes,
  timeSlots,
}: {
  type: MentoringMethodType;
  enabled: boolean;
  price: number;
  durationMinutes: number;
  timeSlots: string[];
}) => {
  const labels: Record<MentoringMethodType, string> = {
    note: '쪽지상담',
    simple: '간편상담',
    deep: '심층상담',
    offline: '대면상담',
  };

  const descriptions: Record<MentoringMethodType, string> = {
    note: '질문/고민/자료를 미리 전달하고 텍스트로 빠르게 답변받는 비동기 상담입니다.',
    simple:
      '허들을 낮춘 단기 상담입니다. 사전 질문을 바탕으로 핵심만 빠르게 정리합니다.',
    deep: '화면 공유/코드 리뷰 등 실시간 피드백이 필요한 상담에 적합합니다.',
    offline:
      '커피챗 또는 심층 상담으로 진행합니다. 세일즈 제안 목적 상담도 가능합니다.',
  };

  return {
    type,
    label: labels[type],
    durationLabel: type === 'note' ? '비동기' : `${durationMinutes}분`,
    price,
    description: descriptions[type],
    enabled,
    requiresSchedule: type !== 'note',
    timeSlots: type === 'note' ? [] : timeSlots,
  };
};

export const buildPreviewMentorProfile = ({
  mentorId,
  values,
  displayJobGroup,
  displayJobTitle,
  displayCareer,
  displayCoreKeywords,
  imageUrl,
  nickname,
}: {
  mentorId: number;
  values: MentorRegistrationFormValues;
  displayJobGroup: string;
  displayJobTitle: string;
  displayCareer: string;
  displayCoreKeywords: string[];
  imageUrl?: string;
  nickname: string;
}): MentorProfile => {
  const scheduleSlots = collectScheduleSlots(values);
  const simpleTimeSlots = scheduleSlots.map((slot) =>
    toTimeRangeLabel(slot, 15),
  );
  const deepTimeSlots = scheduleSlots.map((slot) =>
    toTimeRangeLabel(slot, values.deepDurationMinutes),
  );
  const offlineTimeSlots = scheduleSlots.map((slot) =>
    toTimeRangeLabel(slot, values.offlineDurationMinutes),
  );
  const company = values.hideCompanyName
    ? '비공개'
    : values.companyName.trim() || '소속 비공개';
  const careerHistoryLine = [company, displayJobTitle, displayCareer]
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .join(' · ');

  return {
    id: mentorId,
    nickname: nickname.trim() || `멘토${mentorId}`,
    role: displayJobGroup,
    career: displayCareer,
    company,
    rating: 0,
    reviewCount: 0,
    mentoringCount: 0,
    menteeCount: 0,
    tags: displayCoreKeywords,
    summary: values.appealLine,
    bio: values.detailedDescription,
    careerHistory: careerHistoryLine ? [careerHistoryLine] : [],
    strengths: [],
    imageUrl: imageUrl?.trim() || undefined,
    methods: {
      note: buildMethod({
        type: 'note',
        enabled: values.noteEnabled,
        price: values.notePrice,
        durationMinutes: 0,
        timeSlots: [],
      }),
      simple: buildMethod({
        type: 'simple',
        enabled: values.simpleEnabled,
        price: values.simplePrice,
        durationMinutes: 15,
        timeSlots: simpleTimeSlots,
      }),
      deep: buildMethod({
        type: 'deep',
        enabled: values.deepEnabled,
        price: values.deepPrice,
        durationMinutes: values.deepDurationMinutes,
        timeSlots: deepTimeSlots,
      }),
      offline: buildMethod({
        type: 'offline',
        enabled: values.offlineEnabled,
        price: values.offlinePrice,
        durationMinutes: values.offlineDurationMinutes,
        timeSlots: offlineTimeSlots,
      }),
    },
    reviews: [],
    mentorSettings: {
      ...createDefaultMentorSettings(),
      ...values,
      jobGroup: displayJobGroup,
      jobTitle: displayJobTitle,
      careerYears: displayCareer,
      skillTags: displayCoreKeywords,
      updatedAt: values.updatedAt,
      settlementDraft: values.settlementDraft ?? null,
    },
  };
};

export const buildWelcomeChecklist = (
  values: MentorRegistrationFormValues,
): MentorRegistrationWelcomeChecklistItem[] => {
  const realtimeEnabled =
    values.simpleEnabled || values.deepEnabled || values.offlineEnabled;
  const scheduleSlots = countScheduleSlots(values);
  const interviewQuestionCount = values.interviewQuestions.length;

  return [
    {
      title: '정산정보 등록 (추후 제공)',
      description:
        '정산 기능은 추후 업데이트 예정이며, 오픈 시 별도 안내를 제공할 예정입니다.',
      done: true,
    },
    {
      title: '실시간 상담 슬롯 오픈',
      description:
        realtimeEnabled && scheduleSlots > 0
          ? `간편/심층/대면 상담 슬롯 ${scheduleSlots}개가 열려 있어요.`
          : '간편/심층/대면 상담을 열고 가능한 시간을 등록해보세요.',
      done: realtimeEnabled && scheduleSlots > 0,
    },
    {
      title: '상담 전 준비사항 등록',
      description:
        interviewQuestionCount >= 2
          ? `상담 전 준비사항 ${interviewQuestionCount}개를 등록해 사전 준비를 안내할 수 있어요.`
          : '상담 전 준비사항을 2개 이상 등록하면 상담 효율이 높아집니다.',
      done: interviewQuestionCount >= 2,
    },
  ];
};

export const getChangedSections = (
  prev: MentorRegistrationFormValues,
  next: MentorRegistrationFormValues,
): MentorRegistrationPreviewHighlightSection[] => {
  const changed: MentorRegistrationPreviewHighlightSection[] = [];

  if (
    prev.mentoringTitle !== next.mentoringTitle ||
    prev.appealLine !== next.appealLine ||
    prev.jobGroup !== next.jobGroup ||
    prev.jobTitle !== next.jobTitle ||
    prev.careerYears !== next.careerYears ||
    prev.companyCategory !== next.companyCategory ||
    prev.companyName !== next.companyName ||
    prev.hideCompanyName !== next.hideCompanyName ||
    prev.listVisible !== next.listVisible
  ) {
    changed.push('headline');
  }

  if (
    prev.detailedDescription !== next.detailedDescription ||
    !isSameStringArray(prev.skillTags, next.skillTags)
  ) {
    changed.push('description');
  }

  if (!isSameStringArray(prev.interviewQuestions, next.interviewQuestions)) {
    changed.push('interview');
  }

  if (
    prev.noteEnabled !== next.noteEnabled ||
    prev.notePrice !== next.notePrice ||
    prev.simpleEnabled !== next.simpleEnabled ||
    prev.simplePrice !== next.simplePrice ||
    prev.deepEnabled !== next.deepEnabled ||
    prev.deepPrice !== next.deepPrice ||
    prev.deepDurationMinutes !== next.deepDurationMinutes ||
    prev.offlineEnabled !== next.offlineEnabled ||
    prev.offlinePrice !== next.offlinePrice ||
    prev.offlineDurationMinutes !== next.offlineDurationMinutes ||
    prev.maxParticipants !== next.maxParticipants ||
    !isSameWeeklySchedule(prev.schedule, next.schedule)
  ) {
    changed.push('methods');
  }

  if (prev.preNotice !== next.preNotice) {
    changed.push('notice');
  }

  return changed;
};
