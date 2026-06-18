'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { MyMentorSettingsFoundResult } from '@/features/mentoring/api/mentor-api';
import {
  type MentorRegistrationStepId,
  normalizeMentorRegistrationStepId,
} from '@/types/mentoring/registration-view';
import {
  type MentorRegistrationFormInputValues,
  type MentorRegistrationFormValues,
} from '@/types/schemas/mentor-registration-schema';
import {
  DEFAULT_MENTOR_REGISTRATION_FORM_VALUES,
  DEFAULT_MENTOR_REGISTRATION_STEP_ID,
  clearMentorRegistrationSessionDraft,
  createDefaultMentorRegistrationFormValues,
  getMentorRegistrationServerSnapshotKey,
  hasPersistableDraftChanges,
  mergeMentorRegistrationFormValuesWithSessionDraft,
  readMentorRegistrationSessionDraft,
  shouldPersistSessionDraftState,
  shouldRestoreSessionDraft,
  writeMentorRegistrationSessionDraft,
} from './mentor-registration-session-draft';

const SESSION_DRAFT_PERSIST_DEBOUNCE_MS = 450;
const SESSION_DRAFT_IDLE_TIMEOUT_MS = 1000;

interface UseMentorRegistrationSessionDraftSyncParams {
  form: UseFormReturn<
    MentorRegistrationFormInputValues,
    unknown,
    MentorRegistrationFormValues
  >;
  memberId: number | undefined;
  currentStepId: MentorRegistrationStepId;
  setCurrentStepId: (stepId: MentorRegistrationStepId) => void;
  isHydrated: boolean;
  isAuthenticated: boolean;
  canWriteMentorProfile: boolean;
  isMyMentorSettingsLoading: boolean;
  myMentorSettings: MyMentorSettingsFoundResult | undefined;
  isMentorSettingsKnownMissing: boolean;
}

export const useMentorRegistrationSessionDraftSync = ({
  form,
  memberId,
  currentStepId,
  setCurrentStepId,
  isHydrated,
  isAuthenticated,
  canWriteMentorProfile,
  isMyMentorSettingsLoading,
  myMentorSettings,
  isMentorSettingsKnownMissing,
}: UseMentorRegistrationSessionDraftSyncParams) => {
  const { getValues, reset } = form;
  const currentStepIdRef = useRef<MentorRegistrationStepId>(
    DEFAULT_MENTOR_REGISTRATION_STEP_ID,
  );
  const initializedDraftMemberIdRef = useRef<number | null>(null);
  const appliedServerSnapshotKeyRef = useRef<string | null>(null);
  const draftPersistenceBaseRef = useRef<MentorRegistrationFormInputValues>(
    DEFAULT_MENTOR_REGISTRATION_FORM_VALUES,
  );
  const hasClientEditsRef = useRef(false);

  const applyFormSnapshot = useCallback(
    ({
      baseValues,
      sessionDraftEnvelope,
      restoreSessionDraft,
      serverSnapshotKey,
      draftMemberId,
    }: {
      baseValues: MentorRegistrationFormInputValues;
      sessionDraftEnvelope?: ReturnType<
        typeof readMentorRegistrationSessionDraft
      >;
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
    [reset, setCurrentStepId],
  );

  useEffect(() => {
    currentStepIdRef.current = currentStepId;
  }, [currentStepId]);

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
      isMyMentorSettingsLoading ||
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
      baseValues: createDefaultMentorRegistrationFormValues(),
      sessionDraftEnvelope,
      restoreSessionDraft: Boolean(sessionDraftEnvelope),
      serverSnapshotKey: null,
      draftMemberId: memberId,
    });
  }, [
    applyFormSnapshot,
    canWriteMentorProfile,
    isAuthenticated,
    isHydrated,
    isMentorSettingsKnownMissing,
    isMyMentorSettingsLoading,
    memberId,
    myMentorSettings,
  ]);

  useEffect(() => {
    if (
      !isHydrated ||
      !isAuthenticated ||
      !canWriteMentorProfile ||
      !memberId ||
      isMyMentorSettingsLoading
    ) {
      return;
    }

    let persistTimer: ReturnType<typeof setTimeout> | null = null;
    let persistIdleCallbackId: number | null = null;
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
    const cancelScheduledPersist = () => {
      if (persistTimer !== null) {
        clearTimeout(persistTimer);
        persistTimer = null;
      }

      if (
        persistIdleCallbackId !== null &&
        typeof window !== 'undefined' &&
        'cancelIdleCallback' in window
      ) {
        window.cancelIdleCallback(persistIdleCallbackId);
        persistIdleCallbackId = null;
      }
    };
    const schedulePersistDraft = () => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        persistIdleCallbackId = window.requestIdleCallback(
          () => {
            persistIdleCallbackId = null;
            persistDraft();
          },
          {
            timeout: SESSION_DRAFT_IDLE_TIMEOUT_MS,
          },
        );

        return;
      }

      persistDraft();
    };

    const subscription = form.watch(
      (_values: unknown, info: { type?: string }) => {
        if (info.type === undefined) {
          return;
        }

        hasClientEditsRef.current = true;
        cancelScheduledPersist();

        persistTimer = setTimeout(() => {
          persistTimer = null;
          schedulePersistDraft();
        }, SESSION_DRAFT_PERSIST_DEBOUNCE_MS);
      },
    );

    return () => {
      cancelScheduledPersist();
      subscription.unsubscribe();
    };
  }, [
    canWriteMentorProfile,
    form,
    getValues,
    isAuthenticated,
    isHydrated,
    isMyMentorSettingsLoading,
    memberId,
  ]);

  useEffect(() => {
    if (
      !isHydrated ||
      !isAuthenticated ||
      !canWriteMentorProfile ||
      !memberId ||
      isMyMentorSettingsLoading
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
    isMyMentorSettingsLoading,
    memberId,
  ]);

  return {
    clearSessionDraft: () => {
      if (memberId) {
        clearMentorRegistrationSessionDraft(memberId);
      }
    },
    commitPersistedValues: (
      persistedValues: MentorRegistrationFormInputValues,
    ) => {
      draftPersistenceBaseRef.current = persistedValues;
      hasClientEditsRef.current = false;
      initializedDraftMemberIdRef.current = memberId ?? null;
      appliedServerSnapshotKeyRef.current = null;
    },
    hasUnsavedDraft: () =>
      shouldPersistSessionDraftState({
        baseValues: draftPersistenceBaseRef.current,
        nextValues: getValues(),
        currentStepId: currentStepIdRef.current,
      }),
    normalizeNextStepId: (stepId: MentorRegistrationStepId) => {
      const normalizedStepId = normalizeMentorRegistrationStepId(stepId);

      hasClientEditsRef.current =
        hasClientEditsRef.current ||
        normalizedStepId !== DEFAULT_MENTOR_REGISTRATION_STEP_ID;

      return normalizedStepId;
    },
  };
};
