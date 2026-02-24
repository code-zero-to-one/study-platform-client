'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { MENTOR_REGISTRATION_TOAST_MESSAGES } from '@/features/mentoring/const/mentor-registration-labels';
import { hasMentorWritePermission } from '@/features/mentoring/model/mentor-permission';
import { createDefaultMentorSettings } from '@/features/mentoring/model/mentor-settings';
import { usePhoneVerificationStatus } from '@/features/phone-verification/model/use-phone-verification-status';
import { useAuthReady } from '@/hooks/common/use-auth';
import { getMentorSettings } from '@/mocks/mentoring-mock-data';
import { useToastStore } from '@/stores/use-toast-store';
import {
  createMentorProfileFromRegistration,
  useMentorDirectoryStore,
} from '@/stores/useMentorDirectoryStore';
import { useUserStore } from '@/stores/useUserStore';
import {
  type MentorRegistrationGuardState,
  type MentorRegistrationPreviewHighlightSection,
  type MentorRegistrationWelcomeChecklistItem,
  type MentorRegistrationWelcomeOnboardingState,
} from '@/types/mentoring/registration-view';
import { type MentorSettlementDraft } from '@/types/mentoring/settings';
import {
  mentorRegistrationSchema,
  type MentorRegistrationFormInputValues,
  type MentorRegistrationFormValues,
} from '@/types/schemas/mentor-registration-schema';

const DEFAULT_VALUES: MentorRegistrationFormInputValues = {
  ...createDefaultMentorSettings(),
  preNotice: '',
};

const FORM_MIN_CONTENT_WIDTH = 320;
const PREVIEW_PANEL_MIN_WIDTH = 320;
const PREVIEW_PANEL_DEFAULT_WIDTH = 960;
const PREVIEW_PANEL_MAX_RATIO = 1 / 3;
const DIRTY_VALIDATION_OPTIONS = {
  shouldValidate: true,
  shouldDirty: true,
} as const;

const sanitizeDigits = (value: string) => value.replace(/\D/g, '');

const toSafeInteger = (value: unknown, fallback: number) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.round(parsed);
};

