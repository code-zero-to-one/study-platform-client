import { axiosInstance } from '@/api/client/axios';
import { PostThreadRequest } from '@/types/api/channel.types';

export const postThread = async (param: PostThreadRequest) => {
  const { groupStudyId, content } = param;

  try {
    const { data } = await axiosInstance.post(
      `group-studies/${groupStudyId}/threads`,
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
