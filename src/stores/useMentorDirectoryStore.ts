import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  toTimeRangeLabel,
} from '@/features/mentoring/model/mentor-settings';
import {
  MENTOR_PROFILES,
  withMentorSettings,
} from '@/mocks/mentoring-mock-data';
import type {
  MentorProfile,
  MentoringMethodOption,
  MentoringMethodType,
} from '@/types/mentoring';
import { type MentorSettingsV2 } from '@/types/mentoring-settings';
import { type MentorRegistrationFormValues } from '@/types/schemas/mentor-registration-schema';

interface MentorDirectoryState {
  memberId: number | undefined;
  createdMentors: MentorProfile[];
  mentorIdByMember: Record<number, number>;
  nextMentorId: number;
  hasHydrated: boolean;
  registerMentorProfile: (
    memberId: number,
    formValues: MentorRegistrationFormValues,
    options?: {
      imageUrl?: string | null;
    },
  ) => number;
  reset: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

type PersistedMentorDirectoryState = Pick<
  MentorDirectoryState,
  'memberId' | 'createdMentors' | 'mentorIdByMember' | 'nextMentorId'
>;

const STATIC_MENTOR_MAX_ID = MENTOR_PROFILES.reduce((maxId, mentor) => {
  return Math.max(maxId, mentor.id);
}, 0);
const MIN_GENERATED_MENTOR_ID = STATIC_MENTOR_MAX_ID + 1;
const INITIAL_MENTOR_ID = MIN_GENERATED_MENTOR_ID;

const collectScheduleSlots = (formValues: MentorRegistrationFormValues) => {
  const uniqueSlots = new Set<string>();

  Object.values(formValues.schedule.weekly).forEach((slots) => {
    slots.forEach((slot) => uniqueSlots.add(slot));
  });

  return Array.from(uniqueSlots).sort().slice(0, 8);
};

const makeLegacyTimeRanges = (
  formValues: MentorRegistrationFormValues,
  durationMinutes: number,
) => {
  return collectScheduleSlots(formValues).map((slot) =>
    toTimeRangeLabel(slot, durationMinutes),
  );
};

const createMentoringMethodOption = ({
  type,
  enabled,
  price,
  durationMinutes,
  legacyTimeRanges,
}: {
  type: MentoringMethodType;
  enabled: boolean;
  price: number;
  durationMinutes: number;
  legacyTimeRanges: string[];
}): MentoringMethodOption => {
  if (type === 'note') {
    return {
      type,
      label: '쪽지상담',
      durationLabel: '비동기',
      description:
        '질문/고민/자료를 미리 전달하고 멘토가 텍스트로 빠르게 답변합니다.',
      enabled,
      requiresSchedule: false,
      price,
      timeSlots: [],
    };
  }

  if (type === 'phone') {
    return {
      type,
      label: '15분 전화상담',
      durationLabel: '15분',
      description:
        '허들을 낮춘 단기 상담입니다. 사전 질문을 바탕으로 핵심만 빠르게 정리합니다.',
      enabled,
      requiresSchedule: true,
      price,
      timeSlots: legacyTimeRanges,
    };
  }

  if (type === 'online') {
    return {
      type,
      label: '온라인상담',
      durationLabel: `${durationMinutes}분`,
      description:
        '화면 공유/코드 리뷰 등 실시간 피드백이 필요한 상담에 적합합니다.',
      enabled,
      requiresSchedule: true,
      price,
      timeSlots: legacyTimeRanges,
    };
  }

  return {
    type,
    label: '대면상담',
    durationLabel: `${durationMinutes}분`,
    description:
      '커피챗 또는 심층 상담으로 진행합니다. 세일즈 제안 목적 상담도 가능합니다.',
    enabled,
    requiresSchedule: true,
    price,
    timeSlots: legacyTimeRanges,
  };
};

const buildCareerHistory = (formValues: MentorRegistrationFormValues) => {
  const trimmedCompanyName = formValues.companyName.trim();
  const companyLabel =
    formValues.hideCompanyName || trimmedCompanyName === ''
      ? '소속 비공개'
      : trimmedCompanyName;
  const roleLabel = formValues.jobTitle || formValues.jobGroup || '직무 미입력';
  const careerLabel = formValues.careerYears || '경력 미입력';

  return [`${companyLabel} · ${roleLabel} · ${careerLabel}`];
};

export const createMentorProfileFromRegistration = (
  mentorId: number,
  formValues: MentorRegistrationFormValues,
  nowIso: string,
  profileImageUrl?: string | null,
): MentorProfile => {
  const trimmedCompanyName = formValues.companyName.trim();
  const company = formValues.hideCompanyName
    ? '비공개'
    : trimmedCompanyName === ''
      ? '소속 비공개'
      : trimmedCompanyName;
  const skillTags = formValues.skillTags;
  const phoneTimeRanges = makeLegacyTimeRanges(formValues, 15);
  const onlineTimeRanges = makeLegacyTimeRanges(
    formValues,
    formValues.onlineDurationMinutes,
  );
  const offlineTimeRanges = makeLegacyTimeRanges(
    formValues,
    formValues.offlineDurationMinutes,
  );
  const normalizedSettings: MentorSettingsV2 = {
    contactCountryCode: formValues.contactCountryCode ?? '+82',
    contactPhone: formValues.contactPhone ?? '',
    contactEmail: formValues.contactEmail ?? '',
    categories: formValues.categories ?? [],
    mentoringTitle: formValues.mentoringTitle ?? '',
    appealLine: formValues.appealLine ?? '',
    jobGroup: formValues.jobGroup ?? '',
    jobTitle: formValues.jobTitle ?? '',
    careerYears: formValues.careerYears ?? '',
    skillTags: formValues.skillTags ?? [],
    companyCategory: formValues.companyCategory ?? '기타',
    companyName: formValues.companyName ?? '',
    hideCompanyName: formValues.hideCompanyName ?? false,
    maxParticipants: formValues.maxParticipants ?? 1,
    noteEnabled: formValues.noteEnabled ?? true,
    notePrice: formValues.notePrice ?? 5000,
    phoneEnabled: formValues.phoneEnabled ?? true,
    phonePrice: formValues.phonePrice ?? 15000,
    onlineEnabled: formValues.onlineEnabled ?? true,
    onlinePrice: formValues.onlinePrice ?? 30000,
    onlineDurationMinutes: formValues.onlineDurationMinutes ?? 60,
    offlineEnabled: formValues.offlineEnabled ?? false,
    offlinePrice: formValues.offlinePrice ?? 100000,
    offlineDurationMinutes: formValues.offlineDurationMinutes ?? 60,
    schedule: formValues.schedule,
    holidays: formValues.holidays ?? [],
    detailedDescription: formValues.detailedDescription ?? '',
    interviewQuestions: formValues.interviewQuestions ?? [],
    preNotice: formValues.preNotice ?? '',
    settlementDraft: formValues.settlementDraft ?? null,
    schemaVersion: 3,
    updatedAt: nowIso,
  };

  return {
    id: mentorId,
    priority: 0,
    headline: formValues.mentoringTitle,
    nickname: `멘토${mentorId}`,
    role: formValues.jobGroup,
    career: formValues.careerYears,
    company,
    rating: 0,
    reviewCount: 0,
    mentoringCount: 0,
    tags: skillTags,
    summary: formValues.mentoringTitle,
    bio: formValues.detailedDescription,
    careerHistory: buildCareerHistory(formValues),
    strengths: skillTags,
    avatarEmoji: 'M',
    imageUrl:
      profileImageUrl && profileImageUrl.trim().length > 0
        ? profileImageUrl.trim()
        : undefined,
    methods: {
      note: createMentoringMethodOption({
        type: 'note',
        enabled: formValues.noteEnabled,
        price: formValues.notePrice,
        durationMinutes: 0,
        legacyTimeRanges: [],
      }),
      phone: createMentoringMethodOption({
        type: 'phone',
        enabled: formValues.phoneEnabled,
        price: formValues.phonePrice,
        durationMinutes: 15,
        legacyTimeRanges: phoneTimeRanges,
      }),
      online: createMentoringMethodOption({
        type: 'online',
        enabled: formValues.onlineEnabled,
        price: formValues.onlinePrice,
        durationMinutes: formValues.onlineDurationMinutes,
        legacyTimeRanges: onlineTimeRanges,
      }),
      offline: createMentoringMethodOption({
        type: 'offline',
        enabled: formValues.offlineEnabled,
        price: formValues.offlinePrice,
        durationMinutes: formValues.offlineDurationMinutes,
        legacyTimeRanges: offlineTimeRanges,
      }),
    },
    reviews: [
      {
        id: mentorId * 10,
        authorName: 'ZERO-ONE',
        rating: 5,
        createdAt: nowIso.slice(0, 10).replace(/-/g, '.'),
        method: 'note',
        content: '새로 등록된 멘토입니다. 첫 멘토링을 통해 리뷰를 쌓아보세요.',
      },
    ],
    mentorSettings: normalizedSettings,
  };
};

const normalizePersistedState = (
  state: PersistedMentorDirectoryState,
): PersistedMentorDirectoryState => {
  const nextCreatedMentors = (state.createdMentors ?? []).map((mentor) =>
    withMentorSettings(mentor),
  );
  const highestCreatedMentorId = nextCreatedMentors.reduce((maxId, mentor) => {
    return Math.max(maxId, mentor.id);
  }, MIN_GENERATED_MENTOR_ID - 1);
  const highestMappedMentorId = Object.values(
    state.mentorIdByMember ?? {},
  ).reduce((maxId, mentorId) => {
    return Math.max(maxId, mentorId);
  }, MIN_GENERATED_MENTOR_ID - 1);
  const nextMentorId = Math.max(
    state.nextMentorId ?? MIN_GENERATED_MENTOR_ID,
    highestCreatedMentorId + 1,
    highestMappedMentorId + 1,
    MIN_GENERATED_MENTOR_ID,
  );

  return {
    ...state,
    createdMentors: nextCreatedMentors,
    nextMentorId,
  };
};

export const useMentorDirectoryStore = create<MentorDirectoryState>()(
  persist(
    (set, get): MentorDirectoryState => ({
      memberId: undefined,
      createdMentors: [] as MentorProfile[],
      mentorIdByMember: {} as Record<number, number>,
      nextMentorId: INITIAL_MENTOR_ID,
      hasHydrated: false,
      registerMentorProfile: (memberId, formValues, options) => {
        const state = get();
        const now = new Date().toISOString();
        const existingMentorId = state.mentorIdByMember[memberId];
        const nextMentorId = Math.max(
          state.nextMentorId,
          MIN_GENERATED_MENTOR_ID,
        );
        const mentorId = existingMentorId ?? nextMentorId;
        const nextMentor = createMentorProfileFromRegistration(
          mentorId,
          formValues,
          now,
          options?.imageUrl,
        );

        set((prevState) => {
          const withoutCurrentMentor = prevState.createdMentors.filter(
            (mentor) => mentor.id !== mentorId,
          );

          return {
            memberId,
            createdMentors: [nextMentor, ...withoutCurrentMentor],
            mentorIdByMember: {
              ...prevState.mentorIdByMember,
              [memberId]: mentorId,
            },
            nextMentorId:
              existingMentorId !== undefined
                ? Math.max(prevState.nextMentorId, MIN_GENERATED_MENTOR_ID)
                : Math.max(prevState.nextMentorId, mentorId + 1),
          };
        });

        return mentorId;
      },
      reset: () =>
        set({
          memberId: undefined,
          createdMentors: [],
          mentorIdByMember: {},
          nextMentorId: INITIAL_MENTOR_ID,
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'mentor-directory-storage',
      version: 3,
      migrate: (persistedState, version) => {
        if (!persistedState) {
          return persistedState;
        }

        const typedState = persistedState as PersistedMentorDirectoryState;

        if (version < 3) {
          return normalizePersistedState(typedState);
        }

        return normalizePersistedState(typedState);
      },
      partialize: (state): PersistedMentorDirectoryState => ({
        memberId: state.memberId,
        createdMentors: state.createdMentors,
        mentorIdByMember: state.mentorIdByMember,
        nextMentorId: state.nextMentorId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
