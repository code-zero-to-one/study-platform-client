import type {
  AutoRunMatchingRequestDtoTargetWeekEnum,
  AutoRunMatchingRequestDtoTemplateTypeEnum,
  AdminMatchingCreateRequestStatusEnum,
  AdminMatchingCreateRequestTypeEnum,
  MatchingSystemStatusResponseStatusEnum,
  ResetWeeklyMatchingResponse,
} from '@/api/openapi/models';

export type AdminMatchingTargetWeek = AutoRunMatchingRequestDtoTargetWeekEnum;
export type AdminMatchingTemplateType =
  AutoRunMatchingRequestDtoTemplateTypeEnum;
export type AdminMatchingScheduledDayOfWeek = 'SATURDAY' | 'SUNDAY';
export type AdminMatchingRequestStatus = AdminMatchingCreateRequestStatusEnum;
export type AdminMatchingRequestType = AdminMatchingCreateRequestTypeEnum;
export type AdminMatchingSystemStatus = MatchingSystemStatusResponseStatusEnum;

export const DEFAULT_ADMIN_MATCHING_SCHEDULED_DAY_OF_WEEK =
  'SATURDAY' as const satisfies AdminMatchingScheduledDayOfWeek;
export const DEFAULT_ADMIN_MATCHING_SCHEDULED_TIME = '18:00';

export interface AdminMatchingRequestItem {
  matchingRequestId: number;
  memberId: number;
  memberName?: string;
  partnerId: number;
  partnerName?: string;
  status: AdminMatchingRequestStatus;
  type: AdminMatchingRequestType;
  content?: string;
  weeklyPeriodIdentifier?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AdminMatchingRequestDetail = AdminMatchingRequestItem;

export interface AdminMatchingAdminOption {
  memberId: number;
  memberName: string;
  memberNickname?: string;
}

export interface AdminMatchingSchedulerConfig {
  enabled: boolean;
  autoCycleEndEnabled: boolean;
  adminId?: number;
  adminName?: string;
  scheduledDayOfWeek: AdminMatchingScheduledDayOfWeek;
  scheduledTime: string;
  templateType?: AdminMatchingTemplateType;
  matchingKValue?: number;
  numberOfNearestNeighbors?: number;
  chunkSize?: number;
  saveResultsChunkSize?: number;
  updatedAt?: string;
}

export interface AdminMatchingRequestListPage {
  content: AdminMatchingRequestItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type AdminMatchingResetSummary = ResetWeeklyMatchingResponse;
