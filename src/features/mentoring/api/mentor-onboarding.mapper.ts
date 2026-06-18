import {
  requireNonEmptyString,
  requireObject,
  toContractError,
} from './mentor-api-contract';
import type { MentorEntryOnboardingStatusResponseDto } from './mentor-api.types';

export interface MentorEntryOnboardingStatus {
  key: string;
  version: string;
  show: boolean;
  // eslint-disable-next-line @rushstack/no-new-null -- backend response uses null for unseen onboarding.
  seenAt: string | null;
}

const toTrimmedString = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

export const mapMentorEntryOnboardingStatusContent = (
  content: unknown,
): MentorEntryOnboardingStatus => {
  const source = requireObject<MentorEntryOnboardingStatusResponseDto>({
    value: content,
    scope: 'mentor-entry-onboarding-response',
    field: 'content',
  });
  if (typeof source.show !== 'boolean') {
    throw toContractError({
      scope: 'mentor-entry-onboarding-response',
      field: 'content.show',
      causeData: source.show,
    });
  }

  const seenAt = toTrimmedString(source.seenAt);

  return {
    key: requireNonEmptyString({
      value: source.key,
      scope: 'mentor-entry-onboarding-response',
      field: 'content.key',
    }),
    version: requireNonEmptyString({
      value: source.version,
      scope: 'mentor-entry-onboarding-response',
      field: 'content.version',
    }),
    show: source.show,
    seenAt: seenAt.length > 0 ? seenAt : null,
  };
};
