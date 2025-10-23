import { useQuery } from '@tanstack/react-query';
import { getComments } from '../api/get-comments';
import { getPost } from '../api/get-post';
import { getThreads } from '../api/get-threads';

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
    queryKey: ['threads', groupStudyId],
    queryFn: () => getThreads({ groupStudyId }),
    enabled: !!groupStudyId, // id가 존재할 때만 실행
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
