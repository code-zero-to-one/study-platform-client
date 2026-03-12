import type { ZodIssue } from 'zod';
import type {
  AdminMatchingAdminOption,
  AdminMatchingSchedulerConfig,
  AdminMatchingRequestDetail,
  AdminMatchingRequestListPage,
  AdminMatchingResetSummary,
} from '@/types/matching/admin-domain';
import {
  DEFAULT_ADMIN_MATCHING_SCHEDULED_DAY_OF_WEEK,
  DEFAULT_ADMIN_MATCHING_SCHEDULED_TIME,
} from '@/types/matching/admin-domain';
import {
  adminMatchingAdminMemberListResponseSchema,
  adminMatchingSchedulerConfigResponseSchema,
  adminMatchingRequestListResponseSchema,
  adminMatchingRequestResponseSchema,
  adminMatchingSystemStatusResponseSchema,
  resetWeeklyMatchingResponseSchema,
} from '@/types/schemas/admin-matching-schema';

type AdminMatchingContractScope =
  | 'admin-member-list-response'
  | 'scheduler-config-response'
  | 'request-response'
  | 'request-list-response'
  | 'system-status-response'
  | 'reset-response'
  | 'query-error';

export class AdminMatchingContractError extends Error {
  public readonly code = 'ADMIN_MATCHING_CONTRACT_ERROR';
  public readonly scope: AdminMatchingContractScope;
  public readonly issues: ZodIssue[];
  public readonly causeData?: unknown;

  public constructor({
    scope,
    issues,
    message,
    causeData,
  }: {
    scope: AdminMatchingContractScope;
    issues: ZodIssue[];
    message?: string;
    causeData?: unknown;
  }) {
    super(message ?? `Admin matching contract validation failed: ${scope}`);
    this.name = 'AdminMatchingContractError';
    this.scope = scope;
    this.issues = issues;
    this.causeData = causeData;
  }
}

const toContractError = ({
  scope,
  issues,
  message,
  causeData,
}: {
  scope: AdminMatchingContractScope;
  issues: ZodIssue[];
  message?: string;
  causeData?: unknown;
}) => {
  return new AdminMatchingContractError({
    scope,
    issues,
    message,
    causeData,
  });
};

export const parseAdminMatchingRequestOrThrow = (
  input: unknown,
): AdminMatchingRequestDetail => {
  const parsed = adminMatchingRequestResponseSchema.safeParse(input);

  if (!parsed.success) {
    throw toContractError({
      scope: 'request-response',
      issues: parsed.error.issues,
      causeData: input,
    });
  }

  return {
    ...parsed.data,
    content: parsed.data.content ?? undefined,
    memberName: parsed.data.memberName ?? undefined,
    partnerName: parsed.data.partnerName ?? undefined,
  };
};

export const parseAdminMatchingRequestListOrThrow = (
  input: unknown,
): AdminMatchingRequestListPage => {
  const parsed = adminMatchingRequestListResponseSchema.safeParse(input);

  if (!parsed.success) {
    throw toContractError({
      scope: 'request-list-response',
      issues: parsed.error.issues,
      causeData: input,
    });
  }

  return {
    ...parsed.data,
    content: parsed.data.content.map((request) => ({
      ...request,
      content: request.content ?? undefined,
      memberName: request.memberName ?? undefined,
      partnerName: request.partnerName ?? undefined,
    })),
  };
};

export const parseAdminMatchingAdminOptionsOrThrow = (
  input: unknown,
): AdminMatchingAdminOption[] => {
  const parsed = adminMatchingAdminMemberListResponseSchema.safeParse(input);

  if (!parsed.success) {
    throw toContractError({
      scope: 'admin-member-list-response',
      issues: parsed.error.issues,
      causeData: input,
    });
  }

  return parsed.data.content.map((member) => ({
    memberId: member.memberId,
    memberName: member.memberName,
    memberNickname: member.memberNickname ?? undefined,
  }));
};

export const parseAdminMatchingSchedulerConfigOrThrow = (
  input: unknown,
): AdminMatchingSchedulerConfig => {
  const parsed = adminMatchingSchedulerConfigResponseSchema.safeParse(input);

  if (!parsed.success) {
    throw toContractError({
      scope: 'scheduler-config-response',
      issues: parsed.error.issues,
      causeData: input,
    });
  }

  return {
    enabled: parsed.data.enabled ?? false,
    autoCycleEndEnabled: parsed.data.autoCycleEndEnabled ?? false,
    adminId: parsed.data.adminId ?? undefined,
    adminName: parsed.data.adminName ?? undefined,
    scheduledDayOfWeek:
      parsed.data.scheduledDayOfWeek ??
      DEFAULT_ADMIN_MATCHING_SCHEDULED_DAY_OF_WEEK,
    scheduledTime:
      parsed.data.scheduledTime ?? DEFAULT_ADMIN_MATCHING_SCHEDULED_TIME,
    templateType: parsed.data.templateType ?? undefined,
    matchingKValue: parsed.data.matchingKValue ?? undefined,
    numberOfNearestNeighbors: parsed.data.numberOfNearestNeighbors ?? undefined,
    chunkSize: parsed.data.chunkSize ?? undefined,
    saveResultsChunkSize: parsed.data.saveResultsChunkSize ?? undefined,
    updatedAt: parsed.data.updatedAt ?? undefined,
  };
};

export const parseAdminMatchingSystemStatusOrThrow = (input: unknown) => {
  const parsed = adminMatchingSystemStatusResponseSchema.safeParse(input);

  if (!parsed.success) {
    throw toContractError({
      scope: 'system-status-response',
      issues: parsed.error.issues,
      causeData: input,
    });
  }

  return parsed.data;
};

export const parseResetWeeklyMatchingResponseOrThrow = (
  input: unknown,
): AdminMatchingResetSummary => {
  const parsed = resetWeeklyMatchingResponseSchema.safeParse(input);

  if (!parsed.success) {
    throw toContractError({
      scope: 'reset-response',
      issues: parsed.error.issues,
      causeData: input,
    });
  }

  return parsed.data;
};

export const normalizeAdminMatchingQueryError = (error: unknown) => {
  if (error instanceof Error) {
    return error;
  }

  return toContractError({
    scope: 'query-error',
    issues: [],
    message: 'Admin matching query failed unexpectedly.',
    causeData: error,
  });
};
