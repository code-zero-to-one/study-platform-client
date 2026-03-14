import type { MentorSortType } from '@/types/mentoring/domain';
import type { MentorAvailabilityQueryParams } from '@/types/mentoring/availability';

export interface MentorDirectoryListQueryParams {
  keyword?: string;
  sortType?: MentorSortType;
  careerCodes?: string[];
  page?: number;
  size?: number;
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

export type MentorAvailabilityQueryKey = readonly [
  'mentoring',
  'mentor-directory',
  'availability',
  MentorAvailabilityQueryParams,
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

export type MentorEntryOnboardingStatusQueryKey = readonly [
  'mentoring',
  'mentor-directory',
  'entry-onboarding',
];
