import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { deleteComment } from '../api/delete-comment';
import { deleteThread } from '../api/delete-thread';
import { getComments } from '../api/get-comments';
import { getPost } from '../api/get-post';
import { getThreads } from '../api/get-threads';
import { postComment } from '../api/post-comment';
import { postCommentReaction } from '../api/post-comment-reaction';
import { postThread } from '../api/post-thread';
import { postThreadReaction } from '../api/post-thread-reaction';
import { putComment } from '../api/put-comment';
import { putThread } from '../api/put-thread';
import {
  DeleteCommentRequest,
  DeleteThreadReqeust,
  PostCommentReactionRequest,
  PostCommentRequest,
  PostThreadReactionRequest,
  PostThreadRequest,
  PutCommentRequest,
  PutThreadRequest,
} from '../api/types';

// post
export const usePostQuery = (groupStudyId: number) => {
  return useQuery({
    queryKey: ['post', groupStudyId],
    queryFn: () => getPost({ groupStudyId }),
    enabled: !!groupStudyId, // id가 존재할 때만 실행
  });
};

// thread
interface UseThreadsQueryParams {
  groupStudyId: number;
  page?: number;
  size?: number;
}

export const useThreadsQuery = ({
  groupStudyId,
  page = 1,
  size = 10,
}: UseThreadsQueryParams) => {
  return useQuery({
    queryKey: ['get-threads', groupStudyId, page, size],
    queryFn: () => getThreads({ groupStudyId, page: page - 1, size }),
    enabled: !!groupStudyId,
    placeholderData: keepPreviousData,
  });
};

export const usePostThreadMutation = () => {
  return useMutation({
    mutationFn: (param: PostThreadRequest) => postThread(param),
  });
};

export const useUpdateThreadMutation = () => {
  return useMutation({
    mutationFn: ({ groupStudyId, threadId, content }: PutThreadRequest) =>
      putThread({ groupStudyId, threadId, content }),
  });
};

export const useDeleteThreadMutation = () => {
  return useMutation({
    mutationFn: (param: DeleteThreadReqeust) => deleteThread(param),
  });
};

// comment
export const useCommentsQuery = (groupStudyId: number, threadId: number) => {
  return useQuery({
    queryKey: ['comments', groupStudyId, threadId],
    queryFn: () => getComments({ groupStudyId, threadId }),
    enabled: !!groupStudyId && !!threadId, // id가 존재할 때만 실행
  });
};

export const usePostCommentMutation = () => {
  return useMutation({
    mutationFn: (param: PostCommentRequest) => postComment(param),
  });
};

export const useUpdateCommentMutation = () => {
  return useMutation({
    mutationFn: (param: PutCommentRequest) => putComment(param),
  });
};

export const useDeleteCommentMutation = () => {
  return useMutation({
    mutationFn: (param: DeleteCommentRequest) => deleteComment(param),
  });
};

export const usePostThreadReactionMutation = () => {
  return useMutation({
    mutationFn: (param: PostThreadReactionRequest) => postThreadReaction(param),
  });
};

export const usePostCommentReactionMutation = () => {
  return useMutation({
    mutationFn: (param: PostCommentReactionRequest) =>
      postCommentReaction(param),
  });
};
