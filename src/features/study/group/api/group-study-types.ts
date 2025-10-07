export type GroupStudyStatus = 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED';

export interface GroupStudyListRequest {
  page: number;
  size: number;
  status: GroupStudyStatus;
}
