export type StudyProgressStatus =
  | 'NONE'
  | 'BEFORE_PROGRESSED'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETE'
  | 'ABSENT';

export interface DailyStudy {
  interviewer: string;
  interviewerImage: string;
  interviewee: string;
  intervieweeImage: string;
  dailyStudyId: number;
  subject: string;
  description: string;
  link: string;
  progressStatus: StudyProgressStatus;
  studyDate: string;
  feedback: string | undefined;
}

export interface DailyStudyDetail {
  dailyStudyId: number;
  interviewerId: number;
  interviewerName: string;
  interviewerImage: string;
  intervieweeId: number;
  intervieweeName: string;
  intervieweeImage: string;
  studySpaceId: number;
  progressStatus: StudyProgressStatus;
  subject: string;
  description: string;
  link: string;
  feedback: string;
}

export interface GetDailyStudyDetailParams {
  studyDate: string;
}

export interface GetDailyStudyDetailParams2 {
  year: number;
  month: number;
  day: number;
}

export interface GetDailyStudiesParams {
  cursor?: number;
  pageSize?: number;
  year?: number;
  month?: number;
  day?: number;
}

export interface GetDailyStudiesResponse {
  items: DailyStudy[];
  nextCursor: number;
  hasNext: boolean;
}

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
  monthlyCompletedCount: number;
  totalCompletedCount: number;
}

export interface PostDailyRetrospectRequest {
  description: string;
  parentId: number;
}

export interface PostStudyDailyRequest {
  subject: string;
  description: string;
  link: string;
  privated: boolean;
  planTime: string;
}

export interface JoinStudyRequest {
  memberId: number;
  selfIntroduction?: string;
  studyPlan?: string;
  preferredStudySubjectId?: string;
  availableStudyTimeIds?: number[];
  techStackIds?: number[];
  tel?: string;
  githubLink?: string;
  blogOrSnsLink?: string;
}

export interface WeeklyParticipationResponse {
  memberId: number;
  isParticipate: boolean;
}
