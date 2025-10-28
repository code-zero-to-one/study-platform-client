import { axiosInstance } from '@/shared/tanstack-query/axios';
import { PostThreadReactionReqeust } from './types';

export const postThreadReaction = async (param: PostThreadReactionReqeust) => {
  const { groupStudyId, threadId, type } = param;

  console.log(type);

  try {
    const { data } = await axiosInstance.post(
      `group-studies/threads/${groupStudyId}/${threadId}/reactions`,
      {
        type,
      },
    );

    if (data.statusCode !== 200) {
      throw new Error('Failed to fetch post');
    }

    console.log('실행');

    return data.content;
  } catch (err) {
    console.error('Error fetching post:', err);
    throw err;
  }
};
