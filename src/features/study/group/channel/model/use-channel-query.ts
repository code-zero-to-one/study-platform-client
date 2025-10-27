import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteComment } from '../api/delete-comment';
import { deleteThread } from '../api/delete-thread';
import { getComments } from '../api/get-comments';
import { getPost } from '../api/get-post';
import { getThreads } from '../api/get-threads';
import { postComment } from '../api/post-comment';
import { postThread } from '../api/post-thread';
import { putThread } from '../api/put-thread';
import {
  DeleteCommentRequest,
  DeleteThreadReqeust,
  PostCommentRequest,
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
export const useThreadsQuery = (groupStudyId: number) => {
  return useQuery({
    queryKey: ['get-threads', groupStudyId],
    queryFn: () => getThreads({ groupStudyId }),
    enabled: !!groupStudyId, // id가 존재할 때만 실행
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
    mutationFn: (param: PutCommentRequest) => putThread(param),
  });
};

export const useDeleteCommentMutation = () => {
  return useMutation({
    mutationFn: (param: DeleteCommentRequest) => deleteComment(param),
  });
};
