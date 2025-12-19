import { axiosInstance } from '@/api/client/axios';
import { DeleteCommentRequest } from './types';

export const deleteComment = async (param: DeleteCommentRequest) => {
  const { groupStudyId, threadId, commentId } = param;

  try {
    const { data } = await axiosInstance.delete(
      `group-studies/${groupStudyId}/threads/${threadId}/comments/${commentId}`,
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
