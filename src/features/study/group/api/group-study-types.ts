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
export type TargetRole = 'PLANNER' | 'BACKEND' | 'FRONTEND' | 'DESIGNER';
export type ExperienceLevel =
  | 'JUNIOR'
  | 'MIDDLE'
  | 'SENIOR'
  | 'BEGINNER'
  | 'JOB_SEEKER';
export type Method = 'ONLINE' | 'OFFLINE';
export type RegularMeeting =
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'TRIPLE_WEEKLY_OR_MORE'
  | 'NONE';

export interface BasicInfo {
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
  basicInfo: BasicInfo;
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

export interface GroupStudyDetailRequest {
  groupStudyId: number;
}

export interface GroupStudyDetail {
  basicInfo: BasicInfo;
  detailInfo: DetailInfo;
  interviewPost: InterviewPost;
}

export interface ExtendedBasicInfoDetail
  extends Omit<
    BasicInfo,
    | 'type'
    | 'hostType'
    | 'targetRoles'
    | 'experienceLevels'
    | 'method'
    | 'regularMeeting'
    | 'status'
  > {
  type: 'PROJECT' | 'STUDY' | string;
  hostType: 'GENERAL' | 'ADMIN' | string;
  targetRoles: ('PLANNER' | 'BACKEND' | 'FRONTEND' | string)[];
  experienceLevels: ('JUNIOR' | 'MIDDLE' | 'SENIOR' | string)[];
  method: 'ONLINE' | 'OFFLINE' | 'HYBRID' | string;
  regularMeeting: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | string;
  status: 'RECRUITING' | 'CLOSED' | 'COMPLETED' | string;
}

export interface DetailInfo {
  image: Image;
  title: string;
  description: string;
  summary: string;
  thumbnailUploadUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Image {
  imageId: number;
  resizedImages: ResizedImage[];
}

export interface ResizedImage {
  resizedImageId: number;
  resizedImageUrl: string;
  imageSizeType: ImageSizeType;
}

export interface InterviewPost {
  interviewPost: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
