import { axiosInstance } from '@/shared/tanstack-query/axios';
import { PutThreadRequest } from './types';

export const putThread = async (param: PutThreadRequest) => {
  const { groupStudyId, threadId, content } = param;

  try {
    const { data } = await axiosInstance.put(
      `group-studies/${groupStudyId}/threads/${threadId}`,
      {
        content,
      },
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
