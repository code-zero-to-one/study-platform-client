import {
  EXPERIENCE_LEVEL_OPTIONS,
  REGULAR_MEETINGS,
  STUDY_METHODS,
  STUDY_TYPES,
  TARGET_ROLE_OPTIONS,
  THUMBNAIL_EXTENSION,
} from '../const/group-study-const';

export type StudyType = (typeof STUDY_TYPES)[number];
export type TargetRole = (typeof TARGET_ROLE_OPTIONS)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVEL_OPTIONS)[number];
export type StudyMethod = (typeof STUDY_METHODS)[number];
export type RegularMeeting = (typeof REGULAR_MEETINGS)[number];
export type ThumbnailExtension = (typeof THUMBNAIL_EXTENSION)[number];

export interface BasicInfo {
  type: StudyType;
  targetRoles: TargetRole[];
  maxMembersCount: number;
  experienceLevels: ExperienceLevel[];
  method: StudyMethod;
  regularMeeting: RegularMeeting;
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface DetailInfo {
  title: string;
  description: string;
  summary: string;
  thumbnailExtension: ThumbnailExtension;
}

export interface InterviewPost {
  interviewPost: string[];
}

export interface OpenGroupStudyRequest {
  basicInfo: BasicInfo;
  detailInfo: DetailInfo;
  interviewPost: InterviewPost;
  thumbnailExtension: ThumbnailExtension;
}
