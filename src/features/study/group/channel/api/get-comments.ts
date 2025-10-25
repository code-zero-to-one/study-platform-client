import { axiosInstance } from '@/shared/tanstack-query/axios';
import { GetCommentsRequest, GetCommentsResponse } from './types';

export const getComments = async (
  param: GetCommentsRequest,
): Promise<GetCommentsResponse[]> => {
  const { groupStudyId, threadId } = param;

  try {
    const { data } = await axiosInstance.get(
      `group-studies/${groupStudyId}/threads/${threadId}/comments`,
    );

    if (data.statusCode !== 200) {
      throw new Error('Failed to fetch post');
    }

    return data.content.content;
  } catch (err) {
    console.error('Error fetching post:', err);
    throw err;
  }
};
