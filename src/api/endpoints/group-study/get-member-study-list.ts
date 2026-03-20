import { axiosInstance } from '@/api/client/axios';
import type {
  MemberStudyListRequest,
  MemberStudyListResponse,
} from '@/types/api/group-study.types';

const DEFAULT_PARAMS: Omit<MemberStudyListRequest, 'memberId'> = {
  studyType: 'BOTH',
  studyStatus: 'BOTH',
  inProgressPage: 1,
  inProgressPageSize: 9,
  completedPage: 1,
  completedPageSize: 9,
};

const toKebabParams = (params: Record<string, unknown>) => {
  const entries = Object.entries(params);
  const defined = entries.filter(([, v]) => v !== undefined);
  const kebabbed = defined.map(([k, v]) => [
    k.replace(/([A-Z])/g, '-$1').toLowerCase(),
    v,
  ]);

  return Object.fromEntries(kebabbed);
};

export const getMemberStudyList = async ({
  memberId,
  ...params
}: MemberStudyListRequest): Promise<MemberStudyListResponse> => {
  const res = await axiosInstance.get(`/members/${memberId}/studies`, {
    params: toKebabParams({ ...DEFAULT_PARAMS, ...params }),
  });

  return res.data.content;
};
