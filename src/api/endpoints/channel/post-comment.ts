import { axiosInstance } from '@/api/client/axios';
import { PostCommentRequest } from '@/types/api/channel.types';

export const postComment = async (param: PostCommentRequest) => {
  const { groupStudyId, content, threadId } = param;

  try {
    const { data } = await axiosInstance.post(
      `group-studies/${groupStudyId}/threads/${threadId}/comments`,
      {
        content,
      },
    );

    if (data.statusCode !== 201) {
      throw new Error('Failed to fetch post');
    }

    return data.content;
  } catch (err) {
    console.error('Error fetching post:', err);
    throw err;
  }
};
