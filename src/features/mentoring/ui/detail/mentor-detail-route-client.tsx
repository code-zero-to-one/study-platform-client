'use client';

import { findMentorById } from '@/features/mentoring/model/use-mentor-directory';
import { useMentorDirectoryQuery } from '@/features/mentoring/model/use-mentor-directory-query';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
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
  const { memberId } = useAuthReady();
  const mentorIdByMember = useMentorDirectoryStore(
    (state) => state.mentorIdByMember,
  );

  if (!hasHydrated) {
    return <MentorRouteLoading />;
  }

  const mentor = findMentorById(mentors, mentorId);
  const myMentorId = memberId ? mentorIdByMember[memberId] : undefined;
  const isOwnMentorProfile = myMentorId === mentorId;

  if (!mentor) {
    return <MentorNotFoundState />;
  }

  return (
    <MentorDetailPage
      mentor={mentor}
      showSettingsEditButton={isOwnMentorProfile}
    />
  );
}
