import { useCallback, useEffect, useMemo } from 'react';
import type { UseFormSetValue } from 'react-hook-form';
import { normalizeMentorProfileKeywordValues } from '@/features/mentoring/model/registration/mentor-registration-keywords';
import type { MentorRegistrationOptions } from '@/types/mentoring/registration-options';
import type { MentorRegistrationPersistedPredefinedCoreKeyword } from '@/types/mentoring/registration-view';
import type { MentorRegistrationFormInputValues } from '@/types/schemas/mentor-registration-schema';

export interface MentorRegistrationSelectionOption {
  value: string;
  label: string;
}

interface UseMentorRegistrationSelectionStateParams {
  options: MentorRegistrationOptions;
  persistedPredefinedCoreKeywords: ReadonlyArray<MentorRegistrationPersistedPredefinedCoreKeyword>;
  jobGroup: string;
  jobTitle: string;
  careerYears: string;
  profileKeywords: string[];
  setValue: UseFormSetValue<MentorRegistrationFormInputValues>;
}

export const useMentorRegistrationSelectionState = ({
  options,
  persistedPredefinedCoreKeywords,
  jobGroup,
  jobTitle,
  careerYears,
  profileKeywords,
  setValue,
}: UseMentorRegistrationSelectionStateParams) => {
  const selectableJobGroupOptions = useMemo(() => {
    return options.jobGroups
      .filter((option) => option.active)
      .map((option) => ({
        value: option.code,
        label: option.label,
      }));
  }, [options.jobGroups]);

  const jobGroupLabelMap = useMemo(
    () =>
      new Map(options.jobGroups.map((option) => [option.code, option.label])),
    [options.jobGroups],
  );

  const jobGroupOptions = useMemo(() => {
    if (
      !jobGroup ||
      selectableJobGroupOptions.some((option) => option.value === jobGroup)
    ) {
      return selectableJobGroupOptions;
    }

    return [
      ...selectableJobGroupOptions,
      {
        value: jobGroup,
        label: `${jobGroupLabelMap.get(jobGroup) ?? jobGroup} (재선택 필요)`,
      },
    ];
  }, [jobGroup, jobGroupLabelMap, selectableJobGroupOptions]);

  const jobTitleLabelMap = useMemo(
    () =>
      new Map(options.jobTitles.map((option) => [option.code, option.label])),
    [options.jobTitles],
  );

  const careerLabelMap = useMemo(
    () => new Map(options.careers.map((option) => [option.code, option.label])),
    [options.careers],
  );

  const maxSelectableCoreKeywordCount = Math.max(
    1,
    options.maxCoreKeywordCount,
  );

  const registeredCoreKeywordLabelMap = useMemo(() => {
    const labelMap = new Map(
      options.selectableCoreKeywords.map((keyword) => [
        keyword.code.toLowerCase(),
        keyword.label,
      ]),
    );

    persistedPredefinedCoreKeywords.forEach((keyword) => {
      const normalizedCode = keyword.code.toLowerCase();

      if (!labelMap.has(normalizedCode)) {
        labelMap.set(normalizedCode, keyword.label);
      }
    });

    return labelMap;
  }, [options.selectableCoreKeywords, persistedPredefinedCoreKeywords]);

  const selectableJobTitleOptions = useMemo(
    () =>
      options.jobTitles
        .filter((option) => option.active && option.jobGroupCode === jobGroup)
        .map((option) => ({
          value: option.code,
          label: option.label,
        })),
    [jobGroup, options.jobTitles],
  );

  const jobTitleOptions = useMemo(() => {
    if (
      !jobTitle ||
      selectableJobTitleOptions.some((option) => option.value === jobTitle)
    ) {
      return selectableJobTitleOptions;
    }

    return [
      ...selectableJobTitleOptions,
      {
        value: jobTitle,
        label: `${jobTitleLabelMap.get(jobTitle) ?? jobTitle} (재선택 필요)`,
      },
    ];
  }, [jobTitle, jobTitleLabelMap, selectableJobTitleOptions]);

  const selectableCareerOptions = useMemo(
    () =>
      options.careers
        .filter((option) => option.active)
        .map((option) => ({
          value: option.code,
          label: option.label,
        })),
    [options.careers],
  );

  const careerOptions = useMemo(() => {
    if (
      !careerYears ||
      selectableCareerOptions.some((option) => option.value === careerYears)
    ) {
      return selectableCareerOptions;
    }

    return [
      ...selectableCareerOptions,
      {
        value: careerYears,
        label: `${careerLabelMap.get(careerYears) ?? careerYears} (재선택 필요)`,
      },
    ];
  }, [careerLabelMap, careerYears, selectableCareerOptions]);

  const selectableCoreKeywordOptions = useMemo(
    () =>
      options.selectableCoreKeywords
        .filter((keyword) => {
          if (!keyword.active) {
            return false;
          }

          const matchesJobGroup =
            keyword.jobGroupCodes.length === 0 ||
            keyword.jobGroupCodes.includes(jobGroup);
          const matchesJobTitle =
            keyword.jobTitleCodes.length === 0 ||
            keyword.jobTitleCodes.includes(jobTitle);

          return matchesJobGroup && matchesJobTitle;
        })
        .map((keyword) => ({
          value: keyword.code,
          label: keyword.label,
        })),
    [jobGroup, jobTitle, options.selectableCoreKeywords],
  );

  const additionalSelectedCoreKeywordOptions = useMemo(() => {
    const appendedOptions: MentorRegistrationSelectionOption[] = [];
    const seenValues = new Set(
      selectableCoreKeywordOptions.map((option) => option.value.toLowerCase()),
    );

    profileKeywords.forEach((keyword) => {
      const normalizedKeyword = keyword.toLowerCase();

      if (seenValues.has(normalizedKeyword)) {
        return;
      }

      const label = registeredCoreKeywordLabelMap.get(normalizedKeyword);
      if (!label) {
        return;
      }

      seenValues.add(normalizedKeyword);
      appendedOptions.push({
        value: keyword,
        label: `${label} (재선택 필요)`,
      });
    });

    return appendedOptions;
  }, [
    profileKeywords,
    registeredCoreKeywordLabelMap,
    selectableCoreKeywordOptions,
  ]);

  const visibleCoreKeywordOptions = useMemo(
    () => [
      ...selectableCoreKeywordOptions,
      ...additionalSelectedCoreKeywordOptions,
    ],
    [additionalSelectedCoreKeywordOptions, selectableCoreKeywordOptions],
  );

  const coreKeywordValueSet = useMemo(
    () =>
      new Set(
        selectableCoreKeywordOptions.map((option) =>
          option.value.toLowerCase(),
        ),
      ),
    [selectableCoreKeywordOptions],
  );

  const normalizeProfileKeywordSelection = useCallback(
    (nextProfileKeywords: string[]) =>
      normalizeMentorProfileKeywordValues({
        profileKeywords: nextProfileKeywords,
        registrationOptions: options,
        persistedPredefinedCoreKeywords,
      }),
    [options, persistedPredefinedCoreKeywords],
  );

  const validJobGroupSet = useMemo(
    () => new Set(selectableJobGroupOptions.map((option) => option.value)),
    [selectableJobGroupOptions],
  );

  const validJobTitleSet = useMemo(
    () => new Set(selectableJobTitleOptions.map((option) => option.value)),
    [selectableJobTitleOptions],
  );

  const validCareerSet = useMemo(
    () => new Set(selectableCareerOptions.map((option) => option.value)),
    [selectableCareerOptions],
  );

  const jobGroupSelectionMessage = useMemo(() => {
    if (!jobGroup || validJobGroupSet.has(jobGroup)) {
      return undefined;
    }

    return `선택한 직군 "${jobGroupLabelMap.get(jobGroup) ?? jobGroup}"이 현재 옵션과 맞지 않아 다시 선택해야 합니다.`;
  }, [jobGroup, jobGroupLabelMap, validJobGroupSet]);

  const jobTitleSelectionMessage = useMemo(() => {
    if (!jobTitle || validJobTitleSet.has(jobTitle)) {
      return undefined;
    }

    return `선택한 직무 "${jobTitleLabelMap.get(jobTitle) ?? jobTitle}"가 현재 직군과 맞지 않아 다시 선택해야 합니다.`;
  }, [jobTitle, jobTitleLabelMap, validJobTitleSet]);

  const careerSelectionMessage = useMemo(() => {
    if (!careerYears || validCareerSet.has(careerYears)) {
      return undefined;
    }

    return `선택한 경력 "${careerLabelMap.get(careerYears) ?? careerYears}"가 현재 옵션과 맞지 않아 다시 선택해야 합니다.`;
  }, [careerLabelMap, careerYears, validCareerSet]);

  const deprecatedRegisteredCoreKeywords = useMemo(
    () =>
      profileKeywords.filter((keyword: string) => {
        const normalizedKeyword = keyword.toLowerCase();

        return (
          registeredCoreKeywordLabelMap.has(normalizedKeyword) &&
          !coreKeywordValueSet.has(normalizedKeyword)
        );
      }),
    [coreKeywordValueSet, profileKeywords, registeredCoreKeywordLabelMap],
  );

  const deprecatedCoreKeywordMessage =
    deprecatedRegisteredCoreKeywords.length > 0
      ? '현재 직군/직무와 맞지 않는 핵심 키워드가 있어 다시 선택해야 합니다.'
      : undefined;

  const coreKeywordLimitMessage =
    profileKeywords.length > maxSelectableCoreKeywordCount
      ? `핵심 키워드는 최대 ${maxSelectableCoreKeywordCount}개까지만 저장할 수 있습니다.`
      : undefined;

  const mentorPositionErrorMessage =
    jobGroupSelectionMessage ??
    jobTitleSelectionMessage ??
    careerSelectionMessage;

  const skillTagErrorMessage =
    coreKeywordLimitMessage ?? deprecatedCoreKeywordMessage;

  const selectionValidationMessages = [
    jobGroupSelectionMessage,
    jobTitleSelectionMessage,
    careerSelectionMessage,
    deprecatedCoreKeywordMessage,
    coreKeywordLimitMessage,
  ].filter((message): message is string => Boolean(message));

  const hasSelectedSkillTags = profileKeywords.some(
    (tag) => tag.trim().length > 0,
  );

  const isMentorInformationSelectionReady =
    !jobGroupSelectionMessage &&
    !jobTitleSelectionMessage &&
    !careerSelectionMessage &&
    !deprecatedCoreKeywordMessage &&
    !coreKeywordLimitMessage;

  useEffect(() => {
    const normalizedProfileKeywords =
      normalizeProfileKeywordSelection(profileKeywords);
    const hasSameProfileKeywords =
      normalizedProfileKeywords.length === profileKeywords.length &&
      normalizedProfileKeywords.every(
        (keyword, index) => keyword === profileKeywords[index],
      );

    if (hasSameProfileKeywords) {
      return;
    }

    setValue('skillTags', normalizedProfileKeywords, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [normalizeProfileKeywordSelection, profileKeywords, setValue]);

  return {
    jobGroupOptions,
    jobTitleOptions,
    careerOptions,
    visibleCoreKeywordOptions,
    maxSelectableCoreKeywordCount,
    mentorPositionErrorMessage,
    skillTagErrorMessage,
    selectionValidationMessages,
    hasSelectedSkillTags,
    isMentorInformationSelectionReady,
    normalizeProfileKeywordSelection,
  };
};
