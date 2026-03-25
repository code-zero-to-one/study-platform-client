'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useEffect,
  useState,
} from 'react';
import { useForm, type UseFormReturn, useWatch } from 'react-hook-form';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { MENTOR_REGISTRATION_TOAST_MESSAGES } from '@/features/mentoring/const/mentor-registration-labels';
import {
  useMentorRegistrationOptionsQuery,
  useMyMentorSettingsQuery,
} from '@/features/mentoring/model/directory/use-mentor-directory-query';
import { hasMentorWritePermission } from '@/features/mentoring/model/mentor-permission';
import {
  buildMentoringTitleFromEntryOnboarding,
  isMentorRegistrationEntryFromList,
} from '@/features/mentoring/model/registration/mentor-registration-entry-onboarding';
import { resolveMentorRegistrationGuardState } from '@/features/mentoring/model/registration/mentor-registration-guard-state';
import {
  DEFAULT_MENTOR_REGISTRATION_FORM_VALUES,
  DEFAULT_MENTOR_REGISTRATION_STEP_ID,
} from '@/features/mentoring/model/registration/mentor-registration-session-draft';
import { useMarkMentorEntryOnboardingSeenMutation } from '@/features/mentoring/model/registration/use-mark-mentor-entry-onboarding-seen-mutation';
import { useMentorRegistrationEntryOnboardingState } from '@/features/mentoring/model/registration/use-mentor-registration-entry-onboarding-state';
import { useMentorRegistrationPreviewPanel } from '@/features/mentoring/model/registration/use-mentor-registration-preview-panel';
import { useMentorRegistrationPreviewState } from '@/features/mentoring/model/registration/use-mentor-registration-preview-state';
import { useMentorRegistrationSaveAction } from '@/features/mentoring/model/registration/use-mentor-registration-save-action';
import { useMentorRegistrationSessionDraftSync } from '@/features/mentoring/model/registration/use-mentor-registration-session-draft-sync';
import { useUpsertMyMentorSettingsMutation } from '@/features/mentoring/model/use-upsert-my-mentor-settings-mutation';
import { usePhoneVerificationStatus } from '@/hooks/queries/use-phone-verification-status';
import { useToastStore } from '@/stores/use-toast-store';
import { useUserStore } from '@/stores/useUserStore';
import type { MentorProfile } from '@/types/mentoring/domain';
import { type MentorRegistrationOptions } from '@/types/mentoring/registration-options';
import {
  type MentorRegistrationEntryOnboardingValues,
  type MentorRegistrationGuardState,
  type MentorRegistrationPreviewHighlightSection,
  type MentorRegistrationPersistedPredefinedCoreKeyword,
  type MentorRegistrationStepId,
  type MentorRegistrationWelcomeOnboardingState,
} from '@/types/mentoring/registration-view';
import {
  MENTORING_TITLE_MAX_LENGTH,
  mentorRegistrationSchema,
  type MentorRegistrationFormInputValues,
  type MentorRegistrationFormValues,
} from '@/types/schemas/mentor-registration-schema';

const DIRTY_VALIDATION_OPTIONS = {
  shouldValidate: true,
  shouldDirty: true,
} as const;

const sanitizeDigits = (value: string) => value.replace(/\D/g, '');
const MENTORING_LIST_ROUTE = '/mentoring';
const getMentorDetailRoute = (mentorId: number) =>
  `${MENTORING_LIST_ROUTE}/${mentorId}`;

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
      useMarkMentorEntryOnboardingSeenMutation(memberId);
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

    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isPhoneVerificationModalOpen, setIsPhoneVerificationModalOpen] =
      useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [currentStepId, setCurrentStepId] =
      useState<MentorRegistrationStepId>(DEFAULT_MENTOR_REGISTRATION_STEP_ID);

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

    const form = useForm<
      MentorRegistrationFormInputValues,
      unknown,
      MentorRegistrationFormValues
    >({
      resolver: zodResolver(mentorRegistrationSchema),
      mode: 'onChange',
      reValidateMode: 'onChange',
      defaultValues: DEFAULT_MENTOR_REGISTRATION_FORM_VALUES,
    });

    const { clearErrors, control, getFieldState, getValues, setValue } = form;

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

    const sessionDraftSync = useMentorRegistrationSessionDraftSync({
      form,
      memberId,
      currentStepId,
      setCurrentStepId,
      isHydrated,
      isAuthenticated,
      canWriteMentorProfile,
      isMyMentorSettingsLoading: myMentorSettingsQuery.isLoading,
      myMentorSettings,
      isMentorSettingsKnownMissing,
    });
    const {
      isEntryOnboardingOpen,
      isEntryOnboardingPending,
      setIsEntryOnboardingOpen,
    } = useMentorRegistrationEntryOnboardingState({
      memberId,
      isHydrated,
      isAuthenticated,
      canWriteMentorProfile,
      isEntryFromMentoringList,
      guardState,
    });
    const {
      selectedRegistrationOptions,
      jobTitleLabelMap,
      entryOnboardingValues,
      previewMentor,
      savePreviewMentor,
      highlightedSections,
    } = useMentorRegistrationPreviewState({
      control,
      getValues,
      isPreviewOpen,
      isEntryOnboardingOpen,
      registrationOptions,
      persistedPredefinedCoreKeywords,
      myMentorId: myMentorSettings?.mentorId,
      memberId,
      profileImageUrl,
      nickname,
      memberName,
    });

    const watchedSkillTags = useWatch({
      control,
      name: 'skillTags',
    });

    useEffect(() => {
      if (getFieldState('skillTags').error?.type !== 'server') {
        return;
      }

      clearErrors('skillTags');
    }, [clearErrors, getFieldState, watchedSkillTags]);
    const normalizedVerifiedPhone = sanitizeDigits(verifiedPhoneNumber ?? '');
    const saveBlockingMessage =
      guardState === 'ready' && normalizedVerifiedPhone.length === 0
        ? '본인인증된 전화번호를 다시 확인해주세요.'
        : undefined;
    const {
      welcomeOnboarding,
      save: handleSave,
      clearWelcomeOnboarding,
    } = useMentorRegistrationSaveAction({
      form,
      memberId,
      isVerified,
      isVerificationLoading,
      isVerificationError,
      normalizedVerifiedPhone,
      myMentorSettingsQuery,
      mentorRegistrationOptionsQuery,
      upsertMyMentorSettingsMutation,
      registrationOptions,
      persistedPredefinedCoreKeywords,
      previewMentor: savePreviewMentor,
      queryClient,
      sessionDraftSync,
      setCurrentStepId,
      onRequirePhoneVerification: () => setIsPhoneVerificationModalOpen(true),
      showToast,
    });

    const handleCancel = () => {
      if (upsertMyMentorSettingsMutation.isPending) {
        return;
      }

      if (sessionDraftSync.hasUnsavedDraft()) {
        setIsCancelModalOpen(true);

        return;
      }

      sessionDraftSync.clearSessionDraft();
      router.push(MENTORING_LIST_ROUTE);
    };

    const handlePhoneVerificationComplete = (phoneNumber: string) => {
      setVerified(phoneNumber);
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
      clearWelcomeOnboarding();
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
      setCurrentStepId(sessionDraftSync.normalizeNextStepId(stepId));
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

          sessionDraftSync.clearSessionDraft();
          router.push(MENTORING_LIST_ROUTE);
        },
      } satisfies MentorRegistrationControllerActions,
      viewModel: {
        isReady: guardState === 'ready',
      } satisfies MentorRegistrationControllerViewModel,
    };
  };
