'use client';

import { useMemo } from 'react';
import {
  applyMentorScheduleTextDrafts,
  createDefaultMentorSettings,
} from '@/features/mentoring/model/mentor-settings';
import {
  buildPreviewMentorProfile,
  toDurationMinutes,
  toSafeInteger,
} from '@/features/mentoring/model/registration/mentor-registration-preview';
import type { MentorProfile } from '@/types/mentoring/domain';
import { normalizeMentorMarkdownContent } from '@/types/mentoring/markdown';
import type { MentorRegistrationOptions } from '@/types/mentoring/registration-options';
import type {
  MentorRegistrationEntryOnboardingValues,
  MentorRegistrationPersistedPredefinedCoreKeyword,
} from '@/types/mentoring/registration-view';
import {
  createEmptyMentorScheduleDrafts,
  type MentorRegistrationFormInputValues,
  type MentorRegistrationFormValues,
} from '@/types/schemas/mentor-registration-schema';

export const EMPTY_REGISTRATION_OPTIONS: MentorRegistrationOptions = {
  maxCoreKeywordCount: 5,
  jobGroups: [],
  jobTitles: [],
  careers: [],
  selectableCoreKeywords: [],
};

const normalizePreviewString = (value: unknown): string => {
  return typeof value === 'string' ? value : '';
};

const normalizePreviewStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
};

interface MentorRegistrationPreviewFields {
  mentoringTitle?: string;
  appealLine?: string;
  jobGroup?: string;
  jobTitle?: string;
  careerYears?: string;
  careerEntries?: MentorRegistrationFormValues['careerEntries'];
  skillTags: string[];
  companyCategory?: MentorRegistrationFormValues['companyCategory'];
  companyName?: string;
  hideCompanyName?: boolean;
  listVisible?: boolean;
  maxParticipants?: MentorRegistrationFormInputValues['maxParticipants'];
  noteEnabled?: boolean;
  notePrice?: MentorRegistrationFormInputValues['notePrice'];
  simpleEnabled?: boolean;
  simplePrice?: MentorRegistrationFormInputValues['simplePrice'];
  deepEnabled?: boolean;
  deepPrice?: MentorRegistrationFormInputValues['deepPrice'];
  deepDurationMinutes?: MentorRegistrationFormInputValues['deepDurationMinutes'];
  offlineEnabled?: boolean;
  offlinePrice?: MentorRegistrationFormInputValues['offlinePrice'];
  offlineDurationMinutes?: MentorRegistrationFormInputValues['offlineDurationMinutes'];
  schedule?: MentorRegistrationFormValues['schedule'];
  scheduleDrafts?: MentorRegistrationFormValues['scheduleDrafts'];
  detailedDescription?: string;
  interviewQuestions?: string[];
  preNotice?: string;
  updatedAt?: string;
}

interface UseMentorRegistrationPreviewModelParams {
  registrationOptions: MentorRegistrationOptions | undefined;
  persistedPredefinedCoreKeywords?: ReadonlyArray<MentorRegistrationPersistedPredefinedCoreKeyword>;
  myMentorId: number | undefined;
  memberId: number | undefined;
  profileImageUrl: string | undefined;
  nickname: string | undefined;
  memberName: string | undefined;
  fields: MentorRegistrationPreviewFields;
}

interface MentorRegistrationPreviewModel {
  selectedRegistrationOptions: MentorRegistrationOptions;
  jobTitleLabelMap: Map<string, string>;
  entryOnboardingValues: MentorRegistrationEntryOnboardingValues;
  previewFormValues: MentorRegistrationFormValues;
  previewMentor: MentorProfile;
}

