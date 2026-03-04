import { ApiError } from '@/api/client/api-error';
import { axiosInstance } from '@/api/client/axios';
import type { MentorSortType } from '@/types/mentoring/domain';
import type { MentorRegistrationFormValues } from '@/types/schemas/mentor-registration-schema';
import { requireInteger, requireObject } from './mentor-api-contract';
import type {
  ApiResponse,
  MentorIntroImageUploadUrlResponseDto,
  MentorSettingsUpsertRequestDto,
  MentorUpsertResponseDto,
} from './mentor-api.types';
import { mapMentorDetailContent } from './mentor-detail.mapper';
import { mapMentorListContent } from './mentor-list.mapper';
import {
  mapMentorEntryOnboardingStatusContent,
  type MentorEntryOnboardingStatus,
} from './mentor-onboarding.mapper';
import {
  buildMentorSettingsUpsertRequest,
  mapMyMentorSettingsContent,
  mapRegistrationOptionsContent,
  type MyMentorSettingsFoundResult,
  type MyMentorSettingsNotFoundResult,
  type MyMentorSettingsResult,
} from './mentor-settings.mapper';

const IMAGE_EXTENSION_MAP: Record<string, string> = {
  jpg: 'JPG',
  jpeg: 'JPEG',
  png: 'PNG',
  gif: 'GIF',
  webp: 'WEBP',
  svg: 'SVG',
};

const toTrimmedString = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const normalizeSortType = (sortType: MentorSortType | undefined) => {
  if (!sortType || sortType === 'default') {
    return undefined;
  }

  return sortType;
};

const normalizeCareerCodes = (careerCodes: string[] | undefined) => {
  if (!careerCodes || careerCodes.length === 0) {
    return undefined;
  }

  const normalized = Array.from(
    new Set(
      careerCodes
        .map((careerCode) => careerCode.trim())
        .filter((careerCode) => careerCode.length > 0),
    ),
  );

  return normalized.length > 0 ? normalized : undefined;
};

const serializeMentorListParams = (params: {
  keyword?: string;
  sortType?: string;
  careerCodes?: string[];
  page?: number;
  size?: number;
}) => {
  const query = new URLSearchParams();

  if (params.keyword) {
    query.append('keyword', params.keyword);
  }
  if (params.sortType) {
    query.append('sortType', params.sortType);
  }
  params.careerCodes?.forEach((careerCode) => {
    query.append('careerCodes', careerCode);
  });
  if (typeof params.page === 'number' && Number.isInteger(params.page)) {
    query.append('page', String(params.page));
  }
  if (typeof params.size === 'number' && Number.isInteger(params.size)) {
    query.append('size', String(params.size));
  }

  return query.toString();
};

const toImageExtension = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase().trim();
  if (!extension) {
    return 'DEFAULT';
  }

  return IMAGE_EXTENSION_MAP[extension] ?? 'DEFAULT';
};

export type {
  MentorEntryOnboardingStatus,
  MyMentorSettingsFoundResult,
  MyMentorSettingsNotFoundResult,
  MyMentorSettingsResult,
};

export const getMentorRegistrationOptions = async ({
  includeInactive = false,
}: {
  includeInactive?: boolean;
} = {}) => {
  const response = await axiosInstance.get<ApiResponse<unknown>>(
    '/mentors/registration/options',
    {
      params: {
        includeInactive: includeInactive ? true : undefined,
      },
    },
  );

  return mapRegistrationOptionsContent(response.data.content);
};

export const getMentorList = async ({
  keyword,
  sortType,
  careerCodes,
  page,
  size,
}: {
  keyword?: string;
  sortType?: MentorSortType;
  careerCodes?: string[];
  page?: number;
  size?: number;
} = {}) => {
  const normalizedCareerCodes = normalizeCareerCodes(careerCodes);
  const response = await axiosInstance.get<ApiResponse<unknown>>('/mentors', {
    params: {
      keyword: keyword?.trim() || undefined,
      sortType: normalizeSortType(sortType),
      careerCodes: normalizedCareerCodes,
      page: typeof page === 'number' ? page : undefined,
      size: typeof size === 'number' ? size : undefined,
    },
    paramsSerializer: {
      serialize: serializeMentorListParams,
    },
  });

  return mapMentorListContent(response.data.content);
};

export const getMentorDetail = async (mentorId: number) => {
  const response = await axiosInstance.get<ApiResponse<unknown>>(
    `/mentors/${mentorId}`,
  );

  return mapMentorDetailContent(response.data.content);
};

export const getMyMentorSettings = async (): Promise<MyMentorSettingsResult> => {
  try {
    const response = await axiosInstance.get<ApiResponse<unknown>>('/mentors/me');

    return mapMyMentorSettingsContent(response.data.content);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.statusCode === 403 || error.statusCode === 404) {
        return {
          kind: 'not_found',
        };
      }
    }

    throw error;
  }
};

export const upsertMyMentorSettings = async (
  values: MentorRegistrationFormValues,
) => {
  const payload: MentorSettingsUpsertRequestDto =
    buildMentorSettingsUpsertRequest(values);
  const response = await axiosInstance.put<ApiResponse<MentorUpsertResponseDto>>(
    '/mentors/me',
    payload,
  );
  const content = requireObject<MentorUpsertResponseDto>({
    value: response.data.content,
    scope: 'my-mentor-settings-response',
    field: 'content',
  });

  return {
    mentorId: requireInteger({
      value: content.mentorId,
      scope: 'my-mentor-settings-response',
      field: 'content.mentorId',
    }),
    created: content.created === true,
    updatedAt: toTrimmedString(content.updatedAt),
  };
};

export const getMentorEntryOnboardingStatus = async () => {
  const response = await axiosInstance.get<ApiResponse<unknown>>(
    '/mentors/onboarding/entry',
  );

  return mapMentorEntryOnboardingStatusContent(response.data.content);
};

export const markMentorEntryOnboardingSeen = async () => {
  const response = await axiosInstance.post<ApiResponse<unknown>>(
    '/mentors/onboarding/entry/seen',
  );

  return mapMentorEntryOnboardingStatusContent(response.data.content);
};

export const getMentorIntroImageUploadTicket = async ({
  fileName,
}: {
  fileName: string;
}) => {
  const response = await axiosInstance.post<
    ApiResponse<MentorIntroImageUploadUrlResponseDto>
  >('/mentors/me/intro-images/upload-url', undefined, {
    params: {
      extension: toImageExtension(fileName),
    },
  });

  const uploadUrl = toTrimmedString(response.data.content?.uploadUrl);
  const publicUrl = toTrimmedString(response.data.content?.publicUrl);

  if (!uploadUrl || !publicUrl) {
    throw new Error('이미지 업로드 URL 응답 형식이 올바르지 않습니다.');
  }

  return {
    uploadUrl,
    publicUrl,
  };
};
