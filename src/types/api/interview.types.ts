export type StudyProgressStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETE'
  | 'ABSENT';

// 오늘의 스터디 상세조회 관련 타입
export interface DailyStudyDetail {
  dailyStudyId: number;
  interviewerId: number;
  interviewerName: string;
  interviewerRealName?: string;
  interviewerImage: string;
  intervieweeId: number;
  intervieweeName: string;
  intervieweeRealName?: string;
  intervieweeImage: string;
  partnerTel: string;
  studySpaceId: number;
  progressStatus: StudyProgressStatus;
  subject: string;
  description: string;
  link: string;
  feedback: string;
}

// 스터디 면접 준비 타입
export interface PrepareStudyRequest {
  subject: string;
  link: string;
}

// 스터디 면접 완료 타입
export interface CompleteStudyRequest {
  feedback: string;
  progressStatus: StudyProgressStatus;
}
