import { axiosInstance } from '@/shared/tanstack-query/axios';
import { GetThreadsRequest } from './types';

export const getThreads = async (param: GetThreadsRequest) => {
  const { groupStudyId } = param;

  try {
    const { data } = await axiosInstance.get(
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
