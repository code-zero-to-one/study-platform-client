import { buildMentorRequiredStepChecklist } from '@/features/mentoring/model/mentor-public-readiness';
import {
  applyMentorScheduleTextDrafts,
  createDefaultMentorSettings,
  formatMentorCareerEntryPeriodLabel,
  normalizeMentorCareerEntries,
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
import type { MentorCareerEntry } from '@/types/mentoring/settings';
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

const isSameCareerEntries = (
  first: MentorRegistrationFormValues['careerEntries'],
  second: MentorRegistrationFormValues['careerEntries'],
) => {
  const normalizedFirst = normalizeMentorCareerEntries(first);
  const normalizedSecond = normalizeMentorCareerEntries(second);

  if (normalizedFirst.length !== normalizedSecond.length) {
    return false;
  }

  return normalizedFirst.every((entry: MentorCareerEntry, index: number) => {
    const target = normalizedSecond[index];

    return (
      entry.description === target?.description &&
      entry.isCurrent === target?.isCurrent &&
      entry.periodEnabled === target?.periodEnabled &&
      entry.startMonth === target?.startMonth &&
      entry.endMonth === target?.endMonth
    );
  });
};

const buildCareerHistoryLines = (values: MentorRegistrationFormValues) => {
  return normalizeMentorCareerEntries(values.careerEntries)
    .map((entry: MentorCareerEntry) => {
      const description = entry.description.trim();
      const periodLabel = formatMentorCareerEntryPeriodLabel(entry);

      if (!description) {
        return '';
      }

      return periodLabel ? `${periodLabel} · ${description}` : description;
    })
    .filter((entry: string) => entry.length > 0);
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
  displayProfileKeywords,
  companyName,
  hideCompanyName,
  imageUrl,
  nickname,
}: {
  mentorId: number;
  values: MentorRegistrationFormValues;
  displayJobGroup: string;
  displayJobTitle: string;
  displayCareer: string;
  displayProfileKeywords: string[];
  companyName: string;
  hideCompanyName: boolean;
  imageUrl?: string;
  nickname: string;
}): MentorProfile => {
  const previewSchedule = applyMentorScheduleTextDrafts({
    schedule: values.schedule,
    drafts: values.scheduleDrafts,
  }).schedule;
  const previewValues = {
    ...values,
    schedule: previewSchedule,
  };
  const scheduleSlots = collectScheduleSlots(previewValues);
  const simpleTimeSlots = scheduleSlots.map((slot) =>
    toTimeRangeLabel(slot, 15),
  );
  const deepTimeSlots = scheduleSlots.map((slot) =>
    toTimeRangeLabel(slot, previewValues.deepDurationMinutes),
  );
  const offlineTimeSlots = scheduleSlots.map((slot) =>
    toTimeRangeLabel(slot, previewValues.offlineDurationMinutes),
  );
  const careerEntries = previewValues.careerEntries;
  const careerHistory = buildCareerHistoryLines(previewValues);

  return {
    id: mentorId,
    nickname: nickname.trim() || `멘토${mentorId}`,
    role: displayJobGroup,
    career: displayCareer,
    company: hideCompanyName ? '' : companyName.trim(),
    rating: 0,
    reviewCount: 0,
    mentoringCount: 0,
    menteeCount: 0,
    tags: displayProfileKeywords,
    summary: previewValues.appealLine,
    bio: previewValues.detailedDescription,
    careerHistory,
    strengths: [],
    imageUrl: imageUrl?.trim() || undefined,
    methods: {
      note: buildMethod({
        type: 'note',
        enabled: previewValues.noteEnabled,
        price: previewValues.notePrice,
        durationMinutes: 0,
        timeSlots: [],
      }),
      simple: buildMethod({
        type: 'simple',
        enabled: previewValues.simpleEnabled,
        price: previewValues.simplePrice,
        durationMinutes: 15,
        timeSlots: simpleTimeSlots,
      }),
      deep: buildMethod({
        type: 'deep',
        enabled: previewValues.deepEnabled,
        price: previewValues.deepPrice,
        durationMinutes: previewValues.deepDurationMinutes,
        timeSlots: deepTimeSlots,
      }),
      offline: buildMethod({
        type: 'offline',
        enabled: previewValues.offlineEnabled,
        price: previewValues.offlinePrice,
        durationMinutes: previewValues.offlineDurationMinutes,
        timeSlots: offlineTimeSlots,
      }),
    },
    reviews: [],
    mentorSettings: {
      ...createDefaultMentorSettings(),
      ...previewValues,
      jobGroup: displayJobGroup,
      jobTitle: displayJobTitle,
      careerYears: displayCareer,
      careerEntries,
      skillTags: displayProfileKeywords,
      companyName: companyName.trim(),
      hideCompanyName,
      updatedAt: previewValues.updatedAt,
    },
  };
};

export const buildWelcomeChecklist = (
  mentor: MentorProfile,
  options?: {
    settlementAccountReady?: boolean;
  },
): MentorRegistrationWelcomeChecklistItem[] => {
  return buildMentorRequiredStepChecklist(mentor, options);
};

export const getChangedSections = (
  prev: MentorRegistrationFormValues,
  next: MentorRegistrationFormValues,
): MentorRegistrationPreviewHighlightSection[] => {
  const changed: MentorRegistrationPreviewHighlightSection[] = [];
  const prevPreviewSchedule = applyMentorScheduleTextDrafts({
    schedule: prev.schedule,
    drafts: prev.scheduleDrafts,
  }).schedule;
  const nextPreviewSchedule = applyMentorScheduleTextDrafts({
    schedule: next.schedule,
    drafts: next.scheduleDrafts,
  }).schedule;

  if (
    prev.mentoringTitle !== next.mentoringTitle ||
    prev.appealLine !== next.appealLine ||
    prev.jobGroup !== next.jobGroup ||
    prev.jobTitle !== next.jobTitle ||
    prev.careerYears !== next.careerYears ||
    prev.companyName !== next.companyName ||
    prev.hideCompanyName !== next.hideCompanyName ||
    !isSameCareerEntries(prev.careerEntries, next.careerEntries) ||
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
    !isSameWeeklySchedule(prevPreviewSchedule, nextPreviewSchedule)
  ) {
    changed.push('methods');
  }

  return changed;
};
