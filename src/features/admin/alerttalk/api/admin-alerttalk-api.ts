import { axiosInstanceV5 } from '@/api/client/axios';
import type {
  AdminAlerttalkDeliveryLog,
  AdminAlerttalkDeliveryLogDetail,
  AdminAlerttalkDeliveryLogFilters,
  AdminAlerttalkDeliveryLogListResponse,
  AdminAlerttalkDryRunRequest,
  AdminAlerttalkDryRunResponse,
  AdminAlerttalkRetryRequest,
  AdminAlerttalkRetryResponse,
  AdminAlerttalkTemplateListParams,
  AdminAlerttalkTemplateListResponse,
  AdminAlerttalkTemplateSyncRequest,
  AdminAlerttalkTemplateSyncResponse,
  AdminAlerttalkTemplateTestSendRequest,
  AdminAlerttalkTemplateTestSendResponse,
  ApiBaseResponse,
} from '@/features/admin/alerttalk/model/admin-alerttalk-contract';

type ApiEnvelope<T> = ApiBaseResponse<T> | { data?: ApiBaseResponse<T> };

const isApiBaseResponse = <T>(value: unknown): value is ApiBaseResponse<T> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'statusCode' in value &&
    'timestamp' in value &&
    'content' in value
  );
};

const unwrap = <T>(response: ApiEnvelope<T>): T => {
  if ('data' in response && isApiBaseResponse<T>(response.data)) {
    return response.data.content;
  }

  if (isApiBaseResponse<T>(response)) {
    return response.content;
  }

  throw new Error('API 응답 본문 형식이 올바르지 않습니다.');
};

const normalizeDeliveryLogs = (
  response: AdminAlerttalkDeliveryLogListResponse | AdminAlerttalkDeliveryLog[],
): AdminAlerttalkDeliveryLogListResponse => {
  if (Array.isArray(response)) {
    return { logs: response };
  }

  return response;
};

export const getAdminAlerttalkTemplates = async (
  params: AdminAlerttalkTemplateListParams,
): Promise<AdminAlerttalkTemplateListResponse> => {
  const response = await axiosInstanceV5.get<
    ApiBaseResponse<AdminAlerttalkTemplateListResponse>
  >('admin/alerttalk/templates', { params });

  return unwrap(response);
};

export const syncAdminAlerttalkTemplates = async (
  request: AdminAlerttalkTemplateSyncRequest = {},
): Promise<AdminAlerttalkTemplateSyncResponse> => {
  const response = await axiosInstanceV5.post<
    ApiBaseResponse<AdminAlerttalkTemplateSyncResponse>
  >('admin/alerttalk/templates/sync', request);

  return unwrap(response);
};

export const testSendAdminAlerttalkTemplate = async ({
  templateKey,
  request,
}: {
  templateKey: string;
  request: AdminAlerttalkTemplateTestSendRequest;
}): Promise<AdminAlerttalkTemplateTestSendResponse> => {
  const response = await axiosInstanceV5.post<
    ApiBaseResponse<AdminAlerttalkTemplateTestSendResponse>
  >(`admin/alerttalk/templates/${templateKey}/test-send`, request);

  return unwrap(response);
};

export const getAdminAlerttalkDeliveryLogs = async (
  filters: AdminAlerttalkDeliveryLogFilters,
): Promise<AdminAlerttalkDeliveryLogListResponse> => {
  const response = await axiosInstanceV5.get<
    ApiBaseResponse<
      AdminAlerttalkDeliveryLogListResponse | AdminAlerttalkDeliveryLog[]
    >
  >('admin/alerttalk/delivery-logs', { params: filters });

  return normalizeDeliveryLogs(unwrap(response));
};

export const getAdminAlerttalkDeliveryLogDetail = async (
  jobId: number,
): Promise<AdminAlerttalkDeliveryLogDetail> => {
  const response = await axiosInstanceV5.get<
    ApiBaseResponse<AdminAlerttalkDeliveryLogDetail>
  >(`admin/alerttalk/delivery-logs/${jobId}`);

  return unwrap(response);
};

export const retryAdminAlerttalkDeliveryLog = async ({
  jobId,
  request,
}: {
  jobId: number;
  request: AdminAlerttalkRetryRequest;
}): Promise<AdminAlerttalkRetryResponse> => {
  const response = await axiosInstanceV5.post<
    ApiBaseResponse<AdminAlerttalkRetryResponse>
  >(`admin/alerttalk/delivery-logs/${jobId}/retry`, request);

  return unwrap(response);
};

export const dryRunAdminAlerttalkSchedule = async (
  request: AdminAlerttalkDryRunRequest,
): Promise<AdminAlerttalkDryRunResponse> => {
  const response = await axiosInstanceV5.post<
    ApiBaseResponse<AdminAlerttalkDryRunResponse>
  >('admin/alerttalk/schedules/dry-run', request);

  return unwrap(response);
};
