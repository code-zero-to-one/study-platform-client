import type { ZodIssue } from 'zod';
import type { AdminMentoringOverviewQueryResult } from '@/types/mentoring/admin-domain';
import {
  adminMentoringOverviewResponseSchema,
  sessionOperationsSearchParamsSchema,
  type SessionOperationsSearchParamsInput,
} from '@/types/schemas/mentoring-admin-schema';

type AdminMentoringContractScope =
  | 'query-response'
  | 'mentor-filter-search-params'
  | 'query-error';

export class AdminMentoringContractError extends Error {
  public readonly code = 'ADMIN_MENTORING_CONTRACT_ERROR';
  public readonly scope: AdminMentoringContractScope;
  public readonly issues: ZodIssue[];
  public readonly causeData?: unknown;

  public constructor({
    scope,
    issues,
    message,
    causeData,
  }: {
    scope: AdminMentoringContractScope;
    issues: ZodIssue[];
    message?: string;
    causeData?: unknown;
  }) {
    super(message ?? `Admin mentoring contract validation failed: ${scope}`);
    this.name = 'AdminMentoringContractError';
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
  scope: AdminMentoringContractScope;
  issues: ZodIssue[];
  message?: string;
  causeData?: unknown;
}) => {
  return new AdminMentoringContractError({
    scope,
    issues,
    message,
    causeData,
  });
};

export const parseAdminMentoringOverviewResponseOrThrow = (
  input: AdminMentoringOverviewQueryResult,
): AdminMentoringOverviewQueryResult => {
  const parsed = adminMentoringOverviewResponseSchema.safeParse(input);

  if (!parsed.success) {
    throw toContractError({
      scope: 'query-response',
      issues: parsed.error.issues,
    });
  }

  return parsed.data as unknown as AdminMentoringOverviewQueryResult;
};

export const parseAdminMentoringMentorFilterSearchParams = (
  input: SessionOperationsSearchParamsInput,
) => {
  const parsed = sessionOperationsSearchParamsSchema.safeParse(input);

  if (!parsed.success) {
    return {
      mentorId: undefined,
    };
  }

  return parsed.data;
};

export const parseSessionOperationsSearchParams =
  parseAdminMentoringMentorFilterSearchParams;

export const normalizeAdminMentoringOverviewQueryError = (error: unknown) => {
  if (error instanceof AdminMentoringContractError) {
    return error;
  }

  return toContractError({
    scope: 'query-error',
    issues: [],
    message: 'Admin mentoring query failed unexpectedly.',
    causeData: error,
  });
};
