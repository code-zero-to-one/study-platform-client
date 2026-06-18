'use client';

import { type ReadonlyURLSearchParams } from 'next/navigation';
const MENTOR_REGISTRATION_ENTRY_FROM_LIST = 'mentor-list';

export const isMentorRegistrationEntryFromList = (
  searchParams: ReadonlyURLSearchParams,
) => {
  return searchParams.get('entry') === MENTOR_REGISTRATION_ENTRY_FROM_LIST;
};

export const buildMentoringTitleFromEntryOnboarding = (
  jobTitle: string,
  maxLength: number,
) => {
  return jobTitle.trim().slice(0, maxLength);
};
