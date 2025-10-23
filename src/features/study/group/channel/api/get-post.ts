import { axiosInstance } from '@/shared/tanstack-query/axios';
import { GetPostRequest } from './types';

export const getPost = async (param: GetPostRequest) => {
  const { groupStudyId } = param;

  try {
    const { data } = await axiosInstance.get(
      `group-studies/${groupStudyId}/notice`,
    );

    console.log('data', data);

    if (data.statusCode !== 200) {
      throw new Error('Failed to fetch post');
    }

    return data.content;
  } catch (err) {
    console.error('Error fetching post:', err);
    throw err;
  }
};
