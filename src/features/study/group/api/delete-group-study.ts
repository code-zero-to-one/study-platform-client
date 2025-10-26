import { axiosInstance } from '@/shared/tanstack-query/axios';
import { DeleteGroupStudyRequest } from './group-study-types';

export const deleteGroupStudy = async (param: DeleteGroupStudyRequest) => {
  const { groupStudyId } = param;

  try {
    const { data } = await axiosInstance.delete(
      `group-studies/${groupStudyId}`,
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
