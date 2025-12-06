import { axiosInstance } from '@/api/client/axios';
import { PostThreadReactionRequest } from './types';

export const postThreadReaction = async (params: PostThreadReactionRequest) => {
  const { threadId, groupStudyId, type } = params;

  try {
    const { data } = await axiosInstance.post(
      `group-studies/threads/${groupStudyId}/${threadId}/reactions`,
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
