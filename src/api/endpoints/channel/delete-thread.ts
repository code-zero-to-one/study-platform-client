import { axiosInstance } from '@/api/client/axios';
import { DeleteThreadReqeust } from '@/types/api/channel.types';

export const deleteThread = async (param: DeleteThreadReqeust) => {
  const { groupStudyId, threadId } = param;

  try {
    const { data } = await axiosInstance.delete(
      `group-studies/${groupStudyId}/threads/${threadId}`,
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
