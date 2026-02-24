'use client';

import { findMentorById } from '@/features/mentoring/model/use-mentor-directory';
import { useMentorDirectoryQuery } from '@/features/mentoring/model/use-mentor-directory-query';
import MentorDetailPage from './mentor-detail-page';
import {
  MentorNotFoundState,
  MentorRouteLoading,
} from './mentor-route-fallback';

interface MentorDetailRouteClientProps {
  mentorId: number;
}

export default function MentorDetailRouteClient({
  mentorId,
}: MentorDetailRouteClientProps) {
  const { mentors, hasHydrated } = useMentorDirectoryQuery();

  if (!hasHydrated) {
    return <MentorRouteLoading />;
  }

  const mentor = findMentorById(mentors, mentorId);

  if (!mentor) {
    return <MentorNotFoundState />;
  }

  return <MentorDetailPage mentor={mentor} />;
}
