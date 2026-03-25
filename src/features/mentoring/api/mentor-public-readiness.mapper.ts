import type {
  MentorProfile,
  MentorPublicReadinessSnapshot,
} from '@/types/mentoring/domain';
import type { MentorApiContractScope } from './mentor-api-contract';
import { requireObject, toContractError } from './mentor-api-contract';
import type {
  MentorPublicReadinessResponseDto,
  MentorPublicReadinessStepsResponseDto,
} from './mentor-api.types';

const requireBooleanValue = ({
  value,
  scope,
  field,
}: {
  value: unknown;
  scope: MentorApiContractScope;
  field: string;
}) => {
  if (typeof value !== 'boolean') {
    throw toContractError({
      scope,
      field,
      causeData: value,
    });
  }

  return value;
};

export const normalizePublicReadinessStage = (
  value: unknown,
): MentorProfile['publicReadinessStage'] => {
  return value === 'DETAIL_PREPARING' ||
    value === 'APPLY_PREPARING' ||
    value === 'APPLY_READY'
    ? value
    : undefined;
};

export const toPublicReadinessStage = (
  publicReadiness: MentorPublicReadinessSnapshot,
): MentorProfile['publicReadinessStage'] => {
  if (!publicReadiness.detailReady) {
    return 'DETAIL_PREPARING';
  }

  if (!publicReadiness.applicationReady) {
    return 'APPLY_PREPARING';
  }

  return 'APPLY_READY';
};

export const mapMentorPublicReadiness = ({
  value,
  scope,
  field,
}: {
  value: unknown;
  scope: MentorApiContractScope;
  field: string;
}): MentorPublicReadinessSnapshot => {
  const publicReadiness = requireObject<MentorPublicReadinessResponseDto>({
    value,
    scope,
    field,
  });
  const steps = requireObject<MentorPublicReadinessStepsResponseDto>({
    value: publicReadiness.steps,
    scope,
    field: `${field}.steps`,
  });

  return {
    listReady: requireBooleanValue({
      value: publicReadiness.listReady,
      scope,
      field: `${field}.listReady`,
    }),
    detailReady: requireBooleanValue({
      value: publicReadiness.detailReady,
      scope,
      field: `${field}.detailReady`,
    }),
    applicationReady: requireBooleanValue({
      value: publicReadiness.applicationReady,
      scope,
      field: `${field}.applicationReady`,
    }),
    steps: {
      basicInformation: requireBooleanValue({
        value: steps.basicInformation,
        scope,
        field: `${field}.steps.basicInformation`,
      }),
      mentorInformation: requireBooleanValue({
        value: steps.mentorInformation,
        scope,
        field: `${field}.steps.mentorInformation`,
      }),
      mentorDescription: requireBooleanValue({
        value: steps.mentorDescription,
        scope,
        field: `${field}.steps.mentorDescription`,
      }),
      pricingAndTime: requireBooleanValue({
        value: steps.pricingAndTime,
        scope,
        field: `${field}.steps.pricingAndTime`,
      }),
      schedule: requireBooleanValue({
        value: steps.schedule,
        scope,
        field: `${field}.steps.schedule`,
      }),
      settlement: requireBooleanValue({
        value: steps.settlement,
        scope,
        field: `${field}.steps.settlement`,
      }),
    },
  };
};
