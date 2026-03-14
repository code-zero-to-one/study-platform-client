'use client';

import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  acceptMentoringRequest,
  cancelMentoringSession,
  closeMentoringRequest,
  createMentoringRequest,
  markMentoringSessionOutcome,
  rejectMentoringRequest,
  updateMentoringSession,
  updateMentorOperation,
  updateMentorScreening,
  upsertMentoringReview,
} from '@/features/mentoring/api/mentoring-lifecycle-api';
import type {
  UpsertMentorOperationParams,
  UpsertMentorScreeningParams,
} from '@/types/mentoring/admin-domain';
import type {
  AcceptMentoringRequestParams,
  CancelMentoringSessionParams,
  CloseMentoringRequestParams,
  CreateMentoringRequestParams,
  MarkMentoringSessionOutcomeParams,
  RejectMentoringRequestParams,
  RescheduleMentoringSessionParams,
  SubmitMentoringReviewParams,
} from '@/types/mentoring/management-api';
import { mentoringLifecycleQueryKeys } from './mentoring-lifecycle-query-keys';

const invalidateUserMentoringQueries = async (
  queryClient: QueryClient,
  requestId?: string,
) => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: mentoringLifecycleQueryKeys.myDashboards(),
    }),
    queryClient.invalidateQueries({
      queryKey: mentoringLifecycleQueryKeys.noteConsultations(),
    }),
    queryClient.invalidateQueries({
      queryKey: mentoringLifecycleQueryKeys.mentorWorkspaces(),
    }),
    queryClient.invalidateQueries({
      queryKey: mentoringLifecycleQueryKeys.admin(),
    }),
    requestId
      ? queryClient.invalidateQueries({
          queryKey: mentoringLifecycleQueryKeys.requestDetail(requestId),
        })
      : Promise.resolve(),
  ]);
};

export const useCreateMentoringRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mentorId,
      method,
      preferredDate,
      preferredTime,
      requestTitle,
      requestMessage,
      requestContents,
      attachmentFileKeys,
      attachedFileNames,
      referenceLinks,
    }: CreateMentoringRequestParams) =>
      createMentoringRequest({
        mentorId,
        method,
        preferredDate,
        preferredTime,
        requestTitle,
        requestMessage,
        requestContents,
        attachmentFileKeys,
        attachedFileNames,
        referenceLinks,
      }),
    onSuccess: async (_, variables) => {
      await invalidateUserMentoringQueries(queryClient);
      await queryClient.invalidateQueries({
        queryKey: mentoringLifecycleQueryKeys.mentorWorkspace(
          variables.mentorId,
        ),
      });
    },
  });
};

export const useAcceptMentoringRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      mentorNote,
      schedule,
    }: AcceptMentoringRequestParams) =>
      acceptMentoringRequest({
        requestId,
        mentorNote,
        schedule,
      }),
    onSuccess: async (_, variables) => {
      await invalidateUserMentoringQueries(queryClient, variables.requestId);
    },
  });
};

export const useRejectMentoringRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, reason }: RejectMentoringRequestParams) =>
      rejectMentoringRequest({
        requestId,
        reason,
      }),
    onSuccess: async (_, variables) => {
      await invalidateUserMentoringQueries(queryClient, variables.requestId);
    },
  });
};

export const useCloseMentoringRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, note }: CloseMentoringRequestParams) =>
      closeMentoringRequest({
        requestId,
        note,
      }),
    onSuccess: async (_, variables) => {
      await invalidateUserMentoringQueries(queryClient, variables.requestId);
    },
  });
};

export const useRescheduleMentoringSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      startsAt,
      endsAt,
      placeNote,
      mentorNote,
    }: RescheduleMentoringSessionParams) =>
      updateMentoringSession({
        sessionId,
        startsAt,
        endsAt,
        placeNote,
        mentorNote,
      }),
    onSuccess: async () => {
      await invalidateUserMentoringQueries(queryClient);
    },
  });
};

export const useCancelMentoringSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId: _requestId,
      sessionId,
      reason,
      issueType = 'MENTOR_CANCELLED',
    }: CancelMentoringSessionParams) =>
      cancelMentoringSession({
        sessionId,
        reason,
        issueType,
      }),
    onSuccess: async (_, variables) => {
      await invalidateUserMentoringQueries(queryClient, variables.requestId);
    },
  });
};

export const useMarkMentoringSessionOutcomeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      outcome,
      note,
    }: MarkMentoringSessionOutcomeParams) =>
      markMentoringSessionOutcome({
        sessionId,
        outcome,
        note,
      }),
    onSuccess: async () => {
      await invalidateUserMentoringQueries(queryClient);
    },
  });
};

export const useUpsertMentoringReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      rating,
      recommendation,
      content,
    }: SubmitMentoringReviewParams) =>
      upsertMentoringReview({
        requestId,
        rating,
        recommendation,
        content,
      }),
    onSuccess: async (_, variables) => {
      await invalidateUserMentoringQueries(queryClient, variables.requestId);
    },
  });
};

export const useUpdateMentorScreeningMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertMentorScreeningParams) =>
      updateMentorScreening(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: mentoringLifecycleQueryKeys.admin(),
      });
    },
  });
};

export const useUpdateMentorOperationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertMentorOperationParams) =>
      updateMentorOperation(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: mentoringLifecycleQueryKeys.admin(),
      });
      await queryClient.invalidateQueries({
        queryKey: mentoringLifecycleQueryKeys.mentorWorkspaces(),
      });
    },
  });
};
