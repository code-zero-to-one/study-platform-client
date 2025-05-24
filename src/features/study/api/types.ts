export type StudyProgressStatus =
  | 'BEFORE_PROGRESSED'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETE'
  | 'ABSENT';

export interface DailyStudy {
  interviewer: string;
  interviewee: string;
  subject: string;
  feedBack: string | null;
  progressStatus: StudyProgressStatus;
  link: string;
}

export interface GetDailyStudiesParams {
  cursor?: number;
  pageSize?: number;
  planTime?: string;
}

export interface GetDailyStudiesResponse {
  dailyStudyResponses: DailyStudy[];
}
