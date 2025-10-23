import { axiosInstance } from '@/shared/tanstack-query/axios';
import { PostThreadRequest } from './types';

export const postComment = async (param: PostThreadRequest) => {
  const { groupStudyId } = param;

  try {
    const { data } = await axiosInstance.post(
      `group-studies/${groupStudyId}/threads`,
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
