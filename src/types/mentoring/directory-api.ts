import type { MentorProfile, MentorSortType } from '@/types/mentoring/domain';

export interface MentorDirectoryRequestParams {
  keyword?: string;
  sortType?: MentorSortType;
}

export interface MentorDirectoryResponse {
  mentors: MentorProfile[];
}

export type MentorDirectoryListParams = MentorDirectoryRequestParams;
export type MentorDirectoryListResponse = MentorDirectoryResponse;
