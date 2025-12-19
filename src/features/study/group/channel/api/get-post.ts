import { axiosInstance } from '@/api/client/axios';
import { GetPostRequest, GetPostResponse } from './types';

export const getPost = async ({
  groupStudyId,
}: GetPostRequest): Promise<GetPostResponse> => {
  const { data } = await axiosInstance.get(
    `/group-studies/${groupStudyId}/notice`,
  );

  if (data.statusCode === 200) return data.content;

  throw new Error('Failed to fetch post');
};
