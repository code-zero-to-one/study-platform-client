export type StudyProgressStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETE'
  | 'ABSENT';

// 스터디 시작/종료 유무 타입
export type StudyStatus = 'RECRUITING' | 'STUDYING';

// 스터디 매칭 리스트 관련 타입
export interface GetDailyStudiesParams {
  cursor?: number;
  pageSize?: number;
  studyDate?: string;
}

export interface DailyStudy {
  interviewer: string;
  interviewerImage: string;
  interviewee: string;
  intervieweeImage: string;
  dailyStudyId: number;
  groupNum?: number;
  subject: string;
  description: string;
  link: string;
  progressStatus: StudyProgressStatus;
  studyDate: string;
  feedback: string | undefined;
}

export interface GetDailyStudiesResponse {
  items: DailyStudy[];
  nextCursor: number;
  hasNext: boolean;
}

// 캘린더 관련 타입
export interface GetMonthlyCalendarParams {
  year: number;
  month: number;
}

export interface StudyCalendarDay {
  day: number;
  hasStudy: boolean;
  status: StudyProgressStatus | undefined;
}

export interface MonthlyCalendarResponse {
  calendar: StudyCalendarDay[];
  monthlyCompletedCount?: number;
  totalCompletedCount?: number;
}

export interface WeeklyParticipationResponse {
  memberId: number;
  isParticipate: boolean;
}
