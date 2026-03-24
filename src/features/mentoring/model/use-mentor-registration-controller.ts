'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useForm, type UseFormReturn, useWatch } from 'react-hook-form';
import { ApiError } from '@/api/client/api-error';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { MENTOR_REGISTRATION_TOAST_MESSAGES } from '@/features/mentoring/const/mentor-registration-labels';
import { mentorDirectoryQueryKeys } from '@/features/mentoring/model/mentor-directory-query-keys';
import { hasMentorWritePermission } from '@/features/mentoring/model/mentor-permission';
import {
  getMentorPublicReadiness,
  MENTOR_PUBLIC_READINESS_STAGES,
} from '@/features/mentoring/model/mentor-public-readiness';
import { getMentorRegistrationDraftStorageKey } from '@/features/mentoring/model/mentor-registration-draft-storage';
import {
  buildMentoringTitleFromEntryOnboarding,
  isMentorRegistrationEntryFromList,
} from '@/features/mentoring/model/mentor-registration-entry-onboarding';
import { resolveMentorRegistrationGuardState } from '@/features/mentoring/model/mentor-registration-guard-state';
import {
  buildWelcomeChecklist,
  getChangedSections,
} from '@/features/mentoring/model/mentor-registration-preview';
import {
  getMentorRegistrationValidationDetails,
  resolveMentorRegistrationServerErrorTarget,
} from '@/features/mentoring/model/mentor-registration-server-error';
import {
  createDefaultMentorSettings,
  normalizeMentorCareerEntries,
} from '@/features/mentoring/model/mentor-settings';
import { useMarkMentorEntryOnboardingSeenMutation } from '@/features/mentoring/model/use-mark-mentor-entry-onboarding-seen-mutation';
import {
  useMentorEntryOnboardingStatusQuery,
  useMentorRegistrationOptionsQuery,
  useMyMentorSettingsQuery,
} from '@/features/mentoring/model/use-mentor-directory-query';
import { useMentorRegistrationPreviewModel } from '@/features/mentoring/model/use-mentor-registration-preview-model';
import { useMentorRegistrationPreviewPanel } from '@/features/mentoring/model/use-mentor-registration-preview-panel';
import { useUpsertMyMentorSettingsMutation } from '@/features/mentoring/model/use-upsert-my-mentor-settings-mutation';
import { usePhoneVerificationStatus } from '@/hooks/queries/use-phone-verification-status';
import { useToastStore } from '@/stores/use-toast-store';
import { useUserStore } from '@/stores/useUserStore';
import type { MentorProfile } from '@/types/mentoring/domain';
import { normalizeMentorMarkdownContent } from '@/types/mentoring/markdown';
import { type MentorRegistrationOptions } from '@/types/mentoring/registration-options';
import {
  type MentorRegistrationEntryOnboardingValues,
  type MentorRegistrationGuardState,
  type MentorRegistrationPersistedStepId,
  type MentorRegistrationPersistedPredefinedCoreKeyword,
  type MentorRegistrationPreviewHighlightSection,
  type MentorRegistrationStepId,
  type MentorRegistrationWelcomeOnboardingState,
  MENTOR_REGISTRATION_STEP_IDS,
  isMentorRegistrationPersistedStepId,
  normalizeMentorRegistrationStepId,
} from '@/types/mentoring/registration-view';
import {
  CONSULTING_DURATION_OPTIONS,
  CONTACT_COUNTRY_CODES,
  WEEKDAY_KEYS,
} from '@/types/mentoring/settings';
import {
  MENTORING_TITLE_MAX_LENGTH,
  createEmptyMentorScheduleDrafts,
  mentorRegistrationSchema,
  type MentorRegistrationFormInputValues,
  type MentorRegistrationFormValues,
} from '@/types/schemas/mentor-registration-schema';

const createDefaultFormValues = (): MentorRegistrationFormInputValues => ({
  ...createDefaultMentorSettings(),
  scheduleDrafts: createEmptyMentorScheduleDrafts(),
});

const DEFAULT_VALUES = createDefaultFormValues();
const MENTOR_REGISTRATION_DRAFT_FIELD_KEYS = Object.keys(
  DEFAULT_VALUES,
) as Array<keyof MentorRegistrationFormInputValues>;

const DIRTY_VALIDATION_OPTIONS = {
  shouldValidate: true,
  shouldDirty: true,
} as const;

const sanitizeDigits = (value: string) => value.replace(/\D/g, '');
const DEFAULT_MENTOR_REGISTRATION_STEP_ID =
  MENTOR_REGISTRATION_STEP_IDS.basicInformation;
const INVALID_MENTOR_SETTINGS_ERROR_CODE = 'MTR001';
const INVALID_CORE_KEYWORD_ERROR_CODE = 'MENTOR_OPTION_005';
const MENTORING_LIST_ROUTE = '/mentoring';
const getMentorDetailRoute = (mentorId: number) =>
  `${MENTORING_LIST_ROUTE}/${mentorId}`;

type MentorRegistrationSessionDraft = MentorRegistrationFormInputValues;

interface MentorRegistrationSessionDraftEnvelope {
  version: 2;
  values: MentorRegistrationSessionDraft;
  currentStepId?: MentorRegistrationPersistedStepId;
  sourceUpdatedAt?: string;
}

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