export const useMentorRegistrationPreviewModel = ({
  registrationOptions,
  persistedPredefinedCoreKeywords = [],
  myMentorId,
  memberId,
  profileImageUrl,
  nickname,
  memberName,
  fields,
}: UseMentorRegistrationPreviewModelParams): MentorRegistrationPreviewModel => {
  const selectedRegistrationOptions =
    registrationOptions ?? EMPTY_REGISTRATION_OPTIONS;
  const {
    mentoringTitle,
    appealLine,
    jobGroup,
    jobTitle,
    careerYears,
    careerEntries,
    skillTags,
    companyCategory,
    companyName,
    hideCompanyName,
    listVisible,
    maxParticipants,
    noteEnabled,
    notePrice,
    simpleEnabled,
    simplePrice,
    deepEnabled,
    deepPrice,
    deepDurationMinutes,
    offlineEnabled,
    offlinePrice,
    offlineDurationMinutes,
    schedule,
    scheduleDrafts,
    detailedDescription,
    interviewQuestions,
    preNotice,
    updatedAt,
  } = fields;

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
      selectedRegistrationOptions.careers.map((item) => [
        item.code,
        item.label,
      ]),
    );
  }, [selectedRegistrationOptions.careers]);

  const coreKeywordLabelMap = useMemo(() => {
    const labelMap = new Map(
      selectedRegistrationOptions.selectableCoreKeywords.map((item) => [
        item.code,
        item.label,
      ]),
    );

    persistedPredefinedCoreKeywords.forEach((keyword) => {
      labelMap.set(keyword.code, keyword.label);
    });

    return labelMap;
  }, [
    persistedPredefinedCoreKeywords,
    selectedRegistrationOptions.selectableCoreKeywords,
  ]);

  const entryOnboardingValues =
    useMemo<MentorRegistrationEntryOnboardingValues>(() => {
      return {
        jobGroup: jobGroup ?? '',
        jobTitle: jobTitle ?? '',
        careerYears: careerYears ?? '',
        appealLine: appealLine ?? '',
      };
    }, [appealLine, careerYears, jobGroup, jobTitle]);

  const displayJobGroup = jobGroupLabelMap.get(jobGroup ?? '') ?? '';
  const displayJobTitle = jobTitleLabelMap.get(jobTitle ?? '') ?? '';
  const displayCareer = careerLabelMap.get(careerYears ?? '') ?? '';
  const displayProfileKeywords = (skillTags ?? [])
    .map((keyword) => coreKeywordLabelMap.get(keyword) ?? keyword)
    .filter((label) => label.length > 0);

  const previewFormValues = useMemo<MentorRegistrationFormValues>(() => {
    const defaults = createDefaultMentorSettings();
    const nextScheduleDrafts =
      scheduleDrafts ?? createEmptyMentorScheduleDrafts();
    const previewSchedule = applyMentorScheduleTextDrafts({
      schedule: schedule ?? defaults.schedule,
      drafts: nextScheduleDrafts,
    }).schedule;

    return {
      ...defaults,
      categories: [],
      mentoringTitle: mentoringTitle ?? '',
      appealLine: appealLine ?? '',
      jobGroup: jobGroup ?? '',
      jobTitle: jobTitle ?? '',
      careerYears: careerYears ?? '',
      careerEntries: careerEntries ?? [],
      skillTags: skillTags,
      companyCategory: companyCategory ?? defaults.companyCategory,
      companyName: companyName ?? '',
      hideCompanyName: hideCompanyName ?? defaults.hideCompanyName,
      listVisible: listVisible ?? defaults.listVisible,
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
      schedule: previewSchedule,
      scheduleDrafts: nextScheduleDrafts,
      detailedDescription: normalizeMentorMarkdownContent(detailedDescription),
      interviewQuestions: normalizePreviewStringArray(interviewQuestions),
      preNotice: normalizePreviewString(preNotice),
      updatedAt: normalizePreviewString(updatedAt) || defaults.updatedAt,
    };
  }, [
    appealLine,
    careerEntries,
    careerYears,
    companyCategory,
    companyName,
    deepDurationMinutes,
    deepEnabled,
    deepPrice,
    detailedDescription,
    hideCompanyName,
    interviewQuestions,
    jobGroup,
    jobTitle,
    listVisible,
    maxParticipants,
    mentoringTitle,
    noteEnabled,
    notePrice,
    offlineDurationMinutes,
    offlineEnabled,
    offlinePrice,
    preNotice,
    schedule,
    scheduleDrafts,
    simpleEnabled,
    simplePrice,
    skillTags,
    updatedAt,
  ]);

  const previewMentorId = myMentorId ?? memberId ?? 0;

  const previewMentor = useMemo(() => {
    return buildPreviewMentorProfile({
      mentorId: previewMentorId,
      values: previewFormValues,
      displayJobGroup,
      displayJobTitle,
      displayCareer,
      displayProfileKeywords,
      companyName: previewFormValues.companyName,
      hideCompanyName: previewFormValues.hideCompanyName,
      imageUrl: profileImageUrl?.trim() || undefined,
      nickname: nickname?.trim() || memberName?.trim() || '',
    });
  }, [
    displayCareer,
    displayProfileKeywords,
    displayJobGroup,
    displayJobTitle,
    memberName,
    nickname,
    previewFormValues,
    previewMentorId,
    profileImageUrl,
  ]);

  return {
    selectedRegistrationOptions,
    jobTitleLabelMap,
    entryOnboardingValues,
    previewFormValues,
    previewMentor,
  };
};
