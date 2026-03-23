'use client';

import { useMemo } from 'react';
import {
  buildPreviewMentorProfile,
  toDurationMinutes,
  toSafeInteger,
} from '@/features/mentoring/model/mentor-registration-preview';
import {
  applyMentorScheduleTextDrafts,
  createDefaultMentorSettings,
} from '@/features/mentoring/model/mentor-settings';
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
  contactCountryCode?: MentorRegistrationFormValues['contactCountryCode'];
  contactPhone?: string;
  contactEmail?: string;
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
        jobGroup: fields.jobGroup ?? '',
        jobTitle: fields.jobTitle ?? '',
        careerYears: fields.careerYears ?? '',
        appealLine: fields.appealLine ?? '',
      };
    }, [
      fields.appealLine,
      fields.careerYears,
      fields.jobGroup,
      fields.jobTitle,
    ]);

  const displayJobGroup = jobGroupLabelMap.get(fields.jobGroup ?? '') ?? '';
  const displayJobTitle = jobTitleLabelMap.get(fields.jobTitle ?? '') ?? '';
  const displayCareer = careerLabelMap.get(fields.careerYears ?? '') ?? '';
  const displayProfileKeywords = (fields.skillTags ?? [])
    .map((keyword) => coreKeywordLabelMap.get(keyword) ?? keyword)
    .filter((label) => label.length > 0);

  const previewFormValues = useMemo<MentorRegistrationFormValues>(() => {
    const defaults = createDefaultMentorSettings();
    const scheduleDrafts =
      fields.scheduleDrafts ?? createEmptyMentorScheduleDrafts();
    const schedule = applyMentorScheduleTextDrafts({
      schedule: fields.schedule ?? defaults.schedule,
      drafts: scheduleDrafts,
    }).schedule;

    return {
      ...defaults,
      contactCountryCode:
        fields.contactCountryCode ?? defaults.contactCountryCode,
      contactPhone: fields.contactPhone ?? '',
      contactEmail: fields.contactEmail ?? '',
      categories: [],
      mentoringTitle: fields.mentoringTitle ?? '',
      appealLine: fields.appealLine ?? '',
      jobGroup: fields.jobGroup ?? '',
      jobTitle: fields.jobTitle ?? '',
      careerYears: fields.careerYears ?? '',
      careerEntries: fields.careerEntries ?? [],
      skillTags: fields.skillTags,
      companyCategory: fields.companyCategory ?? defaults.companyCategory,
      companyName: fields.companyName ?? '',
      hideCompanyName: fields.hideCompanyName ?? defaults.hideCompanyName,
      listVisible: fields.listVisible ?? defaults.listVisible,
      maxParticipants: Math.min(
        10,
        Math.max(
          1,
          toSafeInteger(fields.maxParticipants, defaults.maxParticipants),
        ),
      ),
      noteEnabled: fields.noteEnabled ?? defaults.noteEnabled,
      notePrice: toSafeInteger(fields.notePrice, defaults.notePrice),
      simpleEnabled: fields.simpleEnabled ?? defaults.simpleEnabled,
      simplePrice: toSafeInteger(fields.simplePrice, defaults.simplePrice),
      deepEnabled: fields.deepEnabled ?? defaults.deepEnabled,
      deepPrice: toSafeInteger(fields.deepPrice, defaults.deepPrice),
      deepDurationMinutes: toDurationMinutes(
        fields.deepDurationMinutes,
        defaults.deepDurationMinutes,
      ),
      offlineEnabled: fields.offlineEnabled ?? defaults.offlineEnabled,
      offlinePrice: toSafeInteger(fields.offlinePrice, defaults.offlinePrice),
      offlineDurationMinutes: toDurationMinutes(
        fields.offlineDurationMinutes,
        defaults.offlineDurationMinutes,
      ),
      schedule,
      scheduleDrafts,
      detailedDescription: normalizeMentorMarkdownContent(
        fields.detailedDescription,
      ),
      interviewQuestions: normalizePreviewStringArray(
        fields.interviewQuestions,
      ),
      preNotice: normalizePreviewString(fields.preNotice),
      updatedAt: normalizePreviewString(fields.updatedAt) || defaults.updatedAt,
    };
  }, [fields]);

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
