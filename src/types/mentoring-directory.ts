import type {
  MentorProfile,
  MentorSortType,
} from '@/types/mentoring-domain';
import type { MentoringReview } from '@/types/mentoring-management';

export interface MentorDirectoryRequestParams {
  keyword?: string;
  sortType?: MentorSortType;
}

export interface MentorDirectoryResponse {
  mentors: MentorProfile[];
}

export type MentorDirectoryQueryKey = readonly [
  'mentorDirectory',
  MentorDirectoryRequestParams,
];

export interface MentorDirectoryQuerySnapshot {
  createdMentorSignature: string;
  reviewSignature: string;
}

export interface MentorDirectoryListQueryParams {
  snapshot: MentorDirectoryQuerySnapshot;
  createdMentors: MentorProfile[];
  reviewsByMentor: Record<number, MentoringReview[]>;
}

export type MentorDirectoryListQueryKey = readonly [
  'mentoring',
  'mentor-directory',
  'list',
  string,
  string,
  MentorProfile[],
  Record<number, MentoringReview[]>,
];

export type MentorDirectoryDetailQueryKey = readonly [
  'mentoring',
  'mentor-directory',
  'detail',
  number,
  string,
  string,
];

export interface MentorCardProps {
  mentor: MentorProfile;
}

export interface MentorProfileListProps {
  initialKeyword?: string;
  initialSortType?: MentorSortType;
}
