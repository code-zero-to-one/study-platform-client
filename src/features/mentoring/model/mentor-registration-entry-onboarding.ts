'use client';

import { type ReadonlyURLSearchParams } from 'next/navigation';

const ENTRY_ONBOARDING_MENTORING_TITLE_SUFFIX = '커리어 성장 멘토링';
const ENTRY_ONBOARDING_STORAGE_KEY_PREFIX =
  'mentor-registration-entry-onboarding-seen-v1';
const MENTOR_REGISTRATION_ENTRY_FROM_LIST = 'mentor-list';

const getEntryOnboardingStorageKey = (memberId: number) => {
  return `${ENTRY_ONBOARDING_STORAGE_KEY_PREFIX}:${memberId}`;
};

export const isMentorRegistrationEntryFromList = (
  searchParams: ReadonlyURLSearchParams,
) => {
  return searchParams.get('entry') === MENTOR_REGISTRATION_ENTRY_FROM_LIST;
};

export const hasSeenMentorRegistrationEntryOnboarding = (memberId: number) => {
  try {
    return (
      window.localStorage.getItem(getEntryOnboardingStorageKey(memberId)) === '1'
    );
  } catch {
    return false;
  }
};

export const markMentorRegistrationEntryOnboardingAsSeen = (
  memberId: number | undefined,
) => {
  if (!memberId) {
    return;
  }

  try {
    window.localStorage.setItem(getEntryOnboardingStorageKey(memberId), '1');
  } catch {
    // localStorage 접근이 막힌 환경에서는 저장 없이 진행합니다.
  }
};

export const buildMentoringTitleFromEntryOnboarding = (
  jobTitle: string,
  maxLength: number,
) => {
  const title = `${jobTitle.trim()} ${ENTRY_ONBOARDING_MENTORING_TITLE_SUFFIX}`;

  return title.slice(0, maxLength).trim();
};
