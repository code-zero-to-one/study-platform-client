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
export const EXTENSION_TO_MIME: Record<
  Uppercase<(typeof THUMBNAIL_EXTENSION)[number]>,
  string
> = {
  DEFAULT: 'image/jpeg',
  JPG: 'image/jpeg',
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  WEBP: 'image/webp',
  SVG: 'image/svg+xml',
};

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

// 그룹 리스트 타입
export interface GroupStudyListRequest {
  page: number;
  size: number;
  status: GroupStudyStatus;
}

export interface ImageSizeType {
  imageTypeName: 'ORIGINAL' | 'SMALL' | 'MEDIUM' | 'LARGE';
  width: number | null;
  height: number | null;
}

export interface ResizedImage {
  resizedImageId: number;
  resizedImageUrl: string;
  imageSizeType: ImageSizeType;
}

export interface Thumbnail {
  imageId: number;
  resizedImages: ResizedImage[];
}

export interface SimpleDetailInfo {
  thumbnail: Thumbnail;
  title: string;
  summary: string;
}

export type GroupStudyStatus = 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED';
export type GroupStudyType = 'PROJECT' | 'STUDY';
export type HostType = 'ZEROONE' | 'GENERAL' | 'METOR';
export type Method = 'ONLINE' | 'OFFLINE';

export interface DetailBasicInfo {
  groupStudyId: number;
  type: GroupStudyType;
  hostType: HostType;
  targetRoles: TargetRole[];
  maxMembersCount: number;
  experienceLevels: ExperienceLevel[];
  method: Method;
  regularMeeting: RegularMeeting;
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  status: GroupStudyStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface GroupStudyData {
  basicInfo: DetailBasicInfo;
  simpleDetailInfo: SimpleDetailInfo;
  currentParticipantCount: number;
}

export interface GroupStudyListResponse {
  content: GroupStudyData[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
