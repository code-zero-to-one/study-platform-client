import { type ReactNode } from 'react';
import MentorCard from '@/features/mentoring/ui/mentor-directory/mentor-card';
import type { MentorProfile } from '@/types/mentoring/domain';

interface MentorDirectoryGridProps {
  leadMentors: MentorProfile[];
  remainingMentors: MentorProfile[];
  joinCard?: ReactNode;
}

export default function MentorDirectoryGrid({
  leadMentors,
  remainingMentors,
  joinCard,
}: MentorDirectoryGridProps) {
  return (
    <div className="grid grid-cols-1 items-start gap-250 md:grid-cols-2 xl:grid-cols-4">
      {leadMentors.map((mentor) => (
        <MentorCard key={mentor.id} mentor={mentor} />
      ))}

      {joinCard}

      {remainingMentors.map((mentor) => (
        <MentorCard key={mentor.id} mentor={mentor} />
      ))}
    </div>
  );
}
