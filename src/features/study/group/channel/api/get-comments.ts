import { axiosInstance } from '@/shared/tanstack-query/axios';
import { GetCommentsRequest } from './types';

export const getComments = async (param: GetCommentsRequest) => {
  const { groupStudyId, threadId } = param;

  try {
    const { data } = await axiosInstance.get(
      `group-studies/${groupStudyId}/threads/${threadId}/comments`,
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
