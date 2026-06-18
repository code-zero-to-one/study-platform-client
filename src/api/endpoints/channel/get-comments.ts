import { axiosInstance } from '@/api/client/axios';
import {
  GetCommentsRequest,
  PaginatedCommentsResponse,
} from '@/types/api/channel.types';

export const getComments = async (
  param: GetCommentsRequest,
): Promise<PaginatedCommentsResponse> => {
  const { groupStudyId, threadId } = param;

  try {
    const { data } = await axiosInstance.get(
      `group-studies/${groupStudyId}/threads/${threadId}/comments`,
    );

    if (data.statusCode !== 200) {
      throw new Error('Failed to fetch comments');
    }

    return data.content;
  } catch (err) {
    console.error('Error fetching comments:', err);
    throw err;
  }
};
