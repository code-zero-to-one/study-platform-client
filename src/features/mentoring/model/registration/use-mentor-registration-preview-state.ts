'use client';

import { useDeferredValue } from 'react';
import type { Control, UseFormGetValues } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import {
  createDefaultMentorSettings,
  normalizeMentorCareerEntries,
} from '@/features/mentoring/model/mentor-settings';
import { useMentorRegistrationPreviewHighlights } from '@/features/mentoring/model/registration/use-mentor-registration-preview-highlights';
import { useMentorRegistrationPreviewModel } from '@/features/mentoring/model/registration/use-mentor-registration-preview-model';
import type { MentorProfile } from '@/types/mentoring/domain';
import type { MentorRegistrationOptions } from '@/types/mentoring/registration-options';
import type {
  MentorRegistrationEntryOnboardingValues,
  MentorRegistrationPersistedPredefinedCoreKeyword,
  MentorRegistrationPreviewHighlightSection,
} from '@/types/mentoring/registration-view';
import { WEEKDAY_KEYS } from '@/types/mentoring/settings';
import {
  createEmptyMentorScheduleDrafts,
  type MentorRegistrationFormInputValues,
  type MentorRegistrationFormValues,
} from '@/types/schemas/mentor-registration-schema';

interface UseMentorRegistrationPreviewStateParams {
  control: Control<
    MentorRegistrationFormInputValues,
    unknown,
    MentorRegistrationFormValues
  >;
  getValues: UseFormGetValues<MentorRegistrationFormInputValues>;
  isPreviewOpen: boolean;
  isEntryOnboardingOpen: boolean;
  registrationOptions: MentorRegistrationOptions | undefined;
  persistedPredefinedCoreKeywords: ReadonlyArray<MentorRegistrationPersistedPredefinedCoreKeyword>;
  myMentorId: number | undefined;
  memberId: number | undefined;
  profileImageUrl: string | undefined;
  nickname: string | undefined;
  memberName: string | undefined;
}

interface MentorRegistrationPreviewState {
  selectedRegistrationOptions: MentorRegistrationOptions;
  jobTitleLabelMap: Map<string, string>;
  entryOnboardingValues: MentorRegistrationEntryOnboardingValues;
  previewMentor: MentorProfile;
  savePreviewMentor: MentorProfile;
  highlightedSections: MentorRegistrationPreviewHighlightSection[];
}

const DEFAULT_PREVIEW_SCHEDULE = createDefaultMentorSettings().schedule;
const DEFAULT_PREVIEW_SCHEDULE_DRAFTS = createEmptyMentorScheduleDrafts();

