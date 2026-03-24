import { normalizeMentorProfileKeywordValues } from '@/features/mentoring/model/mentor-registration-keywords';
import type { MentorRegistrationOptions } from '@/types/mentoring/registration-options';
import type { MentorApiContractScope } from './mentor-api-contract';
import {
  requireArray,
  requireNonEmptyString,
  requireObject,
  toContractError,
} from './mentor-api-contract';
import type {
  MentorCoreKeywordRequestDto,
  MentorReadableCoreKeywordResponseDto,
  MentorSavedCoreKeywordResponseDto,
} from './mentor-api.types';

export interface MentorCoreKeywordSnapshot {
  type: 'PREDEFINED' | 'CUSTOM';
  code?: string;
  label: string;
}

const normalizeSavedCoreKeywordType = ({
  value,
  scope,
  field,
}: {
  value: unknown;
  scope: MentorApiContractScope;
  field: string;
}): NonNullable<MentorSavedCoreKeywordResponseDto['type']> => {
  if (value === 'PREDEFINED' || value === 'CUSTOM') {
    return value;
  }

  throw toContractError({
    scope,
    field,
    causeData: value,
  });
};

const toTrimmedString = (value: unknown) => {
  return typeof value === 'string' ? value.trim() : '';
};

const readMentorCoreKeyword = ({
  value,
  scope,
  field,
}: {
  value: unknown;
  scope: MentorApiContractScope;
  field: string;
}): MentorCoreKeywordSnapshot => {
  const keyword = requireObject<MentorReadableCoreKeywordResponseDto>({
    value,
    scope,
    field,
  });
  const label = requireNonEmptyString({
    value: keyword.label,
    scope,
    field: `${field}.label`,
  });
  const code = toTrimmedString(keyword.code);

  if ('type' in keyword && keyword.type !== undefined) {
    const type = normalizeSavedCoreKeywordType({
      value: keyword.type,
      scope,
      field: `${field}.type`,
    });

    if (type === 'PREDEFINED') {
      return {
        type,
        code: requireNonEmptyString({
          value: keyword.code,
          scope,
          field: `${field}.code`,
        }),
        label,
      };
    }

    return {
      type,
      label,
    };
  }

  if (code.length > 0) {
    return {
      type: 'PREDEFINED',
      code,
      label,
    };
  }

  return {
    type: 'CUSTOM',
    label,
  };
};

export const requireMentorCoreKeywordFormValues = ({
  value,
  scope,
  field,
}: {
  value: unknown;
  scope: MentorApiContractScope;
  field: string;
}) => {
  const keywords = requireArray<unknown>({
    value,
    scope,
    field,
  });

  return keywords.map((item, index) => {
    const keyword = readMentorCoreKeyword({
      value: item,
      scope,
      field: `${field}[${index}]`,
    });

    if (keyword.type === 'PREDEFINED' && keyword.code) {
      return keyword.code;
    }

    return keyword.label;
  });
};

export const requireMentorCoreKeywordSnapshots = ({
  value,
  scope,
  field,
}: {
  value: unknown;
  scope: MentorApiContractScope;
  field: string;
}): MentorCoreKeywordSnapshot[] => {
  const keywords = requireArray<unknown>({
    value,
    scope,
    field,
  });

  return keywords.map((item, index) => {
    return readMentorCoreKeyword({
      value: item,
      scope,
      field: `${field}[${index}]`,
    });
  });
};

export const requireMentorCoreKeywordLabels = ({
  value,
  scope,
  field,
}: {
  value: unknown;
  scope: MentorApiContractScope;
  field: string;
}) => {
  const keywords = requireArray<unknown>({
    value,
    scope,
    field,
  });

  return keywords.map((item, index) => {
    const keyword = readMentorCoreKeyword({
      value: item,
      scope,
      field: `${field}[${index}]`,
    });

    return keyword.label;
  });
};

export const buildMentorCoreKeywordRequests = ({
  profileKeywords,
  registrationOptions,
  persistedPredefinedCoreKeywords = [],
}: {
  profileKeywords: string[];
  registrationOptions: MentorRegistrationOptions;
  persistedPredefinedCoreKeywords?: ReadonlyArray<{
    code: string;
    label: string;
  }>;
}): MentorCoreKeywordRequestDto[] => {
  const normalizedProfileKeywords = normalizeMentorProfileKeywordValues({
    profileKeywords,
    registrationOptions,
    persistedPredefinedCoreKeywords,
  });
  const predefinedCodeMap = new Map(
    registrationOptions.selectableCoreKeywords.map((keyword) => [
      keyword.code.trim().toLowerCase(),
      keyword.code,
    ]),
  );
  persistedPredefinedCoreKeywords.forEach((keyword) => {
    const normalizedCode = keyword.code.trim().toLowerCase();

    if (!predefinedCodeMap.has(normalizedCode)) {
      predefinedCodeMap.set(normalizedCode, keyword.code);
    }
  });

  return normalizedProfileKeywords.flatMap<MentorCoreKeywordRequestDto>(
    (profileKeyword) => {
      const predefinedCode = predefinedCodeMap.get(
        profileKeyword.trim().toLowerCase(),
      );

      return predefinedCode
        ? [
            {
              type: 'PREDEFINED',
              code: predefinedCode,
            },
          ]
        : [
            {
              type: 'CUSTOM',
              label: profileKeyword,
            },
          ];
    },
  );
};
