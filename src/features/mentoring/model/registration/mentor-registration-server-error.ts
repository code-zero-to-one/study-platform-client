import type { FieldPath } from 'react-hook-form';
import {
  MENTOR_REGISTRATION_STEP_IDS,
  type MentorRegistrationStepId,
} from '@/types/mentoring/registration-view';
import type { MentorRegistrationFormInputValues } from '@/types/schemas/mentor-registration-schema';

export interface MentorRegistrationServerValidationDetail {
  paramName: string;
  validationMessage: string;
}

export interface MentorRegistrationServerErrorTarget {
  fieldPath?: FieldPath<MentorRegistrationFormInputValues>;
  stepId?: MentorRegistrationStepId;
}

const normalizeValidationParamName = (paramName: string) => {
  return paramName.trim().replace(/\.<list element>/g, '');
};

const toFieldArrayPath = (
  value: string,
): FieldPath<MentorRegistrationFormInputValues> => {
  return value.replace(
    /\[(\d+)\]/g,
    '.$1',
  ) as FieldPath<MentorRegistrationFormInputValues>;
};

const hasFieldArrayPrefix = (value: string, field: string) => {
  return (
    value === field ||
    value.startsWith(`${field}[`) ||
    value.startsWith(`${field}.`)
  );
};

const DIGITS_ONLY_PATTERN = /^\d+$/;

const hasIndexedFieldArrayPrefix = (value: string, field: string) => {
  if (value.startsWith(`${field}[`)) {
    const firstSegment = value.slice(field.length + 1).split(']')[0] ?? '';

    return DIGITS_ONLY_PATTERN.test(firstSegment);
  }

  if (value.startsWith(`${field}.`)) {
    const firstSegment = value.slice(field.length + 1).split('.')[0] ?? '';

    return DIGITS_ONLY_PATTERN.test(firstSegment);
  }

  return false;
};

const isValidationDetailItem = (
  value: unknown,
): value is MentorRegistrationServerValidationDetail => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { paramName?: unknown }).paramName === 'string' &&
    typeof (value as { validationMessage?: unknown }).validationMessage ===
      'string'
  );
};

export const getMentorRegistrationValidationDetails = (
  detail: unknown,
): MentorRegistrationServerValidationDetail[] => {
  if (!Array.isArray(detail)) {
    return [];
  }

  return detail.filter(isValidationDetailItem);
};

const getMethodFieldPath = ({
  index,
  field,
}: {
  index: number;
  field: 'price' | 'durationMinutes';
}): FieldPath<MentorRegistrationFormInputValues> | undefined => {
  switch (index) {
    case 0:
      return field === 'price' ? 'notePrice' : undefined;
    case 1:
      return field === 'price' ? 'simplePrice' : undefined;
    case 2:
      return field === 'price' ? 'deepPrice' : 'deepDurationMinutes';
    case 3:
      return field === 'price' ? 'offlinePrice' : 'offlineDurationMinutes';
    default:
      return undefined;
  }
};

export const resolveMentorRegistrationServerErrorTarget = (
  rawParamName: string,
): MentorRegistrationServerErrorTarget => {
  const paramName = normalizeValidationParamName(rawParamName);

  if (paramName === 'mentoringTitle' || paramName === 'appealLine') {
    return {
      fieldPath: paramName,
      stepId: MENTOR_REGISTRATION_STEP_IDS.basicInformation,
    };
  }

  if (paramName === 'listVisible') {
    return {
      fieldPath: 'listVisible',
      stepId: MENTOR_REGISTRATION_STEP_IDS.basicInformation,
    };
  }

  if (
    paramName === 'jobGroupCode' ||
    paramName === 'jobTitleCode' ||
    paramName === 'careerCode'
  ) {
    return {
      fieldPath:
        paramName === 'jobGroupCode'
          ? 'jobGroup'
          : paramName === 'jobTitleCode'
            ? 'jobTitle'
            : 'careerYears',
      stepId: MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
    };
  }

  if (hasFieldArrayPrefix(paramName, 'careerEntries')) {
    return {
      fieldPath:
        paramName === 'careerEntries' ||
        !hasIndexedFieldArrayPrefix(paramName, 'careerEntries')
          ? 'careerEntries'
          : toFieldArrayPath(paramName),
      stepId: MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
    };
  }

  if (hasFieldArrayPrefix(paramName, 'coreKeywords')) {
    return {
      fieldPath: 'skillTags',
      stepId: MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
    };
  }

  if (paramName === 'detailedDescription' || paramName === 'preNotice') {
    return {
      fieldPath: paramName,
      stepId: MENTOR_REGISTRATION_STEP_IDS.mentorDescription,
    };
  }

  if (hasFieldArrayPrefix(paramName, 'interviewQuestions')) {
    return {
      fieldPath: 'interviewQuestions',
      stepId: MENTOR_REGISTRATION_STEP_IDS.mentorDescription,
    };
  }

  const methodMatch =
    /^methods(?:\[(\d+)\]|\.(\d+))(?:\.(price|durationMinutes))?$/.exec(
      paramName,
    );
  if (methodMatch) {
    const methodIndex = Number(methodMatch[1] ?? methodMatch[2]);
    const methodField = methodMatch[3] as
      | 'price'
      | 'durationMinutes'
      | undefined;

    return {
      fieldPath:
        methodField === undefined
          ? undefined
          : getMethodFieldPath({ index: methodIndex, field: methodField }),
      stepId: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
    };
  }

  if (paramName === 'methods' || paramName.startsWith('methods.')) {
    return {
      stepId: MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
    };
  }

  if (paramName === 'schedule' || paramName.startsWith('schedule.')) {
    return {
      fieldPath: 'schedule',
      stepId: MENTOR_REGISTRATION_STEP_IDS.schedule,
    };
  }

  return {};
};
