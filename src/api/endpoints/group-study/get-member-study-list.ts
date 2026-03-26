import { isAxiosError } from 'axios';
import { axiosInstance } from '@/api/client/axios';
import type {
  MemberStudyItem,
  MemberStudyListRequest,
  MemberStudyListResponse,
  MemberStudyListV2Request,
  MemberStudyPageResponse,
} from '@/types/api/group-study.types';

const EMPTY_RESPONSE: MemberStudyListResponse = {
  notCompleted: null,
  completed: {
    content: [] as MemberStudyItem[],
    page: 1,
    size: 0,
    totalElements: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  },
};

const DEFAULT_PARAMS: Omit<MemberStudyListRequest, 'memberId'> = {
  studyType: 'BOTH',
  studyStatus: 'BOTH',
  inProgressPage: 1,
  inProgressPageSize: 3,
  completedPage: 1,
  completedPageSize: 6,
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
  try {
    const definedParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined),
    );
    const res = await axiosInstance.get(`/members/${memberId}/studies`, {
      params: toKebabParams({ ...DEFAULT_PARAMS, ...definedParams }),
    });

    return res.data.content;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 400) {
      return EMPTY_RESPONSE;
    }
    throw error;
  }
};

const EMPTY_PAGE_RESPONSE: MemberStudyPageResponse = {
  content: [] as MemberStudyItem[],
  page: 1,
  size: 0,
  totalElements: 0,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
};

const DEFAULT_V2_PARAMS: Omit<MemberStudyListV2Request, 'memberId'> = {
  studyType: 'BOTH',
  studyStatus: 'NOT_COMPLETED',
  page: 1,
  pageSize: 6,
};

export const getMemberStudyListV2 = async ({
  memberId,
  ...params
}: MemberStudyListV2Request): Promise<MemberStudyPageResponse> => {
  try {
    const definedParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined),
    );
    // axiosInstance의 baseURL이 /api/v1/이므로, 절대 URL로 v2 경로 우회
    const res = await axiosInstance.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v2/members/${memberId}/studies`,
      {
        params: toKebabParams({
          ...DEFAULT_V2_PARAMS,
          ...definedParams,
        }),
      },
    );

    return res.data.content;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 400) {
      return EMPTY_PAGE_RESPONSE;
    }
    throw error;
  }
};
