'use client';

import { type ReadonlyURLSearchParams } from 'next/navigation';

const ENTRY_ONBOARDING_MENTORING_TITLE_SUFFIX = '커리어 성장 멘토링';
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
  const title = `${jobTitle.trim()} ${ENTRY_ONBOARDING_MENTORING_TITLE_SUFFIX}`;

  return title.slice(0, maxLength).trim();
};
