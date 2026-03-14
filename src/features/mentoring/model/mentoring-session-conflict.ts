import dayjs from 'dayjs';
import type { MentoringSession } from '@/types/mentoring/management-domain';

const hasOverlap = (
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string,
) => {
  return (
    dayjs(firstStart).isBefore(dayjs(secondEnd)) &&
    dayjs(secondStart).isBefore(dayjs(firstEnd))
  );
};

export const hasSessionConflict = ({
  sessions,
  startsAt,
  endsAt,
  excludeSessionId,
}: {
  sessions: MentoringSession[];
  startsAt: string;
  endsAt: string;
  excludeSessionId?: string;
}) => {
  return sessions.some((session) => {
    if (session.status !== 'SCHEDULED') {
      return false;
    }
    if (excludeSessionId && session.id === excludeSessionId) {
      return false;
    }

    return hasOverlap(startsAt, endsAt, session.startsAt, session.endsAt);
  });
};
