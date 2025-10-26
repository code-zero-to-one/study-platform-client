import { axiosInstance } from '@/shared/tanstack-query/axios';
import { PutCommentRequest } from './types';

export const putComment = async (param: PutCommentRequest) => {
  const { groupStudyId, threadId, content, commentId } = param;

  try {
    const { data } = await axiosInstance.put(
      `group-studies/${groupStudyId}/threads/${threadId}/comments/${commentId}`,
      {
        content,
      },
    );

    if (data.statusCode !== 200) {
      throw new Error('Failed to fetch post');
    }

    return data.content;
  } catch (err) {
    console.error('Error fetching post:', err);
    throw err;
  }
};
