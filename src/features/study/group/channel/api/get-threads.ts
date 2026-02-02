import { axiosInstance } from '@/api/client/axios';
import { GetThreadsRequest, PaginatedThreadsResponse } from './types';

export const getThreads = async (
  param: GetThreadsRequest,
): Promise<PaginatedThreadsResponse> => {
  const { groupStudyId, page = 0, size = 10 } = param;

  try {
    const { data } = await axiosInstance.get(
      `group-studies/${groupStudyId}/threads`,
      { params: { page, size } },
    );

    if (data.statusCode !== 200) {
      throw new Error('Failed to fetch threads');
    }

    return data.content;
  } catch (err) {
    console.error('Error fetching threads:', err);
    throw err;
  }
};
