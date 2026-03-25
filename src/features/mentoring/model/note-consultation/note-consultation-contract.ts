import type { ZodIssue } from 'zod';
import type { MentorProfile } from '@/types/mentoring/domain';
import type { MentoringRequest } from '@/types/mentoring/management-domain';
import type {
  NoteConsultationListQueryResult,
  NoteConsultationListQuerySource,
  SendNoteConsultationMessageMutationParams,
} from '@/types/mentoring/note-consultation-query';
import {
  noteConsultationListResponseSchema,
  noteConsultationQuerySourceSchema,
  sendNoteConsultationMessageParamsSchema,
  type NoteConsultationQuerySourceInput,
} from '@/types/schemas/note-consultation-schema';

type NoteConsultationContractScope =
  | 'query-source'
  | 'query-response'
  | 'send-message-params'
  | 'query-error'
  | 'mutation-error';

export class NoteConsultationContractError extends Error {
  public readonly code = 'NOTE_CONSULTATION_CONTRACT_ERROR';
  public readonly scope: NoteConsultationContractScope;
  public readonly issues: ZodIssue[];
  public readonly causeData?: unknown;

  public constructor({
    scope,
    issues,
    message,
    causeData,
  }: {
    scope: NoteConsultationContractScope;
    issues: ZodIssue[];
    message?: string;
    causeData?: unknown;
  }) {
    super(message ?? `Note consultation contract validation failed: ${scope}`);
    this.name = 'NoteConsultationContractError';
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
  scope: NoteConsultationContractScope;
  issues: ZodIssue[];
  message?: string;
  causeData?: unknown;
}) => {
  return new NoteConsultationContractError({
    scope,
    issues,
    message,
    causeData,
  });
};

const toStringKeyedRequestsByMentor = (
  requestsByMentor: Record<number, MentoringRequest[]>,
) => {
  return Object.entries(requestsByMentor).reduce<
    Record<string, MentoringRequest[]>
  >((accumulator, [mentorId, requests]) => {
    accumulator[mentorId] = requests;

    return accumulator;
  }, {});
};

const toNumberKeyedRequestsByMentor = (
  requestsByMentor: Record<string, MentoringRequest[]>,
) => {
  return Object.entries(requestsByMentor).reduce<
    Record<number, MentoringRequest[]>
  >((accumulator, [mentorId, requests]) => {
    accumulator[Number(mentorId)] = requests;

    return accumulator;
  }, {});
};

export const parseNoteConsultationQuerySourceOrThrow = (
  input: NoteConsultationListQuerySource,
): NoteConsultationListQuerySource => {
  const parseInput = {
    memberId: input.memberId,
    myMentorId: input.myMentorId,
    createdMentors: input.createdMentors,
    requestsByMentor: toStringKeyedRequestsByMentor(input.requestsByMentor),
  } satisfies NoteConsultationQuerySourceInput;

  const parsed = noteConsultationQuerySourceSchema.safeParse(parseInput);
  if (!parsed.success) {
    throw toContractError({
      scope: 'query-source',
      issues: parsed.error.issues,
    });
  }

  return {
    memberId: parsed.data.memberId,
    myMentorId: parsed.data.myMentorId,
    createdMentors: parsed.data.createdMentors as unknown as MentorProfile[],
    requestsByMentor: toNumberKeyedRequestsByMentor(
      parsed.data.requestsByMentor as Record<string, MentoringRequest[]>,
    ),
  };
};

export const parseNoteConsultationResponseOrThrow = (
  input: NoteConsultationListQueryResult,
): NoteConsultationListQueryResult => {
  const parsed = noteConsultationListResponseSchema.safeParse(input);

  if (!parsed.success) {
    throw toContractError({
      scope: 'query-response',
      issues: parsed.error.issues,
    });
  }

  return parsed.data as unknown as NoteConsultationListQueryResult;
};

export const parseSendNoteConsultationMessageParamsOrThrow = (
  input: SendNoteConsultationMessageMutationParams,
) => {
  const parsed = sendNoteConsultationMessageParamsSchema.safeParse(input);

  if (!parsed.success) {
    throw toContractError({
      scope: 'send-message-params',
      issues: parsed.error.issues,
    });
  }

  return parsed.data;
};

export const normalizeNoteConsultationQueryError = (error: unknown) => {
  if (error instanceof NoteConsultationContractError) {
    return error;
  }

  return toContractError({
    scope: 'query-error',
    issues: [],
    message: 'Note consultation query failed unexpectedly.',
    causeData: error,
  });
};

export const normalizeNoteConsultationMutationError = (error: unknown) => {
  if (error instanceof NoteConsultationContractError) {
    return error;
  }

  if (error instanceof Error) {
    return toContractError({
      scope: 'mutation-error',
      issues: [],
      message: error.message,
      causeData: error,
    });
  }

  return toContractError({
    scope: 'mutation-error',
    issues: [],
    message: '메시지 전송에 실패했습니다.',
    causeData: error,
  });
};
