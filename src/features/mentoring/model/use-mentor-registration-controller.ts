'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { MENTOR_REGISTRATION_TOAST_MESSAGES } from '@/features/mentoring/const/mentor-registration-labels';
import { hasMentorWritePermission } from '@/features/mentoring/model/mentor-permission';
import {
  buildMentoringTitleFromEntryOnboarding,
  hasSeenMentorRegistrationEntryOnboarding,
  isMentorRegistrationEntryFromList,
  markMentorRegistrationEntryOnboardingAsSeen,
} from '@/features/mentoring/model/mentor-registration-entry-onboarding';
import { resolveMentorRegistrationGuardState } from '@/features/mentoring/model/mentor-registration-guard-state';
import {
  buildPreviewMentorProfile,
  buildWelcomeChecklist,
  getChangedSections,
  toDurationMinutes,
  toSafeInteger,
} from '@/features/mentoring/model/mentor-registration-preview';
import { createDefaultMentorSettings } from '@/features/mentoring/model/mentor-settings';
import {
  useMentorRegistrationOptionsQuery,
  useMyMentorSettingsQuery,
} from '@/features/mentoring/model/use-mentor-directory-query';
import { useMentorRegistrationPreviewPanel } from '@/features/mentoring/model/use-mentor-registration-preview-panel';
import { useUpsertMyMentorSettingsMutation } from '@/features/mentoring/model/use-upsert-my-mentor-settings-mutation';
import { usePhoneVerificationStatus } from '@/features/phone-verification/model/use-phone-verification-status';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useToastStore } from '@/stores/use-toast-store';
import { useUserStore } from '@/stores/useUserStore';
import type { MentorProfile } from '@/types/mentoring/domain';
import { type MentorRegistrationOptions } from '@/types/mentoring/registration-options';
import {
  type MentorRegistrationEntryOnboardingValues,
  type MentorRegistrationGuardState,
  type MentorRegistrationPreviewHighlightSection,
  type MentorRegistrationWelcomeOnboardingState,
} from '@/types/mentoring/registration-view';
import { type MentorSettlementDraft } from '@/types/mentoring/settings';
import {
  MENTORING_TITLE_MAX_LENGTH,
  mentorRegistrationSchema,
  type MentorRegistrationFormInputValues,
  type MentorRegistrationFormValues,
} from '@/types/schemas/mentor-registration-schema';

const DEFAULT_VALUES: MentorRegistrationFormInputValues = {
  ...createDefaultMentorSettings(),
  preNotice: '',
};

const DIRTY_VALIDATION_OPTIONS = {
  shouldValidate: true,
  shouldDirty: true,
} as const;
const EMPTY_REGISTRATION_OPTIONS: MentorRegistrationOptions = {
  maxCoreKeywordCount: 5,
  jobGroups: [],
  jobTitles: [],
  careers: [],
  coreKeywords: [],
};

const sanitizeDigits = (value: string) => value.replace(/\D/g, '');

