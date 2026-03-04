export type MentorApiContractScope =
  | 'mentor-registration-options-response'
  | 'mentor-list-response'
  | 'mentor-detail-response'
  | 'my-mentor-settings-response';

export class MentorApiContractError extends Error {
  public readonly code = 'MENTOR_API_CONTRACT_ERROR';
  public readonly scope: MentorApiContractScope;
  public readonly causeData?: unknown;

  public constructor({
    scope,
    message,
    causeData,
  }: {
    scope: MentorApiContractScope;
    message: string;
    causeData?: unknown;
  }) {
    super(message);
    this.name = 'MentorApiContractError';
    this.scope = scope;
    this.causeData = causeData;
  }
}

export const toContractError = ({
  scope,
  field,
  causeData,
}: {
  scope: MentorApiContractScope;
  field: string;
  causeData?: unknown;
}) => {
  return new MentorApiContractError({
    scope,
    message: `멘토 API 응답 계약이 올바르지 않습니다. (${field})`,
    causeData,
  });
};

export const requireObject = <T extends object>({
  value,
  scope,
  field,
}: {
  value: unknown;
  scope: MentorApiContractScope;
  field: string;
}): T => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw toContractError({
      scope,
      field,
      causeData: value,
    });
  }

  return value as T;
};

export const requireArray = <T>({
  value,
  scope,
  field,
}: {
  value: unknown;
  scope: MentorApiContractScope;
  field: string;
}): T[] => {
  if (!Array.isArray(value)) {
    throw toContractError({
      scope,
      field,
      causeData: value,
    });
  }

  return value as T[];
};

export const requireInteger = ({
  value,
  scope,
  field,
}: {
  value: unknown;
  scope: MentorApiContractScope;
  field: string;
}) => {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    !Number.isInteger(value)
  ) {
    throw toContractError({
      scope,
      field,
      causeData: value,
    });
  }

  return value;
};

export const requireNonEmptyString = ({
  value,
  scope,
  field,
}: {
  value: unknown;
  scope: MentorApiContractScope;
  field: string;
}) => {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized) {
    throw toContractError({
      scope,
      field,
      causeData: value,
    });
  }

  return normalized;
};
