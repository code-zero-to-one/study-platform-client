'use client';

import { useMemo } from 'react';
import {
  MENTOR_PROFILES,
  type MentorProfile,
  withMentorSettings,
} from '@/mocks/mentoring-mock-data';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';

const mergeMentors = (
  staticMentors: MentorProfile[],
  createdMentors: MentorProfile[],
) => {
  const mentorMap = new Map<number, MentorProfile>();

  [...createdMentors, ...staticMentors].forEach((mentor) => {
    mentorMap.set(mentor.id, withMentorSettings(mentor));
  });

  return Array.from(mentorMap.values());
};

export const useMentorDirectory = () => {
  const createdMentors = useMentorDirectoryStore(
    (state) => state.createdMentors,
  );
  const hasHydrated = useMentorDirectoryStore((state) => state.hasHydrated);

  const mentors = useMemo(() => {
    return mergeMentors(MENTOR_PROFILES, createdMentors);
  }, [createdMentors]);

  return {
    mentors,
    hasHydrated,
  };
};

export const findMentorById = (mentors: MentorProfile[], mentorId: number) => {
  return mentors.find((mentor) => mentor.id === mentorId);
};
