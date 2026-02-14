import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  toTimeRangeLabel,
  type MentorSettingsV2,
} from '@/features/mentoring/model/mentor-settings';
import {
  type MentorProfile,
  type MentoringMethodOption,
  withMentorSettings,
} from '@/mocks/mentoring-mock-data';
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
  ) => number;
  reset: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

type PersistedMentorDirectoryState = Pick<
  MentorDirectoryState,
  'memberId' | 'createdMentors' | 'mentorIdByMember' | 'nextMentorId'
>;

const INITIAL_MENTOR_ID = 10_000;

const makeLegacyTimeRanges = (formValues: MentorRegistrationFormValues) => {
  const uniqueSlots = new Set<string>();

  Object.values(formValues.schedule.weekly).forEach((slots) => {
    slots.forEach((slot) => uniqueSlots.add(slot));
  });

  return Array.from(uniqueSlots)
    .sort()
    .slice(0, 8)
    .map((slot) => toTimeRangeLabel(slot, formValues.sessionDurationMinutes));
};

const createMentoringMethodOption = ({
  type,
  enabled,
  price,
  durationMinutes,
  legacyTimeRanges,
}: {
  type: 'chat' | 'call' | 'offline';
  enabled: boolean;
  price: number;
  durationMinutes: number;
  legacyTimeRanges: string[];
}): MentoringMethodOption => {
  if (type === 'chat') {
    return {
      type,
      label: '텍스트 질문/답변',
      durationLabel: '비동기',
      description: '일정 조율 없이 질문을 남기면 멘토가 순차적으로 답변합니다.',
      enabled,
      requiresSchedule: false,
      price,
      timeSlots: [],
    };
  }

  if (type === 'call') {
    return {
      type,
      label: '전화/온라인 상담',
      durationLabel: `${durationMinutes}분`,
      description: '전화 또는 ZOOM으로 짧고 밀도 있게 상담합니다.',
      enabled,
      requiresSchedule: true,
      price,
      timeSlots: legacyTimeRanges,
    };
  }

  return {
    type,
    label: '대면/ZOOM 상담',
    durationLabel: `${durationMinutes}분`,
    description: '심층 고민을 정리하는 장시간 멘토링입니다.',
    enabled,
    requiresSchedule: true,
    price,
    timeSlots: legacyTimeRanges,
  };
};

const toMentorProfile = (
  mentorId: number,
  formValues: MentorRegistrationFormValues,
  nowIso: string,
): MentorProfile => {
  const trimmedCompanyName = formValues.companyName.trim();
  const company = formValues.hideCompanyName
    ? '비공개'
    : trimmedCompanyName === ''
      ? '소속 비공개'
      : trimmedCompanyName;
  const skillTags = formValues.skillTags;
  const legacyTimeRanges = makeLegacyTimeRanges(formValues);
  const normalizedSettings: MentorSettingsV2 = {
    contactCountryCode: formValues.contactCountryCode ?? '+82',
    contactPhone: formValues.contactPhone ?? '',
    contactEmail: formValues.contactEmail ?? '',
    categories: formValues.categories ?? [],
    mentoringTitle: formValues.mentoringTitle ?? '',
    jobGroup: formValues.jobGroup ?? '',
    jobTitle: formValues.jobTitle ?? '',
    careerYears: formValues.careerYears ?? '',
    skillTags: formValues.skillTags ?? [],
    companyName: formValues.companyName ?? '',
    hideCompanyName: formValues.hideCompanyName ?? false,
    sessionDurationMinutes: formValues.sessionDurationMinutes ?? 30,
    maxParticipants: formValues.maxParticipants ?? 1,
    chatEnabled: formValues.chatEnabled ?? true,
    chatPrice: formValues.chatPrice ?? 5000,
    callEnabled: formValues.callEnabled ?? true,
    callPrice: formValues.callPrice ?? 30000,
    offlineEnabled: formValues.offlineEnabled ?? false,
    offlinePrice: formValues.offlinePrice ?? 100000,
    schedule: formValues.schedule,
    holidays: formValues.holidays ?? [],
    detailedDescription: formValues.detailedDescription ?? '',
    preNotice: formValues.preNotice ?? '',
    settlementDraft: formValues.settlementDraft ?? null,
    schemaVersion: 2,
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
    careerHistory:
      trimmedCompanyName !== ''
        ? [`${trimmedCompanyName} 재직`]
        : ['경력 정보 업데이트 예정'],
    strengths: skillTags,
    avatarEmoji: 'M',
    methods: {
      chat: createMentoringMethodOption({
        type: 'chat',
        enabled: formValues.chatEnabled,
        price: formValues.chatPrice,
        durationMinutes: formValues.sessionDurationMinutes,
        legacyTimeRanges,
      }),
      call: createMentoringMethodOption({
        type: 'call',
        enabled: formValues.callEnabled,
        price: formValues.callPrice,
        durationMinutes: formValues.sessionDurationMinutes,
        legacyTimeRanges,
      }),
      offline: createMentoringMethodOption({
        type: 'offline',
        enabled: formValues.offlineEnabled,
        price: formValues.offlinePrice,
        durationMinutes: formValues.sessionDurationMinutes,
        legacyTimeRanges,
      }),
    },
    reviews: [
      {
        id: mentorId * 10,
        authorName: 'ZERO-ONE',
        rating: 5,
        createdAt: nowIso.slice(0, 10).replace(/-/g, '.'),
        method: 'chat',
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

  return {
    ...state,
    createdMentors: nextCreatedMentors,
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
      registerMentorProfile: (memberId, formValues) => {
        const state = get();
        const now = new Date().toISOString();
        const existingMentorId = state.mentorIdByMember[memberId];
        const mentorId = existingMentorId ?? state.nextMentorId;
        const nextMentor = toMentorProfile(mentorId, formValues, now);

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
                ? prevState.nextMentorId
                : prevState.nextMentorId + 1,
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
      version: 2,
      migrate: (persistedState, version) => {
        if (!persistedState) {
          return persistedState;
        }

        const typedState = persistedState as PersistedMentorDirectoryState;

        if (version < 2) {
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
