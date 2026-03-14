import type { MentorAvailabilityQueryParams } from '@/types/mentoring/availability';
import type {
  MentorAvailabilityQueryKey,
  MentorDirectoryDetailQueryKey,
  MentorDirectoryMySettingsQueryKey,
  MentorDirectoryListQueryKey,
  MentorDirectoryListQueryParams,
  MentorEntryOnboardingStatusQueryKey,
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
  availabilities: () =>
    [...mentorDirectoryQueryKeys.directories(), 'availability'] as const,
  availability: (
    params: MentorAvailabilityQueryParams,
  ): MentorAvailabilityQueryKey => [
    ...mentorDirectoryQueryKeys.availabilities(),
    params,
  ],
  mySettings: (): MentorDirectoryMySettingsQueryKey => [
    ...mentorDirectoryQueryKeys.directories(),
    'my-settings',
  ],
  registrationOptions: (): MentorRegistrationOptionsQueryKey => [
    ...mentorDirectoryQueryKeys.directories(),
    'registration-options',
  ],
  entryOnboarding: (): MentorEntryOnboardingStatusQueryKey => [
    ...mentorDirectoryQueryKeys.directories(),
    'entry-onboarding',
  ],
};
