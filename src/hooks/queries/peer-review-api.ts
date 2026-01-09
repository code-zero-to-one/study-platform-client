import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { PeerReviewApi } from '@/api/openapi';
import type {
  PeerReviewCreateRequest,
  PeerReviewUpdateRequest,
} from '@/api/openapi/models';

const peerReviewApi = createApiInstance(PeerReviewApi);

export const useGetPeerReviews = (homeworkId: number) => {
  return useQuery({
    queryKey: ['peerReviews', homeworkId],
    queryFn: async () => {
      const { data } = await peerReviewApi.getPeerReviews(homeworkId);
      return data.content;
    },
  });
};

export const useCreatePeerReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      homeworkId,
      request,
    }: {
      homeworkId: number;
      request: PeerReviewCreateRequest;
    }) => {
      const { data } = await peerReviewApi.createPeerReview(
        homeworkId,
        request,
      );
      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['peerReviews', variables.homeworkId],
      });
      await queryClient.invalidateQueries({
        queryKey: ['homework', variables.homeworkId],
      });
    },
  });
};

export const useUpdatePeerReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      peerReviewId,
      request,
    }: {
      peerReviewId: number;
      request: PeerReviewUpdateRequest;
    }) => {
      const { data } = await peerReviewApi.updatePeerReview(
        peerReviewId,
        request,
      );
      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['peerReviews'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['homework'],
      });
    },
  });
};

export const useDeletePeerReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (peerReviewId: number) => {
      const { data } = await peerReviewApi.deletePeerReview(peerReviewId);
      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['peerReviews'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['homework'],
      });
    },
  });
};
