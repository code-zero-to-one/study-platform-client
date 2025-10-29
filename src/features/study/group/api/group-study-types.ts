import {
  EXPERIENCE_LEVEL_OPTIONS,
  REGULAR_MEETINGS,
  STUDY_METHODS,
  STUDY_TYPES,
  TARGET_ROLE_OPTIONS,
  THUMBNAIL_EXTENSION,
} from '../const/group-study-const';

// 그룹 스터디 신청 상태
export type ApplicationStatus =
  | 'PENDING' // 승인 대기
  | 'APPROVED' // 승인 수락
  | 'REJECTED' // 승인 거절
  | 'KICKED' // 강퇴
  | 'EXIT'; // 탈퇴
export type GroupStudyStatus = 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED';
export type GroupStudyType = 'PROJECT' | 'STUDY';
export type HostType = 'ZEROONE' | 'GENERAL' | 'METOR';
export type Method = 'ONLINE' | 'OFFLINE';

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

export interface BasicInfoDetail extends BasicInfo {
  groupStudyId: number;
  hostType: HostType;
  status: GroupStudyStatus;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  kickedCount: number;
  deletedAt: string | null;
  leader: Leader;
}

export interface Leader {
  memberId: number;
  memberName: string;
  profileImage: ProfileImage | null;
  simpleIntroduction: string | null;
}

export interface ProfileImage {
  imageId: number;
  resizedImages: ResizedImage[];
}

export interface ResizedImage {
  resizedImageId: number;
  resizedImageUrl: string;
  imageSizeType: ImageSizeType;
}

export interface DetailInfo {
  title: string;
  description: string;
  summary: string;
  thumbnailExtension: ThumbnailExtension;
}

export interface SimpleDetailInfo {
  thumbnail: Thumbnail;
  title: string;
  summary: string;
}

export interface Thumbnail {
  imageId: number;
  resizedImages: ResizedImage[];
}

export interface ResizedImage {
  resizedImageId: number;
  resizedImageUrl: string;
  imageSizeType: ImageSizeType;
}

export interface ImageSizeType {
  imageTypeName: 'ORIGINAL' | 'SMALL' | 'MEDIUM' | 'LARGE';
  width: number | null;
  height: number | null;
}

export interface GroupStudyData {
  basicInfo: BasicInfoDetail;
  simpleDetailInfo: SimpleDetailInfo;
}

export interface InterviewPost {
  interviewPost: string[];
}

// 그룹 스터디 신청 Request 타입
export interface ApplyGroupStudyRequest {
  groupStudyId: number;
  answer: string[];
}

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** 상세 화면용 DetailInfo (기존 DetailInfo 확장) */
export interface DetailInfoDetail extends DetailInfo, Timestamps {
  /** 서버가 내려주는 원본/대표 이미지 경로 (없을 수 있음) */
  image: string | null;
  /** 썸네일 업로드용 URL (없을 수 있음) */
  thumbnailUploadUrl: string | null;
}

/** 상세 화면용 InterviewPost (기존 InterviewPost 확장) */
export interface InterviewPostDetail extends InterviewPost, Timestamps {}

// 그룹 스터디 신청 Response 타입
export interface ApplyGroupStudyResponse {
  applyId: number;
  applicantId: number;
  groupStudyId: number;
  status: ApplicationStatus;
  createdAt: string;
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
export interface GroupStudyDetailResponse {
  basicInfo: BasicInfoDetail; // 이미 상세용으로 확장된 타입
  detailInfo: DetailInfoDetail; // DetailInfo 확장
  interviewPost: InterviewPostDetail; // InterviewPost 확장
}

export type DeleteGroupStudyRequest = GroupStudyDetailRequest;

// 그룹 스터디 참여자 목록 API 타입
export interface GroupStudyMembersRequest {
  id: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface GroupStudyMembersResponse {
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  members: GroupStudyMember[];
}

export interface GroupStudyMember {
  id: number;
  profileImageUrl: string | null;
  memberName: string;
  progress: MemberProgress;
  ranking: number;
  greeting: string | null;
  lastAccessedAt: string; // ISO datetime string
}

export interface MemberProgress {
  score: number;
  progressHistory: ProgressHistoryItem[];
}

export interface ProgressHistoryItem {
  id: number;
  acquiredAt: string; // ISO datetime string
  grade: Grade;
  reason: string;
}

export interface Grade {
  id: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  code: 'A+' | 'A-' | 'B+' | 'B-' | 'C+' | 'C-' | 'F'; // e.g. "A+", "C+"
  name: string; // e.g. "Great", "Cheer up"
  score: 4.5 | 4 | 3.5 | 3 | 2.5 | 2 | 0;
}

// 가입인사 작성&수정 API 타입
export interface UpdateGreetingRequest {
  groupStudyId: number; // 그룹 스터디 ID
  content: string; // 20~100자 문자열
}

// 진행점수 부여/수정 API 타입
export interface UpdateProgressScoreRequest {
  groupStudyId: number;
  targetMemberId: number;
  gradeId: number;
  reason: string;
}

// 진행점수 등급 목록 조회 API 타입
export interface ProgressGradesResponse {
  grades: Grade[];
}

// 그룹 스터디 내 상태 조회 API 타입
export interface GroupStudyMyStatusRequest {
  groupStudyId: number;
}

export interface GroupStudyMyStatusResponse {
  status: ApplicationStatus;
  reason: string;
}

// 그룹스터디 참여자 추방 API 타입
export interface DeleteGroupStudyMemberRequest {
  groupStudyId: number;
  targetMemberId: number;
  reason: string;
}

// 회원의 스터디 리스트 조회 API 타입
export interface MemberStudyListRequest {
  memberId: number;
  studyType?: 'BOTH' | 'GROUP_STUDY' | 'ONE_ON_ONE_STUDY';
  studyStatus?: 'BOTH' | 'NOT_COMPLETED' | 'COMPLETED';
  inProgressPage?: number;
  inProgressPageSize?: number;
  completedPage?: number;
  completedPageSize?: number;
}

export interface Thumbnail {
  imageId: number;
  resizedImages: ResizedImage[];
}

export interface StudyItem {
  studyId: number;
  thumbnail: Thumbnail;
  maxMembersCount: number;
  participantsCount: number;
  startTime: string;
  endTime: string;
  studyRole: string;
  status: 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED';
  type: 'GROUP_STUDY' | 'ONE_ON_ONE_STUDY';
}

export interface MemberStudyListResponse {
  notCompleted: StudyItem[];
  completed: StudyItem[];
}
