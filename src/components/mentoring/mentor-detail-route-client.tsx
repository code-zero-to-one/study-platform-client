'use client';

import {
  findMentorById,
  useMentorDirectory,
} from '@/features/mentoring/model/use-mentor-directory';
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
  const { mentors, hasHydrated } = useMentorDirectory();

  if (!hasHydrated) {
    return <MentorRouteLoading />;
  }

  const mentor = findMentorById(mentors, mentorId);

  if (!mentor) {
    return <MentorNotFoundState />;
  }

  return <MentorDetailPage mentor={mentor} />;
}
