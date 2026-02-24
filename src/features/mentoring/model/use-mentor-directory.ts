'use client';

import type { MentorProfile } from '@/types/mentoring/domain';
import { useMentorDirectoryQuery } from './use-mentor-directory-query';

export const useMentorDirectory = () => {
  const mentorDirectoryQuery = useMentorDirectoryQuery();

  return {
    mentors: mentorDirectoryQuery.mentors,
    hasHydrated: mentorDirectoryQuery.hasHydrated,
  };
};

export const findMentorById = (mentors: MentorProfile[], mentorId: number) => {
  return mentors.find((mentor) => mentor.id === mentorId);
};