const toDurationMinutes = (
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

const buildWelcomeChecklist = (
  values: MentorRegistrationFormValues,
): MentorRegistrationWelcomeChecklistItem[] => {
  const settlementVerified = values.settlementDraft?.verified === true;
  const realtimeEnabled =
    values.phoneEnabled || values.onlineEnabled || values.offlineEnabled;
  const scheduleSlots = countScheduleSlots(values);
  const interviewQuestionCount = values.interviewQuestions.length;

  return [
    {
      title: '정산정보 인증',
      description: settlementVerified
        ? '정산금 수령 준비가 완료되었습니다.'
        : '정산정보를 인증하면 멘토링 수익 정산을 받을 수 있어요.',
      done: settlementVerified,
    },
    {
      title: '실시간 상담 슬롯 오픈',
      description:
        realtimeEnabled && scheduleSlots > 0
          ? `전화/온라인/대면 상담 슬롯 ${scheduleSlots}개가 열려 있어요.`
          : '전화/온라인/대면 상담을 열고 가능한 시간을 등록해보세요.',
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

function getChangedSections(
  prev: MentorRegistrationFormValues,
  next: MentorRegistrationFormValues,
): MentorRegistrationPreviewHighlightSection[] {
  const changed: MentorRegistrationPreviewHighlightSection[] = [];

  if (
    prev.mentoringTitle !== next.mentoringTitle ||
    prev.appealLine !== next.appealLine ||
    prev.jobGroup !== next.jobGroup ||
    prev.jobTitle !== next.jobTitle ||
    prev.careerYears !== next.careerYears ||
    prev.companyCategory !== next.companyCategory ||
    prev.companyName !== next.companyName ||
    prev.hideCompanyName !== next.hideCompanyName
  ) {
    changed.push('headline');
  }

  if (
    prev.detailedDescription !== next.detailedDescription ||
    prev.skillTags !== next.skillTags
  ) {
    changed.push('description');
  }

  if (prev.interviewQuestions !== next.interviewQuestions) {
    changed.push('interview');
  }

  if (
    prev.noteEnabled !== next.noteEnabled ||
    prev.notePrice !== next.notePrice ||
    prev.phoneEnabled !== next.phoneEnabled ||
    prev.phonePrice !== next.phonePrice ||
    prev.onlineEnabled !== next.onlineEnabled ||
    prev.onlinePrice !== next.onlinePrice ||
    prev.onlineDurationMinutes !== next.onlineDurationMinutes ||
    prev.offlineEnabled !== next.offlineEnabled ||
    prev.offlinePrice !== next.offlinePrice ||
    prev.offlineDurationMinutes !== next.offlineDurationMinutes ||
    prev.maxParticipants !== next.maxParticipants ||
    prev.schedule !== next.schedule ||
    prev.holidays !== next.holidays
  ) {
    changed.push('methods');
  }

  if (prev.preNotice !== next.preNotice) {
    changed.push('notice');
  }

  return changed;
}

export interface MentorRegistrationControllerState {
  form: UseFormReturn<
    MentorRegistrationFormInputValues,
    unknown,
    MentorRegistrationFormValues
  >;
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
  previewMentor: ReturnType<typeof createMentorProfileFromRegistration>;
  settlementDraft: MentorSettlementDraft | undefined;
  welcomeOnboarding: MentorRegistrationWelcomeOnboardingState | undefined;
  shouldRenderPhoneVerificationModal: boolean;
}

export interface MentorRegistrationControllerRefs {
  previewLayoutRef: RefObject<HTMLDivElement>;
}

export interface MentorRegistrationControllerActions {
  onGuideOpenChange: (nextOpen: boolean) => void;
  onOpenGuide: () => void;
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

    const registerMentorProfile = useMentorDirectoryStore(
      (storeState) => storeState.registerMentorProfile,
    );
    const mentorIdByMember = useMentorDirectoryStore(
      (storeState) => storeState.mentorIdByMember,
    );
    const createdMentors = useMentorDirectoryStore(
      (storeState) => storeState.createdMentors,
    );
    const nextMentorId = useMentorDirectoryStore(
      (storeState) => storeState.nextMentorId,
    );
    const mentorStoreHydrated = useMentorDirectoryStore(
      (storeState) => storeState.hasHydrated,
    );

    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isPhoneVerificationModalOpen, setIsPhoneVerificationModalOpen] =
      useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [welcomeOnboarding, setWelcomeOnboarding] =
      useState<MentorRegistrationWelcomeOnboardingState>();
    const [panelWidth, setPanelWidth] = useState(PREVIEW_PANEL_DEFAULT_WIDTH);
    const [committedPanelWidth, setCommittedPanelWidth] = useState(
      PREVIEW_PANEL_DEFAULT_WIDTH,
    );
    const [isResizing, setIsResizing] = useState(false);
    const [highlightedSections, setHighlightedSections] = useState<
      MentorRegistrationPreviewHighlightSection[]
    >([]);

    const panelWidthRef = useRef(PREVIEW_PANEL_DEFAULT_WIDTH);
    const previewLayoutRef = useRef<HTMLDivElement>(null);
    const prevPreviewFormValuesRef =
      useRef<MentorRegistrationFormValues | null>(null);
    const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

    const getPreviewPanelMaxWidth = useCallback(() => {
      const viewportLimit = Math.floor(window.innerWidth * 0.75);
      const fallbackRatioLimit = Math.floor(
        window.innerWidth * PREVIEW_PANEL_MAX_RATIO,
      );
      const layoutWidth =
        previewLayoutRef.current?.getBoundingClientRect().width;

      if (!layoutWidth) {
        return Math.min(viewportLimit, fallbackRatioLimit);
      }

      const ratioLimit = Math.floor(layoutWidth * PREVIEW_PANEL_MAX_RATIO);
      const formSafeLimit = Math.floor(layoutWidth - FORM_MIN_CONTENT_WIDTH);

      return Math.max(0, Math.min(viewportLimit, formSafeLimit, ratioLimit));
    }, []);

    const clampPreviewPanelWidth = useCallback(
      (width: number) => {
        const maxWidth = getPreviewPanelMaxWidth();
        const minWidth = Math.min(PREVIEW_PANEL_MIN_WIDTH, maxWidth);

        return Math.max(minWidth, Math.min(width, maxWidth));
      },
      [getPreviewPanelMaxWidth],
    );

    const syncPreviewPanelWidth = useCallback(
      (nextWidth: number) => {
        const clampedWidth = clampPreviewPanelWidth(nextWidth);
        panelWidthRef.current = clampedWidth;
        setPanelWidth(clampedWidth);
        setCommittedPanelWidth(clampedWidth);
      },
      [clampPreviewPanelWidth],
    );

    useEffect(() => {
      const handleWindowResize = () => {
        const clampedWidth = clampPreviewPanelWidth(panelWidthRef.current);
        if (clampedWidth === panelWidthRef.current) {
          return;
        }

        panelWidthRef.current = clampedWidth;
        setPanelWidth(clampedWidth);
        setCommittedPanelWidth(clampedWidth);
      };

      handleWindowResize();
      window.addEventListener('resize', handleWindowResize);

      return () => window.removeEventListener('resize', handleWindowResize);
    }, [clampPreviewPanelWidth]);

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
      if (!memberId || !mentorStoreHydrated) {
        return;
      }

      const mentorId = mentorIdByMember[memberId];
      if (!mentorId) {
        return;
      }

      const existingProfile = createdMentors.find(
        (mentor) => mentor.id === mentorId,
      );
      if (!existingProfile) {
        return;
      }

      const settings = getMentorSettings(existingProfile);
      reset({
        ...settings,
        updatedAt: settings.updatedAt || new Date().toISOString(),
        schemaVersion: 3,
      });
    }, [
      createdMentors,
      memberId,
      mentorIdByMember,
      mentorStoreHydrated,
      reset,
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
    const phonePrice = watch('phonePrice');
    const onlinePrice = watch('onlinePrice');
    const offlinePrice = watch('offlinePrice');
    const onlineDurationMinutes = watch('onlineDurationMinutes');
    const offlineDurationMinutes = watch('offlineDurationMinutes');
    const noteEnabled = watch('noteEnabled');
    const phoneEnabled = watch('phoneEnabled');
    const onlineEnabled = watch('onlineEnabled');
    const offlineEnabled = watch('offlineEnabled');
    const contactCountryCode = watch('contactCountryCode');
    const contactPhone = watch('contactPhone');
    const contactEmail = watch('contactEmail');
    const maxParticipants = watch('maxParticipants');
    const schedule = watch('schedule');
    const holidays = watch('holidays');

    const previewMentorId =
      memberId !== undefined
        ? (mentorIdByMember[memberId] ?? nextMentorId)
        : nextMentorId;

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
        phoneEnabled: phoneEnabled ?? defaults.phoneEnabled,
        phonePrice: toSafeInteger(phonePrice, defaults.phonePrice),
        onlineEnabled: onlineEnabled ?? defaults.onlineEnabled,
        onlinePrice: toSafeInteger(onlinePrice, defaults.onlinePrice),
        onlineDurationMinutes: toDurationMinutes(
          onlineDurationMinutes,
          defaults.onlineDurationMinutes,
        ),
        offlineEnabled: offlineEnabled ?? defaults.offlineEnabled,
        offlinePrice: toSafeInteger(offlinePrice, defaults.offlinePrice),
        offlineDurationMinutes: toDurationMinutes(
          offlineDurationMinutes,
          defaults.offlineDurationMinutes,
        ),
        schedule: schedule ?? defaults.schedule,
        holidays: holidays ?? [],
        detailedDescription: detailedDescription ?? '',
        interviewQuestions: interviewQuestions ?? [],
        preNotice: preNotice ?? '',
        settlementDraft: settlementDraft ?? null,
        schemaVersion: 3,
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
      holidays,
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
      onlineDurationMinutes,
      onlineEnabled,
      onlinePrice,
      phoneEnabled,
      phonePrice,
      preNotice,
      schedule,
      settlementDraft,
      skillTags,
    ]);

    const previewMentor = useMemo(() => {
      return createMentorProfileFromRegistration(
        previewMentorId,
        previewFormValues,
        previewFormValues.updatedAt,
        profileImageUrl,
      );
    }, [previewFormValues, previewMentorId, profileImageUrl]);

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

    const canWriteMentorProfile = hasMentorWritePermission(data?.roleIds);

    const guardState: MentorRegistrationGuardState = !isHydrated
      ? 'loading'
      : !isAuthenticated
        ? 'loginRequired'
        : !canWriteMentorProfile
          ? 'permissionRequired'
          : isVerificationLoading
            ? 'verificationLoading'
            : isVerificationError
              ? 'verificationError'
              : !isVerified
                ? 'verificationRequired'
                : 'ready';

    const handleSave = (values: MentorRegistrationFormValues) => {
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
        schemaVersion: 3,
      };

      const existingMentorId = mentorIdByMember[memberId];
      const mentorId = registerMentorProfile(memberId, finalizedValues, {
        imageUrl: profileImageUrl,
      });

      if (existingMentorId === undefined) {
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
    };

    const handleCancel = () => {
      if (isDirty) {
        setIsCancelModalOpen(true);

        return;
      }

      router.push('/mentoring-management');
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
      router.push('/mentoring-management/requests');
    };

    const handleOpenPreview = () => {
      syncPreviewPanelWidth(panelWidthRef.current);
      setIsPreviewOpen(true);
    };

    const handleResizeStart = (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      const startX = event.clientX;
      const startWidth = panelWidthRef.current;
      setIsResizing(true);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const delta = startX - moveEvent.clientX;
        const newWidth = clampPreviewPanelWidth(startWidth + delta);
        panelWidthRef.current = newWidth;
        setPanelWidth(newWidth);
      };

      const handlePointerUp = () => {
        setIsResizing(false);
        setCommittedPanelWidth(panelWidthRef.current);
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
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
        shouldRenderPhoneVerificationModal: Boolean(memberId),
      } satisfies MentorRegistrationControllerState,
      refs: {
        previewLayoutRef,
      } satisfies MentorRegistrationControllerRefs,
      actions: {
        onGuideOpenChange: setIsGuideOpen,
        onOpenGuide: () => setIsGuideOpen(true),
        onPhoneVerificationModalOpenChange: setIsPhoneVerificationModalOpen,
        onOpenPhoneVerification: () => setIsPhoneVerificationModalOpen(true),
        onCancelModalOpenChange: setIsCancelModalOpen,
        onSettlementModalOpenChange: setIsSettlementModalOpen,
        onOpenPreview: handleOpenPreview,
        onClosePreview: () => setIsPreviewOpen(false),
        onPreviewResizeStart: handleResizeStart,
        onSave: handleSave,
        onCancel: handleCancel,
        onPhoneVerificationComplete: handlePhoneVerificationComplete,
        onSettlementSubmit: handleSettlementSubmit,
        onWelcomeModalToMentorPage: handleWelcomeModalToMentorPage,
        onWelcomeModalToRequestPage: handleWelcomeModalToRequestPage,
        onConfirmExitWithoutSaving: () => router.push('/mentoring-management'),
      } satisfies MentorRegistrationControllerActions,
      viewModel: {
        isReady: guardState === 'ready',
      } satisfies MentorRegistrationControllerViewModel,
    };
  };
