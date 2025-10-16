export type ApplyStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ApplyRole = 'LEADER' | 'PARTICIPANT';

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

export interface Applicant {
  memberId: number;
  memberName: string;
  profileImage: ProfileImage;
  sincerityTemp: SincerityTemp;
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

export interface GroupStudy {
  groupStudyId: number;
  title: string;
  description: string;
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

// api DTO
export interface getApplicantsByStatusRequest {
  groupStudyId: number;
  page: number;
  size: number;
  status: ApplyStatus;
}

export interface getApplicantsByStatusResponse {
  content: GroupStudyApply[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface updateApplicantByStatusRequest {
  applyId: number;
  groupStudyId: number;
  status?: ApplyStatus;
}
