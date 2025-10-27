import { axiosInstance } from '@/shared/tanstack-query/axios';
import { PostCommentRequest } from './types';

export const postComment = async (param: PostCommentRequest) => {
  const { groupStudyId, content, threadId } = param;

  console.log('param', param);

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

    console.log('등록');

    return data.content;
  } catch (err) {
    console.error('Error fetching post:', err);
    throw err;
  }
};
