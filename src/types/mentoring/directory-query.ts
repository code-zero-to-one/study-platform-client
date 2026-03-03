import type { MentorSortType } from '@/types/mentoring/domain';

export interface MentorDirectoryListQueryParams {
  keyword?: string;
  sortType?: MentorSortType;
}

export type MentorDirectoryListQueryKey = readonly [
  'mentoring',
  'mentor-directory',
  'list',
  MentorDirectoryListQueryParams,
];

export type MentorDirectoryDetailQueryKey = readonly [
  'mentoring',
  'mentor-directory',
  'detail',
  number,
];

export type MentorDirectoryMySettingsQueryKey = readonly [
  'mentoring',
  'mentor-directory',
  'my-settings',
];

export type MentorRegistrationOptionsQueryKey = readonly [
  'mentoring',
  'mentor-directory',
  'registration-options',
];
