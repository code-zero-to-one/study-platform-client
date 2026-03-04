import type { MentorProfile, MentorSortType } from '@/types/mentoring/domain';

export interface MentorCardProps {
  mentor: MentorProfile;
}

export interface MentorProfileListProps {
  initialKeyword?: string;
  initialSortType?: MentorSortType;
  initialCareerCodes?: string[];
}
