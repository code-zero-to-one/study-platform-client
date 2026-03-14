import type {
  MentorOperationStatus,
  MentorScreeningStatus,
} from '@/types/mentoring/admin-domain';
import type { MentoringMethodType } from '@/types/mentoring/domain';

export const mentoringLifecycleQueryKeys = {
  all: ['mentoring', 'lifecycle'] as const,
  dashboards: () => [...mentoringLifecycleQueryKeys.all, 'dashboard'] as const,
  myDashboards: () => mentoringLifecycleQueryKeys.dashboards(),
  myDashboard: (params: {
    page?: number;
    size?: number;
    status?: string;
    method?: MentoringMethodType;
  }) => [...mentoringLifecycleQueryKeys.dashboards(), params] as const,
  requests: () => [...mentoringLifecycleQueryKeys.all, 'requests'] as const,
  requestDetail: (requestId: string) =>
    [...mentoringLifecycleQueryKeys.requests(), requestId] as const,
  noteConsultations: () =>
    [...mentoringLifecycleQueryKeys.all, 'note-consultations'] as const,
  noteConsultationList: (params: {
    requestId?: string;
    mentorId?: number;
    memberId?: number;
  }) => [...mentoringLifecycleQueryKeys.noteConsultations(), params] as const,
  mentorWorkspaces: () =>
    [...mentoringLifecycleQueryKeys.all, 'mentor-workspaces'] as const,
  mentorWorkspace: (mentorId?: number) =>
    [
      ...mentoringLifecycleQueryKeys.mentorWorkspaces(),
      mentorId ?? 'me',
    ] as const,
  admin: () => [...mentoringLifecycleQueryKeys.all, 'admin'] as const,
  adminMetrics: () =>
    [...mentoringLifecycleQueryKeys.admin(), 'overview'] as const,
  adminOverviews: () => mentoringLifecycleQueryKeys.adminMetrics(),
  adminMentors: (params?: {
    page?: number;
    size?: number;
    mentorId?: number;
    screeningStatus?: MentorScreeningStatus;
    operationStatus?: MentorOperationStatus;
  }) => [...mentoringLifecycleQueryKeys.admin(), 'mentors', params ?? {}] as const,
  adminMentorDetail: (
    mentorId: number,
    params?: {
      requestsPage?: number;
      requestsSize?: number;
      sessionsPage?: number;
      sessionsSize?: number;
      reviewsPage?: number;
      reviewsSize?: number;
    },
  ) =>
    [
      ...mentoringLifecycleQueryKeys.admin(),
      'mentors',
      mentorId,
      params ?? {},
    ] as const,
  adminOverview: () => mentoringLifecycleQueryKeys.adminMetrics(),
};