const normalizeDraftContactCountryCode = (
  value: unknown,
): MentorRegistrationFormInputValues['contactCountryCode'] | undefined => {
  if (
    typeof value !== 'string' ||
    !CONTACT_COUNTRY_CODES.includes(
      value as MentorRegistrationFormInputValues['contactCountryCode'],
    )
  ) {
    return undefined;
  }

  return value as MentorRegistrationFormInputValues['contactCountryCode'];
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

const readMentorRegistrationSessionDraft = (
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

const writeMentorRegistrationSessionDraft = ({
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

const clearMentorRegistrationSessionDraft = (memberId: number) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(
    getMentorRegistrationDraftStorageKey(memberId),
  );
};

const mergeMentorRegistrationFormValuesWithSessionDraft = ({
  baseValues,
  sessionDraftValues,
}: {
  baseValues: MentorRegistrationFormInputValues;
  sessionDraftValues: MentorRegistrationSessionDraft | undefined;
}): MentorRegistrationFormInputValues => {
  if (!sessionDraftValues) {
    return baseValues;
  }

  // Session drafts can outlive schema changes, so only restore values that
  // still match the current input contract.
  return {
    contactCountryCode:
      normalizeDraftContactCountryCode(sessionDraftValues.contactCountryCode) ??
      baseValues.contactCountryCode,
    contactPhone:
      normalizeDraftString(sessionDraftValues.contactPhone) ??
      baseValues.contactPhone,
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

const shouldRestoreSessionDraft = ({
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

const hasPersistableDraftChanges = ({
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

const shouldPersistSessionDraftState = ({
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

const getMentorRegistrationServerSnapshotKey = ({
  mentorId,
  updatedAt,
}: {
  mentorId: number;
  updatedAt: string;
}) => {
  return `${mentorId}:${updatedAt.trim()}`;
};

export interface MentorRegistrationControllerState {
  form: UseFormReturn<
    MentorRegistrationFormInputValues,
    unknown,
    MentorRegistrationFormValues
  >;
  registrationOptions: MentorRegistrationOptions;
  guardState: MentorRegistrationGuardState;
  memberId: number | undefined;
  isSaving: boolean;
  persistedPredefinedCoreKeywords: MentorRegistrationPersistedPredefinedCoreKeyword[];
  isGuideOpen: boolean;
  isPhoneVerificationModalOpen: boolean;
  isCancelModalOpen: boolean;
  isPreviewOpen: boolean;
  isResizing: boolean;
  formOverflowWidth: number;
  committedFormOverflowWidth: number;
  panelWidth: number;
  committedPanelWidth: number;
  panelOverflowWidth: number;
  committedPanelOverflowWidth: number;
  currentStepId: MentorRegistrationStepId;
  highlightedSections: MentorRegistrationPreviewHighlightSection[];
  previewMentor: MentorProfile;
  welcomeOnboarding: MentorRegistrationWelcomeOnboardingState | undefined;
  isEntryOnboardingOpen: boolean;
  isEntryOnboardingPending: boolean;
  entryOnboardingValues: MentorRegistrationEntryOnboardingValues;
  shouldRenderPhoneVerificationModal: boolean;
  saveBlockingMessage?: string;
}

export interface MentorRegistrationControllerRefs {
  previewLayoutRef: RefObject<HTMLDivElement>;
}

export interface MentorRegistrationControllerActions {
  onGuideOpenChange: (nextOpen: boolean) => void;
  onOpenGuide: () => void;
  onReopenEntryOnboarding: () => void;
  onPhoneVerificationModalOpenChange: (nextOpen: boolean) => void;
  onOpenPhoneVerification: () => void;
  onCancelModalOpenChange: (nextOpen: boolean) => void;
  onOpenPreview: () => void;
  onClosePreview: () => void;
  onPreviewResizeStart: (
    event: ReactPointerEvent<HTMLDivElement>,
    direction?: 'form-left' | 'left' | 'right',
  ) => void;
  onStepChange: (stepId: MentorRegistrationStepId) => void;
  onSave: (values: MentorRegistrationFormValues) => void;
  onCancel: () => void;
  onPhoneVerificationComplete: (phoneNumber: string) => void;
  onWelcomeModalConfirm: () => void;
  onWelcomeModalToEditAgain: () => void;
  onCompleteEntryOnboarding: (
    values: MentorRegistrationEntryOnboardingValues,
  ) => void;
  onSkipEntryOnboarding: () => void;
  onConfirmExitWithoutSaving: () => void;
}

export interface MentorRegistrationControllerViewModel {
  isReady: boolean;
}

export interface MentorRegistrationControllerResult {
  state: MentorRegistrationControllerState;
  refs: MentorRegistrationControllerRefs;
  actions: MentorRegistrationControllerActions;
  viewModel: MentorRegistrationControllerViewModel;
}

export const useMentorRegistrationController =
  (): MentorRegistrationControllerResult => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToastStore();
    const { isHydrated, isAuthenticated, memberId, data } = useAuthReady();
    const { profileImageUrl, nickname, memberName } = useUserStore();
    const {
      isVerified,
      phoneNumber: verifiedPhoneNumber,
      isLoading: isVerificationLoading,
      isError: isVerificationError,
      setVerified,
    } = usePhoneVerificationStatus(memberId ?? undefined);
    const canWriteMentorProfile = hasMentorWritePermission(data?.roleIds);
    const myMentorSettingsQuery = useMyMentorSettingsQuery(
      isHydrated &&
        isAuthenticated &&
        canWriteMentorProfile &&
        Boolean(memberId),
    );
    const mentorRegistrationOptionsQuery = useMentorRegistrationOptionsQuery(
      isHydrated && isAuthenticated && canWriteMentorProfile,
    );
    const upsertMyMentorSettingsMutation = useUpsertMyMentorSettingsMutation();
    const markMentorEntryOnboardingSeenMutation =
      useMarkMentorEntryOnboardingSeenMutation();
    const myMentorSettingsResult = myMentorSettingsQuery.data;
    const myMentorSettings =
      myMentorSettingsResult?.kind === 'found'
        ? myMentorSettingsResult
        : undefined;
    const isMentorSettingsKnownMissing =
      myMentorSettingsResult?.kind === 'not_found';
    const persistedPredefinedCoreKeywords =
      myMentorSettings?.savedCoreKeywords.reduce<
        MentorRegistrationPersistedPredefinedCoreKeyword[]
      >((accumulator, keyword) => {
        if (keyword.type !== 'PREDEFINED' || !keyword.code) {
          return accumulator;
        }

        if (
          accumulator.some((savedKeyword) => savedKeyword.code === keyword.code)
        ) {
          return accumulator;
        }

        return [
          ...accumulator,
          {
            code: keyword.code,
            label: keyword.label,
          },
        ];
      }, []) ?? [];
    const registrationOptions = mentorRegistrationOptionsQuery.data;
    const isEntryFromMentoringList =
      isMentorRegistrationEntryFromList(searchParams);
    const mentorEntryOnboardingStatusQuery =
      useMentorEntryOnboardingStatusQuery(
        isHydrated &&
          isAuthenticated &&
          canWriteMentorProfile &&
          Boolean(memberId) &&
          isEntryFromMentoringList,
      );

    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isPhoneVerificationModalOpen, setIsPhoneVerificationModalOpen] =
      useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isEntryOnboardingOpen, setIsEntryOnboardingOpen] = useState(false);
    const [isEntryOnboardingResolved, setIsEntryOnboardingResolved] =
      useState(false);
    const [currentStepId, setCurrentStepId] =
      useState<MentorRegistrationStepId>(DEFAULT_MENTOR_REGISTRATION_STEP_ID);
    const [welcomeOnboarding, setWelcomeOnboarding] =
      useState<MentorRegistrationWelcomeOnboardingState>();
    const [highlightedSections, setHighlightedSections] = useState<
      MentorRegistrationPreviewHighlightSection[]
    >([]);

    const {
      state: {
        isPreviewOpen,
        isResizing,
        formOverflowWidth,
        committedFormOverflowWidth,
        panelWidth,
        committedPanelWidth,
        panelOverflowWidth,
        committedPanelOverflowWidth,
      },
      refs: { previewLayoutRef },
      actions: previewPanelActions,
    } = useMentorRegistrationPreviewPanel();
    const prevPreviewFormValuesRef =
      useRef<MentorRegistrationFormValues | null>(null);
    const currentStepIdRef = useRef<MentorRegistrationStepId>(
      DEFAULT_MENTOR_REGISTRATION_STEP_ID,
    );
    const initializedDraftMemberIdRef = useRef<number | null>(null);
    const appliedServerSnapshotKeyRef = useRef<string | null>(null);
    const draftPersistenceBaseRef =
      useRef<MentorRegistrationFormInputValues>(DEFAULT_VALUES);
    const hasClientEditsRef = useRef(false);
    const entryOnboardingInitializedRef = useRef(false);
    const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

    const form = useForm<
      MentorRegistrationFormInputValues,
      unknown,
      MentorRegistrationFormValues
    >({
      resolver: zodResolver(mentorRegistrationSchema),
      mode: 'onChange',
      reValidateMode: 'onChange',
      defaultValues: DEFAULT_VALUES,
    });

    const {
      clearErrors,
      control,
      getFieldState,
      getValues,
      reset,
      setError,
      setValue,
    } = form;

    const applyFormSnapshot = useCallback(
      ({
        baseValues,
        sessionDraftEnvelope,
        restoreSessionDraft,
        serverSnapshotKey,
        draftMemberId,
      }: {
        baseValues: MentorRegistrationFormInputValues;
        sessionDraftEnvelope?: MentorRegistrationSessionDraftEnvelope;
        restoreSessionDraft: boolean;
        serverSnapshotKey: string | null;
        draftMemberId: number | null;
      }) => {
        const mergedValues = mergeMentorRegistrationFormValuesWithSessionDraft({
          baseValues,
          sessionDraftValues: restoreSessionDraft
            ? sessionDraftEnvelope?.values
            : undefined,
        });
        const hasRestoredValueChanges =
          restoreSessionDraft &&
          hasPersistableDraftChanges({
            baseValues,
            nextValues: mergedValues,
          });
        const hasRestoredStepChanges =
          restoreSessionDraft &&
          sessionDraftEnvelope?.currentStepId !== undefined &&
          sessionDraftEnvelope.currentStepId !==
            DEFAULT_MENTOR_REGISTRATION_STEP_ID;
        const hasRestoredDraftChanges =
          hasRestoredValueChanges || hasRestoredStepChanges;
        const nextStepId =
          hasRestoredDraftChanges && sessionDraftEnvelope?.currentStepId
            ? normalizeMentorRegistrationStepId(
                sessionDraftEnvelope.currentStepId,
              )
            : DEFAULT_MENTOR_REGISTRATION_STEP_ID;

        reset(mergedValues);
        draftPersistenceBaseRef.current = baseValues;
        hasClientEditsRef.current = hasRestoredDraftChanges;
        initializedDraftMemberIdRef.current = draftMemberId;
        appliedServerSnapshotKeyRef.current = serverSnapshotKey;
        currentStepIdRef.current = nextStepId;
        setCurrentStepId(nextStepId);
      },
      [reset],
    );

    useEffect(() => {
      currentStepIdRef.current = currentStepId;
    }, [currentStepId]);

    useEffect(() => {
      setValue('contactPhone', sanitizeDigits(verifiedPhoneNumber ?? ''), {
        shouldValidate: true,
      });
    }, [setValue, verifiedPhoneNumber]);

    useEffect(() => {
      if (!myMentorSettings) {
        appliedServerSnapshotKeyRef.current = null;

        return;
      }

      const settings = myMentorSettings.settings;
      const serverSnapshotKey = getMentorRegistrationServerSnapshotKey({
        mentorId: myMentorSettings.mentorId,
        updatedAt: settings.updatedAt,
      });

      if (appliedServerSnapshotKeyRef.current === serverSnapshotKey) {
        return;
      }

      if (hasClientEditsRef.current) {
        return;
      }

      const baseValues: MentorRegistrationFormInputValues = {
        ...settings,
        updatedAt: settings.updatedAt,
      };
      const sessionDraftEnvelope =
        memberId !== undefined
          ? readMentorRegistrationSessionDraft(memberId)
          : undefined;
      const canRestoreSessionDraft = shouldRestoreSessionDraft({
        sessionDraft: sessionDraftEnvelope,
        sourceUpdatedAt: settings.updatedAt,
      });

      applyFormSnapshot({
        baseValues,
        sessionDraftEnvelope,
        restoreSessionDraft: canRestoreSessionDraft,
        serverSnapshotKey,
        draftMemberId: memberId ?? null,
      });
    }, [applyFormSnapshot, memberId, myMentorSettings]);

    useEffect(() => {
      if (
        !isHydrated ||
        !isAuthenticated ||
        !canWriteMentorProfile ||
        !memberId ||
        myMentorSettingsQuery.isLoading ||
        myMentorSettings ||
        !isMentorSettingsKnownMissing
      ) {
        return;
      }

      if (initializedDraftMemberIdRef.current === memberId) {
        return;
      }

      const sessionDraftEnvelope = readMentorRegistrationSessionDraft(memberId);
      applyFormSnapshot({
        baseValues: createDefaultFormValues(),
        sessionDraftEnvelope,
        restoreSessionDraft: Boolean(sessionDraftEnvelope),
        serverSnapshotKey: null,
        draftMemberId: memberId,
      });
    }, [
      canWriteMentorProfile,
      isAuthenticated,
      isHydrated,
      isMentorSettingsKnownMissing,
      memberId,
      myMentorSettings,
      myMentorSettingsQuery.isLoading,
      applyFormSnapshot,
    ]);

    useEffect(() => {
      if (
        !isHydrated ||
        !isAuthenticated ||
        !canWriteMentorProfile ||
        !memberId ||
        myMentorSettingsQuery.isLoading
      ) {
        return;
      }

      let persistTimer: ReturnType<typeof setTimeout> | null = null;
      const persistDraft = () => {
        const currentValues = getValues();
        const shouldPersist = shouldPersistSessionDraftState({
          baseValues: draftPersistenceBaseRef.current,
          nextValues: currentValues,
          currentStepId: currentStepIdRef.current,
        });

        if (!shouldPersist) {
          clearMentorRegistrationSessionDraft(memberId);

          return;
        }

        writeMentorRegistrationSessionDraft({
          memberId,
          values: currentValues,
          currentStepId: currentStepIdRef.current,
        });
      };

      const subscription = form.watch(
        (_values: unknown, info: { type?: string }) => {
          if (info.type === undefined) {
            return;
          }

          hasClientEditsRef.current = true;

          if (persistTimer !== null) {
            clearTimeout(persistTimer);
          }

          persistTimer = setTimeout(() => {
            persistDraft();
          }, 180);
        },
      );

      return () => {
        if (persistTimer !== null) {
          clearTimeout(persistTimer);
        }
        subscription.unsubscribe();
      };
    }, [
      canWriteMentorProfile,
      form,
      getValues,
      isAuthenticated,
      isHydrated,
      memberId,
      myMentorSettingsQuery.isLoading,
    ]);

    useEffect(() => {
      if (
        !isHydrated ||
        !isAuthenticated ||
        !canWriteMentorProfile ||
        !memberId ||
        myMentorSettingsQuery.isLoading
      ) {
        return;
      }

      const currentValues = getValues();
      const shouldPersist = shouldPersistSessionDraftState({
        baseValues: draftPersistenceBaseRef.current,
        nextValues: currentValues,
        currentStepId,
      });

      if (!shouldPersist) {
        clearMentorRegistrationSessionDraft(memberId);

        return;
      }

      writeMentorRegistrationSessionDraft({
        memberId,
        values: currentValues,
        currentStepId,
      });
    }, [
      canWriteMentorProfile,
      currentStepId,
      getValues,
      isAuthenticated,
      isHydrated,
      memberId,
      myMentorSettingsQuery.isLoading,
    ]);

    useEffect(() => {
      entryOnboardingInitializedRef.current = false;
      setIsEntryOnboardingResolved(!isEntryFromMentoringList);
      setIsEntryOnboardingOpen(false);
    }, [isEntryFromMentoringList, memberId]);

    useEffect(() => {
      if (entryOnboardingInitializedRef.current) {
        return;
      }

      if (
        !isHydrated ||
        !isAuthenticated ||
        !memberId ||
        !canWriteMentorProfile ||
        !isEntryFromMentoringList
      ) {
        return;
      }

      if (
        mentorEntryOnboardingStatusQuery.isLoading ||
        mentorEntryOnboardingStatusQuery.isFetching
      ) {
        return;
      }

      entryOnboardingInitializedRef.current = true;
      setIsEntryOnboardingResolved(true);

      if (mentorEntryOnboardingStatusQuery.data?.show === true) {
        setIsEntryOnboardingOpen(true);
      }
    }, [
      canWriteMentorProfile,
      isAuthenticated,
      isEntryFromMentoringList,
      isHydrated,
      memberId,
      mentorEntryOnboardingStatusQuery.data?.show,
      mentorEntryOnboardingStatusQuery.isFetching,
      mentorEntryOnboardingStatusQuery.isLoading,
    ]);

    const shouldSubscribePreviewFields = isPreviewOpen || isEntryOnboardingOpen;
    useWatch({
      control,
      disabled: !shouldSubscribePreviewFields,
    });
    const watchedSkillTags = useWatch({
      control,
      name: 'skillTags',
    });
    // useWatch keeps the controller reactive while preview/onboarding is open,
    // but the rendered snapshot must come from getValues() so cached reset
    // values are reflected on the first preview open as well.
    const previewFieldValues = getValues();

    const {
      selectedRegistrationOptions,
      jobTitleLabelMap,
      entryOnboardingValues,
      previewFormValues,
      previewMentor,
    } = useMentorRegistrationPreviewModel({
      registrationOptions,
      persistedPredefinedCoreKeywords,
      myMentorId: myMentorSettings?.mentorId,
      memberId,
      profileImageUrl,
      nickname,
      memberName,
      fields: {
        contactCountryCode: previewFieldValues.contactCountryCode,
        contactPhone: previewFieldValues.contactPhone,
        contactEmail: previewFieldValues.contactEmail,
        mentoringTitle: previewFieldValues.mentoringTitle,
        appealLine: previewFieldValues.appealLine,
        jobGroup: previewFieldValues.jobGroup,
        jobTitle: previewFieldValues.jobTitle,
        careerYears: previewFieldValues.careerYears,
        careerEntries: normalizeMentorCareerEntries(
          previewFieldValues.careerEntries,
        ),
        skillTags: previewFieldValues.skillTags ?? [],
        companyCategory: previewFieldValues.companyCategory,
        companyName: previewFieldValues.companyName,
        hideCompanyName: previewFieldValues.hideCompanyName,
        listVisible: previewFieldValues.listVisible,
        maxParticipants: previewFieldValues.maxParticipants,
        noteEnabled: previewFieldValues.noteEnabled,
        notePrice: previewFieldValues.notePrice,
        simpleEnabled: previewFieldValues.simpleEnabled,
        simplePrice: previewFieldValues.simplePrice,
        deepEnabled: previewFieldValues.deepEnabled,
        deepPrice: previewFieldValues.deepPrice,
        deepDurationMinutes: previewFieldValues.deepDurationMinutes,
        offlineEnabled: previewFieldValues.offlineEnabled,
        offlinePrice: previewFieldValues.offlinePrice,
        offlineDurationMinutes: previewFieldValues.offlineDurationMinutes,
        schedule: previewFieldValues.schedule,
        scheduleDrafts:
          previewFieldValues.scheduleDrafts ??
          createEmptyMentorScheduleDrafts(),
        detailedDescription: previewFieldValues.detailedDescription,
        interviewQuestions: previewFieldValues.interviewQuestions,
        preNotice: previewFieldValues.preNotice,
        updatedAt: previewFieldValues.updatedAt,
      },
    });

    useEffect(() => {
      if (getFieldState('skillTags').error?.type !== 'server') {
        return;
      }

      clearErrors('skillTags');
    }, [clearErrors, getFieldState, watchedSkillTags]);

    useEffect(() => {
      if (!isPreviewOpen) {
        prevPreviewFormValuesRef.current = previewFormValues;

        return;
      }

      const prev = prevPreviewFormValuesRef.current;
      prevPreviewFormValuesRef.current = previewFormValues;

      if (prev === null) {
        return;
      }

      const changed = getChangedSections(prev, previewFormValues);
      if (changed.length === 0) {
        return;
      }

      setHighlightedSections(changed);

      if (highlightTimerRef.current !== null) {
        clearTimeout(highlightTimerRef.current);
      }

      highlightTimerRef.current = setTimeout(() => {
        setHighlightedSections([]);
        highlightTimerRef.current = null;
      }, 1400);
    }, [isPreviewOpen, previewFormValues]);

    useEffect(() => {
      return () => {
        if (highlightTimerRef.current !== null) {
          clearTimeout(highlightTimerRef.current);
        }
      };
    }, []);

    const isMentorSettingsLoading =
      isHydrated &&
      isAuthenticated &&
      canWriteMentorProfile &&
      myMentorSettingsQuery.isLoading;
    const isRegistrationOptionsLoading =
      isHydrated &&
      isAuthenticated &&
      canWriteMentorProfile &&
      mentorRegistrationOptionsQuery.isLoading;
    const isMentorSettingsError =
      isHydrated &&
      isAuthenticated &&
      canWriteMentorProfile &&
      myMentorSettingsQuery.isError;
    const isRegistrationOptionsError =
      isHydrated &&
      isAuthenticated &&
      canWriteMentorProfile &&
      mentorRegistrationOptionsQuery.isError;

    const guardState: MentorRegistrationGuardState =
      resolveMentorRegistrationGuardState({
        isHydrated,
        isAuthenticated,
        canWriteMentorProfile,
        isMentorSettingsLoading,
        isRegistrationOptionsLoading,
        isMentorSettingsError,
        isRegistrationOptionsError,
        isVerificationLoading,
        isVerificationError,
        isVerified,
      });
    const isEntryOnboardingPending =
      guardState === 'ready' &&
      isEntryFromMentoringList &&
      !isEntryOnboardingResolved;
    const normalizedVerifiedPhone = sanitizeDigits(verifiedPhoneNumber ?? '');
    const saveBlockingMessage =
      guardState === 'ready' && normalizedVerifiedPhone.length === 0
        ? '본인인증된 전화번호를 다시 확인해주세요.'
        : undefined;

    const handleSave = (values: MentorRegistrationFormValues) => {
      if (upsertMyMentorSettingsMutation.isPending) {
        return;
      }

      if (!memberId) {
        showToast(
          MENTOR_REGISTRATION_TOAST_MESSAGES.memberInfoMissing,
          'error',
        );

        return;
      }

      if (isVerificationLoading) {
        showToast(
          MENTOR_REGISTRATION_TOAST_MESSAGES.verificationLoading,
          'error',
        );

        return;
      }

      if (isVerificationError) {
        showToast(
          MENTOR_REGISTRATION_TOAST_MESSAGES.verificationError,
          'error',
        );

        return;
      }

      if (myMentorSettingsQuery.isError) {
        showToast(
          MENTOR_REGISTRATION_TOAST_MESSAGES.mySettingsLoadError,
          'error',
        );

        return;
      }

      if (!isVerified) {
        showToast(
          MENTOR_REGISTRATION_TOAST_MESSAGES.verificationRequired,
          'error',
        );
        setIsPhoneVerificationModalOpen(true);

        return;
      }

      if (!normalizedVerifiedPhone) {
        showToast(
          MENTOR_REGISTRATION_TOAST_MESSAGES.verifiedPhoneMissing,
          'error',
        );
        setIsPhoneVerificationModalOpen(true);

        return;
      }

      const finalizedValues: MentorRegistrationFormValues = {
        ...values,
        contactPhone: normalizedVerifiedPhone,
        updatedAt: values.updatedAt,
      };
      if (!registrationOptions) {
        showToast(MENTOR_REGISTRATION_TOAST_MESSAGES.optionsLoadError, 'error');

        return;
      }

      const persistedCareerEntries = normalizeMentorCareerEntries(
        finalizedValues.careerEntries,
      );
      clearErrors('skillTags');

      upsertMyMentorSettingsMutation.mutate(
        {
          values: finalizedValues,
          registrationOptions,
          persistedPredefinedCoreKeywords,
        },
        {
          onSuccess: (result) => {
            if (memberId) {
              clearMentorRegistrationSessionDraft(memberId);
            }

            const persistedValues: MentorRegistrationFormInputValues = {
              ...getValues(),
              ...finalizedValues,
              careerEntries: persistedCareerEntries,
              updatedAt: result.updatedAt || finalizedValues.updatedAt,
            };

            reset(persistedValues);
            draftPersistenceBaseRef.current = persistedValues;
            hasClientEditsRef.current = false;
            initializedDraftMemberIdRef.current = memberId;
            appliedServerSnapshotKeyRef.current = null;
            clearErrors('skillTags');

            const mentorId = result.mentorId;
            const savedPreviewMentor: MentorProfile = {
              ...previewMentor,
              id: mentorId,
              mentorSettings: {
                ...(previewMentor.mentorSettings ??
                  createDefaultMentorSettings()),
                ...finalizedValues,
                careerEntries: persistedCareerEntries,
                updatedAt: result.updatedAt || finalizedValues.updatedAt,
              },
            };
            queryClient
              .invalidateQueries({
                queryKey: mentorDirectoryQueryKeys.detail(mentorId),
              })
              .catch((): undefined => undefined);
            queryClient
              .invalidateQueries({
                queryKey: mentorDirectoryQueryKeys.lists(),
              })
              .catch((): undefined => undefined);

            const savedPublicReadiness =
              getMentorPublicReadiness(savedPreviewMentor);
            const checklist = buildWelcomeChecklist(savedPreviewMentor, {
              settlementAccountReady: savedPublicReadiness.isApplicationReady,
            });
            const isDetailPreparing =
              savedPublicReadiness.stage ===
              MENTOR_PUBLIC_READINESS_STAGES.detailPreparing;
            const isApplyReady =
              savedPublicReadiness.stage ===
              MENTOR_PUBLIC_READINESS_STAGES.applyReady;
            setWelcomeOnboarding({
              mentorId,
              title: isApplyReady
                ? '저장은 완료되었고 신청 가능 상태로 반영됩니다'
                : isDetailPreparing
                  ? '저장은 완료되었지만 공개 준비가 더 필요합니다'
                  : '✅ 저장은 완료되었고 상세 공개 준비 상태로 반영됩니다',
              description: finalizedValues.listVisible
                ? isApplyReady
                  ? '목록 공개가 켜져 있으며 저장된 멘토링 정보가 신청 가능 상태로 반영됩니다.'
                  : isDetailPreparing
                    ? '현재 목록 공개는 켜져 있지만, 멘토 소개를 포함한 공개 정보를 더 입력해야 상세 공개 기준을 충족할 수 있습니다.'
                    : '현재 저장 상태는 상세 공개 기준을 충족한 준비 단계입니다. 멘티 신청은 아직 열리지 않습니다.'
                : isApplyReady
                  ? '현재 멘토링 목록 비노출 상태입니다. 목록 공개를 켜면 저장된 프로필이 신청 가능 상태로 노출됩니다.'
                  : isDetailPreparing
                    ? '현재 멘토링 목록 비노출 상태입니다. 공개 준비를 계속 진행한 뒤 목록 공개를 켜면 노출을 이어갈 수 있습니다.'
                    : '현재 멘토링 목록 비노출 상태입니다. 목록 공개를 켜면 상세 공개 준비 상태로 노출되며, 멘티 신청은 아직 열리지 않습니다.',
              isApplicationReady: savedPublicReadiness.isApplicationReady,
              checklist,
            });
          },
          onError: (error) => {
            if (
              error instanceof ApiError &&
              error.errorCode === INVALID_CORE_KEYWORD_ERROR_CODE
            ) {
              mentorRegistrationOptionsQuery
                .refetch()
                .catch((): undefined => undefined);
              setError('skillTags', {
                type: 'server',
                message:
                  MENTOR_REGISTRATION_TOAST_MESSAGES.invalidCoreKeywordSelection,
              });
              currentStepIdRef.current =
                MENTOR_REGISTRATION_STEP_IDS.mentorInformation;
              setCurrentStepId(MENTOR_REGISTRATION_STEP_IDS.mentorInformation);
              showToast(
                MENTOR_REGISTRATION_TOAST_MESSAGES.invalidCoreKeywordSelection,
                'error',
              );

              return;
            }

            if (
              error instanceof ApiError &&
              error.errorCode === INVALID_MENTOR_SETTINGS_ERROR_CODE
            ) {
              const validationDetails = getMentorRegistrationValidationDetails(
                error.detail,
              );

              if (validationDetails.length > 0) {
                let nextStepId: MentorRegistrationStepId | undefined;

                validationDetails.forEach(
                  ({ paramName, validationMessage }) => {
                    const { fieldPath, stepId } =
                      resolveMentorRegistrationServerErrorTarget(paramName);

                    if (fieldPath) {
                      setError(fieldPath, {
                        type: 'server',
                        message: validationMessage,
                      });
                    }

                    if (!nextStepId && stepId) {
                      nextStepId = stepId;
                    }
                  },
                );

                if (nextStepId) {
                  currentStepIdRef.current = nextStepId;
                  setCurrentStepId(nextStepId);
                }

                showToast(validationDetails[0].validationMessage, 'error');

                return;
              }

              showToast(error.message, 'error');

              return;
            }

            showToast(
              '멘토링 설정 저장에 실패했습니다. 잠시 후 다시 시도해주세요.',
              'error',
            );
          },
        },
      );
    };

    const handleCancel = () => {
      if (upsertMyMentorSettingsMutation.isPending) {
        return;
      }

      if (
        shouldPersistSessionDraftState({
          baseValues: draftPersistenceBaseRef.current,
          nextValues: getValues(),
          currentStepId: currentStepIdRef.current,
        })
      ) {
        setIsCancelModalOpen(true);

        return;
      }

      if (memberId) {
        clearMentorRegistrationSessionDraft(memberId);
      }
      router.push(MENTORING_LIST_ROUTE);
    };

    const handlePhoneVerificationComplete = (phoneNumber: string) => {
      setVerified(phoneNumber);
      setValue('contactPhone', sanitizeDigits(phoneNumber), {
        shouldValidate: true,
      });
      setIsPhoneVerificationModalOpen(false);
      showToast(
        MENTOR_REGISTRATION_TOAST_MESSAGES.verificationCompleted,
        'success',
      );
    };

    const handleWelcomeModalConfirm = () => {
      const nextRoute =
        welcomeOnboarding?.mentorId && getValues('listVisible')
          ? getMentorDetailRoute(welcomeOnboarding.mentorId)
          : MENTORING_LIST_ROUTE;

      router.push(nextRoute);
    };

    const handleWelcomeModalToEditAgain = () => {
      setWelcomeOnboarding(undefined);
    };

    const handleCompleteEntryOnboarding = (
      values: MentorRegistrationEntryOnboardingValues,
    ) => {
      const normalizedAppealLine = values.appealLine.trim();
      const jobTitleLabel =
        jobTitleLabelMap.get(values.jobTitle) ?? values.jobTitle;
      const autoMentoringTitle = buildMentoringTitleFromEntryOnboarding(
        jobTitleLabel,
        MENTORING_TITLE_MAX_LENGTH,
      );

      setValue('jobGroup', values.jobGroup, DIRTY_VALIDATION_OPTIONS);
      setValue('jobTitle', values.jobTitle, DIRTY_VALIDATION_OPTIONS);
      setValue('careerYears', values.careerYears, DIRTY_VALIDATION_OPTIONS);
      setValue('appealLine', normalizedAppealLine, DIRTY_VALIDATION_OPTIONS);

      if (!getValues('mentoringTitle')?.trim() && autoMentoringTitle) {
        setValue(
          'mentoringTitle',
          autoMentoringTitle,
          DIRTY_VALIDATION_OPTIONS,
        );
      }

      if (!markMentorEntryOnboardingSeenMutation.isPending) {
        markMentorEntryOnboardingSeenMutation.mutate();
      }
      setIsEntryOnboardingOpen(false);
      showToast(
        MENTOR_REGISTRATION_TOAST_MESSAGES.entryOnboardingCompleted,
        'success',
      );
    };

    const handleSkipEntryOnboarding = () => {
      if (!markMentorEntryOnboardingSeenMutation.isPending) {
        markMentorEntryOnboardingSeenMutation.mutate();
      }
      setIsEntryOnboardingOpen(false);
    };

    const handleReopenEntryOnboarding = () => {
      setIsEntryOnboardingOpen(true);
    };

    const handleStepChange = (stepId: MentorRegistrationStepId) => {
      const normalizedStepId = normalizeMentorRegistrationStepId(stepId);

      hasClientEditsRef.current =
        hasClientEditsRef.current ||
        normalizedStepId !== DEFAULT_MENTOR_REGISTRATION_STEP_ID;
      setCurrentStepId(normalizedStepId);
    };

    return {
      state: {
        form,
        registrationOptions: selectedRegistrationOptions,
        guardState,
        memberId,
        isSaving: upsertMyMentorSettingsMutation.isPending,
        persistedPredefinedCoreKeywords,
        isGuideOpen,
        isPhoneVerificationModalOpen,
        isCancelModalOpen,
        isPreviewOpen,
        isResizing,
        formOverflowWidth,
        committedFormOverflowWidth,
        panelWidth,
        committedPanelWidth,
        panelOverflowWidth,
        committedPanelOverflowWidth,
        currentStepId,
        highlightedSections,
        previewMentor,
        welcomeOnboarding,
        isEntryOnboardingOpen,
        isEntryOnboardingPending,
        entryOnboardingValues,
        shouldRenderPhoneVerificationModal: Boolean(memberId),
        saveBlockingMessage,
      } satisfies MentorRegistrationControllerState,
      refs: {
        previewLayoutRef,
      } satisfies MentorRegistrationControllerRefs,
      actions: {
        onGuideOpenChange: setIsGuideOpen,
        onOpenGuide: () => setIsGuideOpen(true),
        onReopenEntryOnboarding: handleReopenEntryOnboarding,
        onPhoneVerificationModalOpenChange: setIsPhoneVerificationModalOpen,
        onOpenPhoneVerification: () => setIsPhoneVerificationModalOpen(true),
        onCancelModalOpenChange: setIsCancelModalOpen,
        onOpenPreview: previewPanelActions.openPreview,
        onClosePreview: previewPanelActions.closePreview,
        onPreviewResizeStart: previewPanelActions.onPreviewResizeStart,
        onStepChange: handleStepChange,
        onSave: handleSave,
        onCancel: handleCancel,
        onPhoneVerificationComplete: handlePhoneVerificationComplete,
        onWelcomeModalConfirm: handleWelcomeModalConfirm,
        onWelcomeModalToEditAgain: handleWelcomeModalToEditAgain,
        onCompleteEntryOnboarding: handleCompleteEntryOnboarding,
        onSkipEntryOnboarding: handleSkipEntryOnboarding,
        onConfirmExitWithoutSaving: () => {
          if (upsertMyMentorSettingsMutation.isPending) {
            return;
          }

          if (memberId) {
            clearMentorRegistrationSessionDraft(memberId);
          }
          router.push(MENTORING_LIST_ROUTE);
        },
      } satisfies MentorRegistrationControllerActions,
      viewModel: {
        isReady: guardState === 'ready',
      } satisfies MentorRegistrationControllerViewModel,
    };
  };