export interface MentorRegistrationControllerState {
  form: UseFormReturn<
    MentorRegistrationFormInputValues,
    unknown,
    MentorRegistrationFormValues
  >;
  registrationOptions: MentorRegistrationOptions;
  guardState: MentorRegistrationGuardState;
  memberId: number | undefined;
  isGuideOpen: boolean;
  isPhoneVerificationModalOpen: boolean;
  isCancelModalOpen: boolean;
  isSettlementModalOpen: boolean;
  isPreviewOpen: boolean;
  isResizing: boolean;
  panelWidth: number;
  committedPanelWidth: number;
  highlightedSections: MentorRegistrationPreviewHighlightSection[];
  previewMentor: MentorProfile;
  settlementDraft: MentorSettlementDraft | undefined;
  welcomeOnboarding: MentorRegistrationWelcomeOnboardingState | undefined;
  isEntryOnboardingOpen: boolean;
  entryOnboardingValues: MentorRegistrationEntryOnboardingValues;
  shouldRenderPhoneVerificationModal: boolean;
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
  onSettlementModalOpenChange: (nextOpen: boolean) => void;
  onOpenPreview: () => void;
  onClosePreview: () => void;
  onPreviewResizeStart: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onSave: (values: MentorRegistrationFormValues) => void;
  onCancel: () => void;
  onPhoneVerificationComplete: (phoneNumber: string) => void;
  onSettlementSubmit: (draft: MentorSettlementDraft) => void;
  onWelcomeModalToMentorPage: () => void;
  onWelcomeModalToRequestPage: () => void;
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
    const myMentorSettingsResult = myMentorSettingsQuery.data;
    const myMentorSettings =
      myMentorSettingsResult?.kind === 'found'
        ? myMentorSettingsResult
        : undefined;
    const registrationOptions = mentorRegistrationOptionsQuery.data;
    const isEntryFromMentoringList =
      isMentorRegistrationEntryFromList(searchParams);

    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isPhoneVerificationModalOpen, setIsPhoneVerificationModalOpen] =
      useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
    const [isEntryOnboardingOpen, setIsEntryOnboardingOpen] = useState(false);
    const [welcomeOnboarding, setWelcomeOnboarding] =
      useState<MentorRegistrationWelcomeOnboardingState>();
    const [highlightedSections, setHighlightedSections] = useState<
      MentorRegistrationPreviewHighlightSection[]
    >([]);

    const {
      state: {
        isPreviewOpen,
        isResizing,
        panelWidth,
        committedPanelWidth,
      },
      refs: { previewLayoutRef },
      actions: previewPanelActions,
    } = useMentorRegistrationPreviewPanel();
    const prevPreviewFormValuesRef =
      useRef<MentorRegistrationFormValues | null>(null);
    const initializedMentorIdRef = useRef<number | null>(null);
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
      defaultValues: DEFAULT_VALUES,
    });

    const {
      getValues,
      watch,
      setValue,
      reset,
      formState: { isDirty },
    } = form;

    useEffect(() => {
      setValue('contactPhone', sanitizeDigits(verifiedPhoneNumber ?? ''), {
        shouldValidate: true,
      });
    }, [setValue, verifiedPhoneNumber]);

    useEffect(() => {
      if (!myMentorSettings) {
        initializedMentorIdRef.current = null;

        return;
      }
      if (initializedMentorIdRef.current === myMentorSettings.mentorId) {
        return;
      }

      initializedMentorIdRef.current = myMentorSettings.mentorId;
      const settings = myMentorSettings.settings;
      reset({
        ...settings,
        updatedAt: settings.updatedAt || new Date().toISOString(),
      });
    }, [myMentorSettings, reset]);

    useEffect(() => {
      if (entryOnboardingInitializedRef.current) {
        return;
      }

      if (!isHydrated || !isAuthenticated || !memberId) {
        return;
      }

      if (!isEntryFromMentoringList) {
        return;
      }

      if (hasSeenMentorRegistrationEntryOnboarding(memberId)) {
        entryOnboardingInitializedRef.current = true;

        return;
      }

      entryOnboardingInitializedRef.current = true;
      setIsEntryOnboardingOpen(true);
    }, [
      isAuthenticated,
      isEntryFromMentoringList,
      isHydrated,
      memberId,
    ]);

    const settlementDraft = watch('settlementDraft');
    const mentoringTitle = watch('mentoringTitle');
    const appealLine = watch('appealLine');
    const jobGroup = watch('jobGroup');
    const jobTitle = watch('jobTitle');
    const careerYears = watch('careerYears');
    const skillTags = watch('skillTags');
    const companyCategory = watch('companyCategory');
    const companyName = watch('companyName');
    const hideCompanyName = watch('hideCompanyName');
    const detailedDescription = watch('detailedDescription');
    const interviewQuestions = watch('interviewQuestions');
    const preNotice = watch('preNotice');
    const notePrice = watch('notePrice');
    const simplePrice = watch('simplePrice');
    const deepPrice = watch('deepPrice');
    const offlinePrice = watch('offlinePrice');
    const deepDurationMinutes = watch('deepDurationMinutes');
    const offlineDurationMinutes = watch('offlineDurationMinutes');
    const noteEnabled = watch('noteEnabled');
    const simpleEnabled = watch('simpleEnabled');
    const deepEnabled = watch('deepEnabled');
    const offlineEnabled = watch('offlineEnabled');
    const contactCountryCode = watch('contactCountryCode');
    const contactPhone = watch('contactPhone');
    const contactEmail = watch('contactEmail');
    const maxParticipants = watch('maxParticipants');
    const schedule = watch('schedule');
    const selectedRegistrationOptions =
      registrationOptions ?? EMPTY_REGISTRATION_OPTIONS;
    const jobGroupLabelMap = useMemo(() => {
      return new Map(
        selectedRegistrationOptions.jobGroups.map((item) => [
          item.code,
          item.label,
        ]),
      );
    }, [selectedRegistrationOptions.jobGroups]);
    const jobTitleLabelMap = useMemo(() => {
      return new Map(
        selectedRegistrationOptions.jobTitles.map((item) => [
          item.code,
          item.label,
        ]),
      );
    }, [selectedRegistrationOptions.jobTitles]);
    const careerLabelMap = useMemo(() => {
      return new Map(
        selectedRegistrationOptions.careers.map((item) => [item.code, item.label]),
      );
    }, [selectedRegistrationOptions.careers]);
    const coreKeywordLabelMap = useMemo(() => {
      return new Map(
        selectedRegistrationOptions.coreKeywords.map((item) => [
          item.code,
          item.label,
        ]),
      );
    }, [selectedRegistrationOptions.coreKeywords]);
    const entryOnboardingValues =
      useMemo<MentorRegistrationEntryOnboardingValues>(() => {
        return {
          jobGroup: jobGroup ?? '',
          jobTitle: jobTitle ?? '',
          careerYears: careerYears ?? '',
          appealLine: appealLine ?? '',
        };
      }, [appealLine, careerYears, jobGroup, jobTitle]);

    const previewMentorId =
      myMentorSettings?.mentorId ?? memberId ?? 0;

    const displayJobGroup = jobGroupLabelMap.get(jobGroup ?? '') ?? '';
    const displayJobTitle = jobTitleLabelMap.get(jobTitle ?? '') ?? '';
    const displayCareer = careerLabelMap.get(careerYears ?? '') ?? '';
    const displayCoreKeywords = (skillTags ?? [])
      .map((code) => coreKeywordLabelMap.get(code) ?? '')
      .filter((label) => label.length > 0);

    const previewFormValues = useMemo<MentorRegistrationFormValues>(() => {
      const defaults = createDefaultMentorSettings();

      return {
        ...defaults,
        contactCountryCode: contactCountryCode ?? defaults.contactCountryCode,
        contactPhone: contactPhone ?? '',
        contactEmail: contactEmail ?? '',
        categories: [],
        mentoringTitle: mentoringTitle ?? '',
        appealLine: appealLine ?? '',
        jobGroup: jobGroup ?? '',
        jobTitle: jobTitle ?? '',
        careerYears: careerYears ?? '',
        skillTags,
        companyCategory: companyCategory ?? defaults.companyCategory,
        companyName: companyName ?? '',
        hideCompanyName: hideCompanyName ?? false,
        maxParticipants: Math.min(
          10,
          Math.max(1, toSafeInteger(maxParticipants, defaults.maxParticipants)),
        ),
        noteEnabled: noteEnabled ?? defaults.noteEnabled,
        notePrice: toSafeInteger(notePrice, defaults.notePrice),
        simpleEnabled: simpleEnabled ?? defaults.simpleEnabled,
        simplePrice: toSafeInteger(simplePrice, defaults.simplePrice),
        deepEnabled: deepEnabled ?? defaults.deepEnabled,
        deepPrice: toSafeInteger(deepPrice, defaults.deepPrice),
        deepDurationMinutes: toDurationMinutes(
          deepDurationMinutes,
          defaults.deepDurationMinutes,
        ),
        offlineEnabled: offlineEnabled ?? defaults.offlineEnabled,
        offlinePrice: toSafeInteger(offlinePrice, defaults.offlinePrice),
        offlineDurationMinutes: toDurationMinutes(
          offlineDurationMinutes,
          defaults.offlineDurationMinutes,
        ),
        schedule: schedule ?? defaults.schedule,
        detailedDescription: detailedDescription ?? '',
        interviewQuestions: interviewQuestions ?? [],
        preNotice: preNotice ?? '',
        settlementDraft: settlementDraft ?? null,
        updatedAt: new Date().toISOString(),
      };
    }, [
      appealLine,
      careerYears,
      companyCategory,
      companyName,
      contactCountryCode,
      contactEmail,
      contactPhone,
      detailedDescription,
      hideCompanyName,
      interviewQuestions,
      jobGroup,
      jobTitle,
      maxParticipants,
      mentoringTitle,
      noteEnabled,
      notePrice,
      offlineDurationMinutes,
      offlineEnabled,
      offlinePrice,
      deepDurationMinutes,
      deepEnabled,
      deepPrice,
      simpleEnabled,
      simplePrice,
      preNotice,
      schedule,
      settlementDraft,
      skillTags,
    ]);

    const previewMentor = useMemo(() => {
      return buildPreviewMentorProfile({
        mentorId: previewMentorId,
        values: previewFormValues,
        displayJobGroup,
        displayJobTitle,
        displayCareer,
        displayCoreKeywords,
        imageUrl: profileImageUrl?.trim() || undefined,
        nickname: nickname?.trim() || memberName?.trim() || '',
      });
    }, [
      displayCareer,
      displayCoreKeywords,
      displayJobGroup,
      displayJobTitle,
      memberName,
      nickname,
      previewFormValues,
      previewMentorId,
      profileImageUrl,
    ]);

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
        showToast(MENTOR_REGISTRATION_TOAST_MESSAGES.mySettingsLoadError, 'error');

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

      const normalizedVerifiedPhone = sanitizeDigits(verifiedPhoneNumber ?? '');
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
        updatedAt: new Date().toISOString(),
      };
      const existingMentorId = myMentorSettings?.mentorId;

      upsertMyMentorSettingsMutation.mutate(finalizedValues, {
        onSuccess: (result) => {
          const mentorId = result.mentorId;
          if (result.created || existingMentorId === undefined) {
            const displayName =
              nickname?.trim() || memberName?.trim() || `멘토${mentorId}`;
            setWelcomeOnboarding({
              mentorId,
              displayName,
              checklist: buildWelcomeChecklist(finalizedValues),
            });

            return;
          }

          showToast(MENTOR_REGISTRATION_TOAST_MESSAGES.settingsSaved, 'success');
          router.push(`/mentoring/${mentorId}`);
        },
        onError: () => {
          showToast(
            '멘토링 설정 저장에 실패했습니다. 잠시 후 다시 시도해주세요.',
            'error',
          );
        },
      });
    };

    const handleCancel = () => {
      if (isDirty) {
        setIsCancelModalOpen(true);

        return;
      }

      router.push('/mentoring');
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

    const handleWelcomeModalToMentorPage = () => {
      if (!welcomeOnboarding) {
        return;
      }

      const mentorId = welcomeOnboarding.mentorId;
      setWelcomeOnboarding(undefined);
      router.push(`/mentoring/${mentorId}`);
    };

    const handleWelcomeModalToRequestPage = () => {
      setWelcomeOnboarding(undefined);
      router.push('/mentoring');
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

      markMentorRegistrationEntryOnboardingAsSeen(memberId);
      setIsEntryOnboardingOpen(false);
      showToast(
        MENTOR_REGISTRATION_TOAST_MESSAGES.entryOnboardingCompleted,
        'success',
      );
    };

    const handleSkipEntryOnboarding = () => {
      markMentorRegistrationEntryOnboardingAsSeen(memberId);
      setIsEntryOnboardingOpen(false);
    };

    const handleReopenEntryOnboarding = () => {
      setIsEntryOnboardingOpen(true);
    };

    const handleSettlementSubmit = (draft: MentorSettlementDraft) => {
      setValue('settlementDraft', draft, DIRTY_VALIDATION_OPTIONS);
      showToast(
        MENTOR_REGISTRATION_TOAST_MESSAGES.settlementRegistered,
        'success',
      );
    };

    return {
      state: {
        form,
        registrationOptions: selectedRegistrationOptions,
        guardState,
        memberId,
        isGuideOpen,
        isPhoneVerificationModalOpen,
        isCancelModalOpen,
        isSettlementModalOpen,
        isPreviewOpen,
        isResizing,
        panelWidth,
        committedPanelWidth,
        highlightedSections,
        previewMentor,
        settlementDraft: settlementDraft ?? undefined,
        welcomeOnboarding,
        isEntryOnboardingOpen,
        entryOnboardingValues,
        shouldRenderPhoneVerificationModal: Boolean(memberId),
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
        onSettlementModalOpenChange: setIsSettlementModalOpen,
        onOpenPreview: previewPanelActions.openPreview,
        onClosePreview: previewPanelActions.closePreview,
        onPreviewResizeStart: previewPanelActions.onPreviewResizeStart,
        onSave: handleSave,
        onCancel: handleCancel,
        onPhoneVerificationComplete: handlePhoneVerificationComplete,
        onSettlementSubmit: handleSettlementSubmit,
        onWelcomeModalToMentorPage: handleWelcomeModalToMentorPage,
        onWelcomeModalToRequestPage: handleWelcomeModalToRequestPage,
        onCompleteEntryOnboarding: handleCompleteEntryOnboarding,
        onSkipEntryOnboarding: handleSkipEntryOnboarding,
        onConfirmExitWithoutSaving: () => router.push('/mentoring'),
      } satisfies MentorRegistrationControllerActions,
      viewModel: {
        isReady: guardState === 'ready',
      } satisfies MentorRegistrationControllerViewModel,
    };
  };
