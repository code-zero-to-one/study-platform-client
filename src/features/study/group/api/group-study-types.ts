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
