'use client';

import { type QueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { ApiError } from '@/api/client/api-error';
import { getMyMentorSettings } from '@/features/mentoring/api/mentor-api';
import { MENTOR_REGISTRATION_TOAST_MESSAGES } from '@/features/mentoring/const/mentor-registration-labels';
import { mentorDirectoryQueryKeys } from '@/features/mentoring/model/directory/mentor-directory-query-keys';
import {
  useMentorRegistrationOptionsQuery,
  useMyMentorSettingsQuery,
} from '@/features/mentoring/model/directory/use-mentor-directory-query';
import {
  createDefaultMentorSettings,
  normalizeMentorCareerEntries,
} from '@/features/mentoring/model/mentor-settings';
import {
  getMentorRegistrationValidationDetails,
  resolveMentorRegistrationServerErrorTarget,
} from '@/features/mentoring/model/registration/mentor-registration-server-error';
import { buildMentorRegistrationWelcomeOnboarding } from '@/features/mentoring/model/registration/mentor-registration-welcome-onboarding';
import { useMentorRegistrationSessionDraftSync } from '@/features/mentoring/model/registration/use-mentor-registration-session-draft-sync';
import { useUpsertMyMentorSettingsMutation } from '@/features/mentoring/model/use-upsert-my-mentor-settings-mutation';
import type { MentorProfile } from '@/types/mentoring/domain';
import type {
  MentorRegistrationPersistedPredefinedCoreKeyword,
  MentorRegistrationStepId,
  MentorRegistrationWelcomeOnboardingState,
} from '@/types/mentoring/registration-view';
import { MENTOR_REGISTRATION_STEP_IDS } from '@/types/mentoring/registration-view';
import type {
  MentorRegistrationFormInputValues,
  MentorRegistrationFormValues,
} from '@/types/schemas/mentor-registration-schema';

const INVALID_MENTOR_SETTINGS_ERROR_CODE = 'MTR001';
const INVALID_CORE_KEYWORD_ERROR_CODE = 'MENTOR_OPTION_005';

type ToastVariant = 'success' | 'error' | 'info';

interface UseMentorRegistrationSaveActionParams {
  form: UseFormReturn<
    MentorRegistrationFormInputValues,
    unknown,
    MentorRegistrationFormValues
  >;
  memberId: number | undefined;
  isVerified: boolean;
  isVerificationLoading: boolean;
  isVerificationError: boolean;
  normalizedVerifiedPhone: string;
  myMentorSettingsQuery: ReturnType<typeof useMyMentorSettingsQuery>;
  mentorRegistrationOptionsQuery: ReturnType<
    typeof useMentorRegistrationOptionsQuery
  >;
  upsertMyMentorSettingsMutation: ReturnType<
    typeof useUpsertMyMentorSettingsMutation
  >;
  registrationOptions:
    | ReturnType<typeof useMentorRegistrationOptionsQuery>['data']
    | undefined;
  persistedPredefinedCoreKeywords: ReadonlyArray<MentorRegistrationPersistedPredefinedCoreKeyword>;
  previewMentor: MentorProfile;
  queryClient: QueryClient;
  sessionDraftSync: Pick<
    ReturnType<typeof useMentorRegistrationSessionDraftSync>,
    'clearSessionDraft' | 'commitPersistedValues'
  >;
  setCurrentStepId: (stepId: MentorRegistrationStepId) => void;
  onRequirePhoneVerification: () => void;
  showToast: (message: string, variant?: ToastVariant) => void;
}

interface MentorRegistrationSaveAction {
  welcomeOnboarding: MentorRegistrationWelcomeOnboardingState | undefined;
  save: (values: MentorRegistrationFormValues) => void;
  clearWelcomeOnboarding: () => void;
}

export const useMentorRegistrationSaveAction = ({
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
  previewMentor,
  queryClient,
  sessionDraftSync,
  setCurrentStepId,
  onRequirePhoneVerification,
  showToast,
}: UseMentorRegistrationSaveActionParams): MentorRegistrationSaveAction => {
  const [welcomeOnboarding, setWelcomeOnboarding] =
    useState<MentorRegistrationWelcomeOnboardingState>();
  const { clearErrors, getValues, reset, setError } = form;

  const save = (values: MentorRegistrationFormValues) => {
    if (upsertMyMentorSettingsMutation.isPending) {
      return;
    }

    if (!memberId) {
      showToast(MENTOR_REGISTRATION_TOAST_MESSAGES.memberInfoMissing, 'error');

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
      showToast(MENTOR_REGISTRATION_TOAST_MESSAGES.verificationError, 'error');

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
      onRequirePhoneVerification();

      return;
    }

    if (!normalizedVerifiedPhone) {
      showToast(
        MENTOR_REGISTRATION_TOAST_MESSAGES.verifiedPhoneMissing,
        'error',
      );
      onRequirePhoneVerification();

      return;
    }

    const finalizedValues: MentorRegistrationFormValues = {
      ...values,
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
        onSuccess: async (result) => {
          sessionDraftSync.clearSessionDraft();

          const persistedValues: MentorRegistrationFormInputValues = {
            ...getValues(),
            ...finalizedValues,
            careerEntries: persistedCareerEntries,
            updatedAt: result.updatedAt || finalizedValues.updatedAt,
          };

          reset(persistedValues);
          sessionDraftSync.commitPersistedValues(persistedValues);
          clearErrors('skillTags');

          const mentorId = result.mentorId;
          const baseSavedPreviewMentor: MentorProfile = {
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
          const savedPreviewMentor = await getMyMentorSettings()
            .then((myMentorSettingsResult) => {
              if (
                myMentorSettingsResult.kind !== 'found' ||
                myMentorSettingsResult.mentorId !== mentorId
              ) {
                return baseSavedPreviewMentor;
              }

              queryClient.setQueryData(
                mentorDirectoryQueryKeys.mySettings(),
                myMentorSettingsResult,
              );

              return {
                ...baseSavedPreviewMentor,
                publicReadinessStage:
                  myMentorSettingsResult.publicReadinessStage,
                publicReadiness: myMentorSettingsResult.publicReadiness,
                applicationReady:
                  myMentorSettingsResult.publicReadiness?.applicationReady ??
                  baseSavedPreviewMentor.applicationReady,
              } satisfies MentorProfile;
            })
            .catch(() => baseSavedPreviewMentor);

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

          setWelcomeOnboarding(
            buildMentorRegistrationWelcomeOnboarding({
              mentor: savedPreviewMentor,
              listVisible: finalizedValues.listVisible,
            }),
          );
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

              validationDetails.forEach(({ paramName, validationMessage }) => {
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
              });

              if (nextStepId) {
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

  return {
    welcomeOnboarding,
    save,
    clearWelcomeOnboarding: () => setWelcomeOnboarding(undefined),
  };
};