export const useMentorRegistrationPreviewState = ({
  control,
  getValues,
  isPreviewOpen,
  isEntryOnboardingOpen,
  registrationOptions,
  persistedPredefinedCoreKeywords,
  myMentorId,
  memberId,
  profileImageUrl,
  nickname,
  memberName,
}: UseMentorRegistrationPreviewStateParams): MentorRegistrationPreviewState => {
  const shouldSubscribePreviewFields = isPreviewOpen || isEntryOnboardingOpen;
  const watchedPreviewFieldValues = useWatch({
    control,
    disabled: !shouldSubscribePreviewFields,
    defaultValue: getValues(),
  });
  const previewFieldValues = shouldSubscribePreviewFields
    ? watchedPreviewFieldValues
    : getValues();
  const deferredPreviewFieldValues = useDeferredValue(previewFieldValues);
  const normalizedDeferredPreviewSchedule: MentorRegistrationFormValues['schedule'] =
    deferredPreviewFieldValues.schedule
      ? {
          timezone:
            deferredPreviewFieldValues.schedule.timezone === 'Asia/Seoul'
              ? 'Asia/Seoul'
              : DEFAULT_PREVIEW_SCHEDULE.timezone,
          slotUnitMinutes:
            deferredPreviewFieldValues.schedule.slotUnitMinutes === 30
              ? 30
              : DEFAULT_PREVIEW_SCHEDULE.slotUnitMinutes,
          weekly: {
            MON:
              deferredPreviewFieldValues.schedule.weekly?.MON ??
              DEFAULT_PREVIEW_SCHEDULE.weekly.MON,
            TUE:
              deferredPreviewFieldValues.schedule.weekly?.TUE ??
              DEFAULT_PREVIEW_SCHEDULE.weekly.TUE,
            WED:
              deferredPreviewFieldValues.schedule.weekly?.WED ??
              DEFAULT_PREVIEW_SCHEDULE.weekly.WED,
            THU:
              deferredPreviewFieldValues.schedule.weekly?.THU ??
              DEFAULT_PREVIEW_SCHEDULE.weekly.THU,
            FRI:
              deferredPreviewFieldValues.schedule.weekly?.FRI ??
              DEFAULT_PREVIEW_SCHEDULE.weekly.FRI,
            SAT:
              deferredPreviewFieldValues.schedule.weekly?.SAT ??
              DEFAULT_PREVIEW_SCHEDULE.weekly.SAT,
            SUN:
              deferredPreviewFieldValues.schedule.weekly?.SUN ??
              DEFAULT_PREVIEW_SCHEDULE.weekly.SUN,
          },
        }
      : DEFAULT_PREVIEW_SCHEDULE;
  const normalizedDeferredPreviewScheduleDrafts: MentorRegistrationFormValues['scheduleDrafts'] =
    Object.fromEntries(
      WEEKDAY_KEYS.map((day) => [
        day,
        deferredPreviewFieldValues.scheduleDrafts?.[day] ??
          DEFAULT_PREVIEW_SCHEDULE_DRAFTS[day],
      ]),
    ) as MentorRegistrationFormValues['scheduleDrafts'];

  const {
    selectedRegistrationOptions,
    jobTitleLabelMap,
    entryOnboardingValues,
    previewFormValues,
    previewMentor,
  } = useMentorRegistrationPreviewModel({
    registrationOptions,
    persistedPredefinedCoreKeywords,
    myMentorId,
    memberId,
    profileImageUrl,
    nickname,
    memberName,
    fields: {
      mentoringTitle: deferredPreviewFieldValues.mentoringTitle,
      appealLine: deferredPreviewFieldValues.appealLine,
      jobGroup: deferredPreviewFieldValues.jobGroup,
      jobTitle: deferredPreviewFieldValues.jobTitle,
      careerYears: deferredPreviewFieldValues.careerYears,
      careerEntries: normalizeMentorCareerEntries(
        deferredPreviewFieldValues.careerEntries,
      ),
      skillTags: deferredPreviewFieldValues.skillTags ?? [],
      companyCategory: deferredPreviewFieldValues.companyCategory,
      companyName: deferredPreviewFieldValues.companyName,
      hideCompanyName: deferredPreviewFieldValues.hideCompanyName,
      listVisible: deferredPreviewFieldValues.listVisible,
      maxParticipants: deferredPreviewFieldValues.maxParticipants,
      noteEnabled: deferredPreviewFieldValues.noteEnabled,
      notePrice: deferredPreviewFieldValues.notePrice,
      simpleEnabled: deferredPreviewFieldValues.simpleEnabled,
      simplePrice: deferredPreviewFieldValues.simplePrice,
      deepEnabled: deferredPreviewFieldValues.deepEnabled,
      deepPrice: deferredPreviewFieldValues.deepPrice,
      deepDurationMinutes: deferredPreviewFieldValues.deepDurationMinutes,
      offlineEnabled: deferredPreviewFieldValues.offlineEnabled,
      offlinePrice: deferredPreviewFieldValues.offlinePrice,
      offlineDurationMinutes: deferredPreviewFieldValues.offlineDurationMinutes,
      schedule: normalizedDeferredPreviewSchedule,
      scheduleDrafts: normalizedDeferredPreviewScheduleDrafts,
      detailedDescription: deferredPreviewFieldValues.detailedDescription,
      interviewQuestions: deferredPreviewFieldValues.interviewQuestions,
      preNotice: deferredPreviewFieldValues.preNotice,
      updatedAt: deferredPreviewFieldValues.updatedAt,
    },
  });
  const highlightedSections = useMentorRegistrationPreviewHighlights({
    isPreviewOpen,
    previewFormValues,
  });

  return {
    selectedRegistrationOptions,
    jobTitleLabelMap,
    entryOnboardingValues,
    previewMentor,
    savePreviewMentor: previewMentor,
    highlightedSections,
  };
};
