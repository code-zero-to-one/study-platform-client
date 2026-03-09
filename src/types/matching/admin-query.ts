import type {
  AdminMatchingRequestStatus,
  AdminMatchingRequestType,
} from '@/types/matching/admin-domain';

export const DEFAULT_ADMIN_MATCHING_REQUEST_PAGE = 1;
export const DEFAULT_ADMIN_MATCHING_REQUEST_PAGE_SIZE = 20;

export interface AdminMatchingRequestListFilters {
  weeklyPeriodIdentifier?: string;
  status?: AdminMatchingRequestStatus;
  type?: AdminMatchingRequestType;
  searchKeyword?: string;
  page: number;
  pageSize: number;
}

export const adminMatchingQueryKeys = {
  all: ['admin', 'matching'] as const,
  adminMembers: () => [...adminMatchingQueryKeys.all, 'admin-members'] as const,
  schedulerConfig: () =>
    [...adminMatchingQueryKeys.all, 'scheduler-config'] as const,
  systemStatus: () => [...adminMatchingQueryKeys.all, 'system-status'] as const,
  requests: () => [...adminMatchingQueryKeys.all, 'requests'] as const,
  requestList: (filters: AdminMatchingRequestListFilters) =>
    [...adminMatchingQueryKeys.requests(), 'list', filters] as const,
  requestDetail: (matchingRequestId: number) =>
    [
      ...adminMatchingQueryKeys.requests(),
      'detail',
      matchingRequestId,
    ] as const,
};

export type AdminMatchingAdminMembersQueryKey = ReturnType<
  typeof adminMatchingQueryKeys.adminMembers
>;
export type AdminMatchingSchedulerConfigQueryKey = ReturnType<
  typeof adminMatchingQueryKeys.schedulerConfig
>;
export type AdminMatchingSystemStatusQueryKey = ReturnType<
  typeof adminMatchingQueryKeys.systemStatus
>;
export type AdminMatchingRequestListQueryKey = ReturnType<
  typeof adminMatchingQueryKeys.requestList
>;
export type AdminMatchingRequestDetailQueryKey = ReturnType<
  typeof adminMatchingQueryKeys.requestDetail
>;
