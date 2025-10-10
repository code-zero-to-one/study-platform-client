export interface UpdateUserProfileRequest {
  name: string;
  tel: string;
  birthDate?: string;
  githubLink?: string;
  blogOrSnsLink?: string;
  simpleIntroduction?: string;
  mbti?: string;
  interests?: string[];
  profileImageExtension?: string;
}

export interface UpdateUserProfileResponse {
  memberId: number;
  name: string;
  profileImageUploadUrl: string;
  tel: string;
  githubLink: string;
  blogOrSnsLink: string;
  simpleIntroduction: string;
  mbti: string;
  birthDate: string;
  interests: {
    id: number;
    name: string;
  }[];
  hobbies: {
    id: number;
    name: string;
  }[];
}

export interface UpdateUserProfileInfoRequest {
  selfIntroduction: string;
  studyPlan: string;
  preferredStudySubjectId: string;
  availableStudyTimeIds: number[];
  techStackIds: number[];
}

export interface UpdateUserProfileInfoResponse {
  memberId: number;
  selfIntroduction: string;
  studyPlan: string;
  preferredStudySubjectId: string;
  techStackIds: number[];
}

export interface AvailableStudyTimeResponse {
  availableTimeId: number;
  display: string;
}

export interface StudySubjectResponse {
  studySubjectId: string;
  name: string;
}

export interface TechStackResponse {
  techStackId: number;
  code: string;
  techStackName: string;
  parentId: number | undefined;
  level: number;
}

export interface StudyActivity {
  totalParticipationDays: number;
  sequenceParticipationWeeks: number;
  maxSequenceParticipationWeeks: number;
  completedStudyCount: number;
  failureStudyCount: number;
}

export interface GrowthMetric {
  studyCompleteness: number;
}

export interface StudyDashboardResponse {
  studyActivity: StudyActivity;
  growthMetric: GrowthMetric;
}

export interface EntryListRequest {
  groupStudyId: number;
  page: number;
  size: number;
  status?: 'PENDING';
}

export interface EntryStatusRequest {
  groupStudyId: number;
  applyId: number;
  status: 'APPROVED' | 'REJECTED';
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

export interface ProfileImage {
  imageId: number;
  resizedImages: ResizedImage[];
}

export interface SincerityTemp {
  temperature: number;
  levelId: number;
  levelName: '1단계' | '2단계' | '3단계' | '4단계'; // 추후 서버 기준에 맞게 확장 가능
}

export interface Applicant {
  memberId: number;
  memberName: string;
  profileImage: ProfileImage;
  sincerityTemp: SincerityTemp;
}

export interface GroupStudy {
  groupStudyId: number;
  title: string;
  description: string;
}

export type ApplyRole = 'LEADER' | 'PARTICIPANT';
export type ApplyStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface GroupStudyApply {
  applyId: number;
  applicantInfo: Applicant;
  groupStudy: GroupStudy;
  progressScore: number;
  role: ApplyRole;
  lastAccessed: string;
  answer: string[];
  status: ApplyStatus;
  processedAt: string | null;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GroupStudyApplyListResponse {
  content: GroupStudyApply[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
