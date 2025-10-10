// 그룹 스터디 신청 상태
type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'KICKED';

// 그룹 스터디 신청 Request 타입
export interface ApplyGroupStudyRequest {
  groupStudyId: number;
  answer: string[];
}

// 그룹 스터디 신청 Response 타입
export interface ApplyGroupStudyResponse {
  applyId: number;
  applicantId: number;
  groupStudyId: number;
  status: ApplicationStatus;
  createdAt: string;
}

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
