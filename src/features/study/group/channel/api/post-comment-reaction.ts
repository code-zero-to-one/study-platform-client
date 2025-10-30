import { axiosInstance } from '@/shared/tanstack-query/axios';
import { PostCommentReactionRequest } from './types';

export const postCommentReaction = async (
  params: PostCommentReactionRequest,
) => {
  const { threadId, commentId, type } = params;

  try {
    const { data } = await axiosInstance.post(
      `group-studies/comments/${threadId}/${commentId}/reactions`,
      {
        type,
      },
    );
    if (data.statusCode !== 200) {
      throw new Error('Failed to fetch post');
    }
  } catch (err) {
    console.error('Error fetching post:', err);
    throw err;
  }
};
