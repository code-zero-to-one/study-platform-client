import type { MentorDirectoryRequestParams } from '@/types/mentoring/directory-api';
import type { MentorProfile } from '@/types/mentoring/domain';
import type { MentoringReview } from '@/types/mentoring/management-domain';

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
