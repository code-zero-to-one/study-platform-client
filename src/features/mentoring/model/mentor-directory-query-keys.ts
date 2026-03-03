import type {
  MentorDirectoryDetailQueryKey,
  MentorDirectoryMySettingsQueryKey,
  MentorDirectoryListQueryKey,
  MentorDirectoryListQueryParams,
  MentorRegistrationOptionsQueryKey,
} from '@/types/mentoring/directory-query';

export const mentorDirectoryQueryKeys = {
  all: ['mentoring'] as const,
  directories: () =>
    [...mentorDirectoryQueryKeys.all, 'mentor-directory'] as const,
  lists: () => [...mentorDirectoryQueryKeys.directories(), 'list'] as const,
  list: (
    params: MentorDirectoryListQueryParams,
  ): MentorDirectoryListQueryKey => [
    ...mentorDirectoryQueryKeys.lists(),
    params,
  ],
  details: () => [...mentorDirectoryQueryKeys.directories(), 'detail'] as const,
  detail: (mentorId: number): MentorDirectoryDetailQueryKey => [
    ...mentorDirectoryQueryKeys.details(),
    mentorId,
  ],
  mySettings: (): MentorDirectoryMySettingsQueryKey => [
    ...mentorDirectoryQueryKeys.directories(),
    'my-settings',
  ],
  registrationOptions: (): MentorRegistrationOptionsQueryKey => [
    ...mentorDirectoryQueryKeys.directories(),
    'registration-options',
  ],
};
